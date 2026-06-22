import { Router } from 'express';
import { PriceRequest } from '../models/PriceRequest';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/analytics/requests - Lista filtrada
router.get('/requests', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { vendedor, status, startDate, endDate, customer, product } = req.query;

    const filter: any = {};

    // Filtro por vendedor
    if (vendedor) {
      filter.requester_id = vendedor;
    }

    // Filtro por status (pode ser múltiplo, separado por vírgula)
    if (status) {
      const statusArray = (status as string).split(',');
      filter.status = { $in: statusArray };
    }

    // Filtro por data
    if (startDate || endDate) {
      filter.created_at = {};
      if (startDate) {
        filter.created_at.$gte = new Date(startDate as string);
      }
      if (endDate) {
        filter.created_at.$lte = new Date(endDate as string);
      }
    }

    // Filtro por cliente
    if (customer) {
      filter.$or = [
        { customer_code: { $regex: customer, $options: 'i' } },
        { customer_name: { $regex: customer, $options: 'i' } },
      ];
    }

    // Filtro por produto
    if (product) {
      filter.$or = [
        { product_id: { $regex: product, $options: 'i' } },
        { product_name: { $regex: product, $options: 'i' } },
      ];
    }

    // Restrição de escopo baseado no tipo de usuário
    if (req.user!.tipo === 'supervisor') {
      filter.codigo_supervisor = req.user!.codigo_supervisor;
    } else if (req.user!.tipo === 'vendedor') {
      filter.requester_id = req.user!._id;
    }

    const requests = await PriceRequest.find(filter).sort({ created_at: -1 });

    res.json(requests);
  } catch (error) {
    console.error('Erro ao listar solicitações filtradas:', error);
    res.status(500).json({ error: 'Erro ao listar solicitações' });
  }
});

// GET /api/analytics/summary - Contagens
router.get('/summary', requireAuth, async (req: AuthRequest, res) => {
  try {
    const filter: any = {};

    // Restrição de escopo baseado no tipo de usuário
    if (req.user!.tipo === 'supervisor') {
      filter.codigo_supervisor = req.user!.codigo_supervisor;
    } else if (req.user!.tipo === 'vendedor') {
      filter.requester_id = req.user!._id;
    }

    const total = await PriceRequest.countDocuments(filter);
    const aprovados = await PriceRequest.countDocuments({ ...filter, status: 'Aprovado' });
    const aprovadosGerencia = await PriceRequest.countDocuments({ ...filter, status: 'Aprovado pela Gerência' });
    const rejeitados = await PriceRequest.countDocuments({ ...filter, status: 'Reprovado' });
    const rejeitadosGerencia = await PriceRequest.countDocuments({ ...filter, status: 'Reprovado pela Gerência' });
    const pendentes = await PriceRequest.countDocuments({ ...filter, status: 'Pendente' });
    const aguardandoGerencia = await PriceRequest.countDocuments({ ...filter, status: 'Aguardando Gerência' });
    const alterados = await PriceRequest.countDocuments({ ...filter, status: 'Alterado' });
    const cancelados = await PriceRequest.countDocuments({ ...filter, status: 'Cancelado' });

    res.json({
      total,
      aprovados,
      aprovadosGerencia,
      rejeitados,
      rejeitadosGerencia,
      pendentes,
      aguardandoGerencia,
      alterados,
      cancelados,
    });
  } catch (error) {
    console.error('Erro ao gerar resumo:', error);
    res.status(500).json({ error: 'Erro ao gerar resumo' });
  }
});

// GET /api/analytics/by-product - Agrupamento por produto
router.get('/by-product', requireAuth, async (req: AuthRequest, res) => {
  try {
    const filter: any = {};

    // Restrição de escopo baseado no tipo de usuário
    if (req.user!.tipo === 'supervisor') {
      filter.codigo_supervisor = req.user!.codigo_supervisor;
    } else if (req.user!.tipo === 'vendedor') {
      filter.requester_id = req.user!._id;
    }

    const byProduct = await PriceRequest.aggregate([
      { $match: filter },
      {
        $group: {
          _id: {
            product_id: '$product_id',
            product_name: '$product_name',
          },
          count: { $sum: 1 },
          aprovados: {
            $sum: {
              $cond: [
                {
                  $in: ['$status', ['Aprovado', 'Aprovado pela Gerência']],
                },
                1,
                0,
              ],
            },
          },
          rejeitados: {
            $sum: {
              $cond: [
                {
                  $in: ['$status', ['Reprovado', 'Reprovado pela Gerência']],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      { $sort: { count: -1 } },
    ]);

    res.json(byProduct);
  } catch (error) {
    console.error('Erro ao agrupar por produto:', error);
    res.status(500).json({ error: 'Erro ao agrupar por produto' });
  }
});

// GET /api/analytics/by-vendedor - Desempenho por vendedor
router.get('/by-vendedor', requireAuth, async (req: AuthRequest, res) => {
  try {
    const filter: any = {};

    // Restrição de escopo baseado no tipo de usuário
    if (req.user!.tipo === 'supervisor') {
      filter.codigo_supervisor = req.user!.codigo_supervisor;
    } else if (req.user!.tipo === 'vendedor') {
      filter.requester_id = req.user!._id;
    }

    const byVendedor = await PriceRequest.aggregate([
      { $match: filter },
      {
        $group: {
          _id: {
            requester_id: '$requester_id',
            requester_name: '$requester_name',
          },
          count: { $sum: 1 },
          aprovados: {
            $sum: {
              $cond: [
                {
                  $in: ['$status', ['Aprovado', 'Aprovado pela Gerência']],
                },
                1,
                0,
              ],
            },
          },
          rejeitados: {
            $sum: {
              $cond: [
                {
                  $in: ['$status', ['Reprovado', 'Reprovado pela Gerência']],
                },
                1,
                0,
              ],
            },
          },
          pendentes: {
            $sum: {
              $cond: [
                {
                  $in: ['$status', ['Pendente', 'Aguardando Gerência']],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      { $sort: { count: -1 } },
    ]);

    res.json(byVendedor);
  } catch (error) {
    console.error('Erro ao agrupar por vendedor:', error);
    res.status(500).json({ error: 'Erro ao agrupar por vendedor' });
  }
});

// GET /api/analytics/by-period - Série temporal
router.get('/by-period', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { period = 'day' } = req.query; // day, week, month

    const filter: any = {};

    // Restrição de escopo baseado no tipo de usuário
    if (req.user!.tipo === 'supervisor') {
      filter.codigo_supervisor = req.user!.codigo_supervisor;
    } else if (req.user!.tipo === 'vendedor') {
      filter.requester_id = req.user!._id;
    }

    let dateFormat: any;
    switch (period) {
      case 'week':
        dateFormat = { $week: '$created_at' };
        break;
      case 'month':
        dateFormat = { $month: '$created_at' };
        break;
      default:
        dateFormat = { $dateToString: { format: '%Y-%m-%d', date: '$created_at' } };
    }

    const byPeriod = await PriceRequest.aggregate([
      { $match: filter },
      {
        $group: {
          _id: dateFormat,
          count: { $sum: 1 },
          aprovados: {
            $sum: {
              $cond: [
                {
                  $in: ['$status', ['Aprovado', 'Aprovado pela Gerência']],
                },
                1,
                0,
              ],
            },
          },
          rejeitados: {
            $sum: {
              $cond: [
                {
                  $in: ['$status', ['Reprovado', 'Reprovado pela Gerência']],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json(byPeriod);
  } catch (error) {
    console.error('Erro ao agrupar por período:', error);
    res.status(500).json({ error: 'Erro ao agrupar por período' });
  }
});

export default router;
