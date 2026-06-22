import { Router } from 'express';
import { z } from 'zod';
import { PriceRequest } from '../models/PriceRequest';
import {
  requireAuth,
  requireAdmin,
  requireSupervisor,
  requireGerente,
  requireAdminOrGerente,
  AuthRequest,
} from '../middleware/auth';

const router = Router();

// Schema de validação para criar solicitação
const createRequestSchema = z.object({
  customer_code: z.string(),
  customer_name: z.string(),
  product_id: z.string(),
  product_name: z.string(),
  requested_price: z.string(),
  quantity: z.string(),
  product_maximo: z.string(),
  product_minimo: z.string(),
  product_promocional: z.string(),
  notes: z.string().min(10),
  codigo_supervisor: z.string().optional(),
  nome_supervisor: z.string().optional(),
  subrede_batch_id: z.string().optional(),
  subrede_name: z.string().optional(),
  discount_percent: z.string().optional(),
  discounted_price: z.string().optional(),
});

// GET /api/requests/all - Lista todas (admin, últimos 14 dias)
router.get('/all', requireAdmin, async (req: AuthRequest, res) => {
  try {
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    const requests = await PriceRequest.find({
      created_at: { $gte: fourteenDaysAgo },
    }).sort({ created_at: -1 });

    res.json(requests);
  } catch (error) {
    console.error('Erro ao listar solicitações:', error);
    res.status(500).json({ error: 'Erro ao listar solicitações' });
  }
});

// GET /api/requests/supervisor - Lista do escopo do supervisor (últimos 14 dias)
router.get('/supervisor', requireSupervisor, async (req: AuthRequest, res) => {
  try {
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    const requests = await PriceRequest.find({
      codigo_supervisor: req.user!.codigo_supervisor,
      created_at: { $gte: fourteenDaysAgo },
    }).sort({ created_at: -1 });

    res.json(requests);
  } catch (error) {
    console.error('Erro ao listar solicitações do supervisor:', error);
    res.status(500).json({ error: 'Erro ao listar solicitações' });
  }
});

// GET /api/requests/gerente - Lista para gerente (últimos 30 dias)
router.get('/gerente', requireGerente, async (req: AuthRequest, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const requests = await PriceRequest.find({
      created_at: { $gte: thirtyDaysAgo },
    }).sort({ created_at: -1 });

    res.json(requests);
  } catch (error) {
    console.error('Erro ao listar solicitações para gerente:', error);
    res.status(500).json({ error: 'Erro ao listar solicitações' });
  }
});

// POST /api/requests - Criar nova solicitação
router.post('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const data = createRequestSchema.parse(req.body);

    const priceRequest = new PriceRequest({
      ...data,
      requester_name: req.user!.name,
      requester_id: req.user!._id,
      status: 'Pendente',
    });

    await priceRequest.save();

    res.status(201).json(priceRequest);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Dados inválidos', details: error.errors });
    }
    console.error('Erro ao criar solicitação:', error);
    res.status(500).json({ error: 'Erro ao criar solicitação' });
  }
});

// PATCH /api/requests/:id/approve - Supervisor aprova
router.patch('/:id/approve', requireSupervisor, async (req: AuthRequest, res) => {
  try {
    const request = await PriceRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ error: 'Solicitação não encontrada' });
    }

    if (request.codigo_supervisor !== req.user!.codigo_supervisor) {
      return res.status(403).json({ error: 'Você não tem permissão para aprovar esta solicitação' });
    }

    request.status = 'Aprovado';
    request.approved_by = req.user!.name;
    request.approved_at = new Date();

    await request.save();

    res.json(request);
  } catch (error) {
    console.error('Erro ao aprovar solicitação:', error);
    res.status(500).json({ error: 'Erro ao aprovar solicitação' });
  }
});

// PATCH /api/requests/:id/reject - Supervisor rejeita
router.patch('/:id/reject', requireSupervisor, async (req: AuthRequest, res) => {
  try {
    const { notes } = req.body;

    if (!notes || notes.trim().length === 0) {
      return res.status(400).json({ error: 'Justificativa é obrigatória para rejeitar' });
    }

    const request = await PriceRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ error: 'Solicitação não encontrada' });
    }

    if (request.codigo_supervisor !== req.user!.codigo_supervisor) {
      return res.status(403).json({ error: 'Você não tem permissão para rejeitar esta solicitação' });
    }

    request.status = 'Reprovado';
    request.supervisor_notes = notes;
    request.approved_by = req.user!.name;
    request.approved_at = new Date();

    await request.save();

    res.json(request);
  } catch (error) {
    console.error('Erro ao rejeitar solicitação:', error);
    res.status(500).json({ error: 'Erro ao rejeitar solicitação' });
  }
});

// PATCH /api/requests/:id/encaminhar-gerencia - Supervisor encaminha para gerência
router.patch('/:id/encaminhar-gerencia', requireSupervisor, async (req: AuthRequest, res) => {
  try {
    const { notes } = req.body;

    if (!notes || notes.trim().length === 0) {
      return res.status(400).json({ error: 'Justificativa é obrigatória para encaminhar' });
    }

    const request = await PriceRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ error: 'Solicitação não encontrada' });
    }

    if (request.codigo_supervisor !== req.user!.codigo_supervisor) {
      return res.status(403).json({ error: 'Você não tem permissão para encaminhar esta solicitação' });
    }

    request.status = 'Aguardando Gerência';
    request.supervisor_notes = notes;

    await request.save();

    res.json(request);
  } catch (error) {
    console.error('Erro ao encaminhar solicitação:', error);
    res.status(500).json({ error: 'Erro ao encaminhar solicitação' });
  }
});

// PATCH /api/requests/batch/:batchId/approve - Aprovar batch
router.patch('/batch/:batchId/approve', requireSupervisor, async (req: AuthRequest, res) => {
  try {
    const { batchId } = req.params;

    const requests = await PriceRequest.find({
      subrede_batch_id: batchId,
      codigo_supervisor: req.user!.codigo_supervisor,
    });

    if (requests.length === 0) {
      return res.status(404).json({ error: 'Nenhuma solicitação encontrada para este batch' });
    }

    await PriceRequest.updateMany(
      {
        subrede_batch_id: batchId,
        codigo_supervisor: req.user!.codigo_supervisor,
      },
      {
        $set: {
          status: 'Aprovado',
          approved_by: req.user!.name,
          approved_at: new Date(),
        },
      }
    );

    res.json({ message: `${requests.length} solicitações aprovadas` });
  } catch (error) {
    console.error('Erro ao aprovar batch:', error);
    res.status(500).json({ error: 'Erro ao aprovar batch' });
  }
});

// PATCH /api/requests/batch/:batchId/reject - Rejeitar batch
router.patch('/batch/:batchId/reject', requireSupervisor, async (req: AuthRequest, res) => {
  try {
    const { batchId } = req.params;
    const { notes } = req.body;

    if (!notes || notes.trim().length === 0) {
      return res.status(400).json({ error: 'Justificativa é obrigatória para rejeitar' });
    }

    const requests = await PriceRequest.find({
      subrede_batch_id: batchId,
      codigo_supervisor: req.user!.codigo_supervisor,
    });

    if (requests.length === 0) {
      return res.status(404).json({ error: 'Nenhuma solicitação encontrada para este batch' });
    }

    await PriceRequest.updateMany(
      {
        subrede_batch_id: batchId,
        codigo_supervisor: req.user!.codigo_supervisor,
      },
      {
        $set: {
          status: 'Reprovado',
          supervisor_notes: notes,
          approved_by: req.user!.name,
          approved_at: new Date(),
        },
      }
    );

    res.json({ message: `${requests.length} solicitações rejeitadas` });
  } catch (error) {
    console.error('Erro ao rejeitar batch:', error);
    res.status(500).json({ error: 'Erro ao rejeitar batch' });
  }
});

// PATCH /api/requests/batch/:batchId/encaminhar-gerencia - Encaminhar batch
router.patch('/batch/:batchId/encaminhar-gerencia', requireSupervisor, async (req: AuthRequest, res) => {
  try {
    const { batchId } = req.params;
    const { notes } = req.body;

    if (!notes || notes.trim().length === 0) {
      return res.status(400).json({ error: 'Justificativa é obrigatória para encaminhar' });
    }

    const requests = await PriceRequest.find({
      subrede_batch_id: batchId,
      codigo_supervisor: req.user!.codigo_supervisor,
    });

    if (requests.length === 0) {
      return res.status(404).json({ error: 'Nenhuma solicitação encontrada para este batch' });
    }

    await PriceRequest.updateMany(
      {
        subrede_batch_id: batchId,
        codigo_supervisor: req.user!.codigo_supervisor,
      },
      {
        $set: {
          status: 'Aguardando Gerência',
          supervisor_notes: notes,
        },
      }
    );

    res.json({ message: `${requests.length} solicitações encaminhadas` });
  } catch (error) {
    console.error('Erro ao encaminhar batch:', error);
    res.status(500).json({ error: 'Erro ao encaminhar batch' });
  }
});

// PATCH /api/requests/:id/gerente-approve - Gerente aprova
router.patch('/:id/gerente-approve', requireGerente, async (req: AuthRequest, res) => {
  try {
    const request = await PriceRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ error: 'Solicitação não encontrada' });
    }

    request.status = 'Aprovado pela Gerência';
    request.gerente_approved_by = req.user!.name;
    request.gerente_approved_at = new Date();

    await request.save();

    res.json(request);
  } catch (error) {
    console.error('Erro ao aprovar solicitação:', error);
    res.status(500).json({ error: 'Erro ao aprovar solicitação' });
  }
});

// PATCH /api/requests/:id/gerente-reject - Gerente rejeita
router.patch('/:id/gerente-reject', requireGerente, async (req: AuthRequest, res) => {
  try {
    const { notes } = req.body;

    if (!notes || notes.trim().length === 0) {
      return res.status(400).json({ error: 'Justificativa é obrigatória para rejeitar' });
    }

    const request = await PriceRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ error: 'Solicitação não encontrada' });
    }

    request.status = 'Reprovado pela Gerência';
    request.gerente_rejected_by = req.user!.name;
    request.gerente_rejected_at = new Date();
    request.supervisor_notes = notes;

    await request.save();

    res.json(request);
  } catch (error) {
    console.error('Erro ao rejeitar solicitação:', error);
    res.status(500).json({ error: 'Erro ao rejeitar solicitação' });
  }
});

// PATCH /api/requests/:id/mark-altered - Marcar como alterado
router.patch('/:id/mark-altered', requireAdminOrGerente, async (req: AuthRequest, res) => {
  try {
    const request = await PriceRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ error: 'Solicitação não encontrada' });
    }

    request.status = 'Alterado';
    request.altered_by = req.user!.name;
    request.altered_at = new Date();

    await request.save();

    res.json(request);
  } catch (error) {
    console.error('Erro ao marcar como alterado:', error);
    res.status(500).json({ error: 'Erro ao marcar como alterado' });
  }
});

// PATCH /api/requests/:id/cancel - Vendedor solicita cancelamento
router.patch('/:id/cancel', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { reason } = req.body;

    if (!reason || reason.trim().length === 0) {
      return res.status(400).json({ error: 'Motivo é obrigatório para solicitar cancelamento' });
    }

    const request = await PriceRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ error: 'Solicitação não encontrada' });
    }

    if (request.requester_id !== req.user!._id) {
      return res.status(403).json({ error: 'Você não tem permissão para cancelar esta solicitação' });
    }

    request.cancellation_requested = true;
    request.cancellation_reason = reason;
    request.cancellation_requested_at = new Date();

    await request.save();

    res.json(request);
  } catch (error) {
    console.error('Erro ao solicitar cancelamento:', error);
    res.status(500).json({ error: 'Erro ao solicitar cancelamento' });
  }
});

// PATCH /api/requests/:id/approve-cancel - Admin aprova cancelamento
router.patch('/:id/approve-cancel', requireAdmin, async (req: AuthRequest, res) => {
  try {
    const request = await PriceRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ error: 'Solicitação não encontrada' });
    }

    request.status = 'Cancelado';

    await request.save();

    res.json(request);
  } catch (error) {
    console.error('Erro ao aprovar cancelamento:', error);
    res.status(500).json({ error: 'Erro ao aprovar cancelamento' });
  }
});

// GET /api/requests/cancellation-requests - Lista solicitações de cancelamento
router.get('/cancellation-requests', requireAdmin, async (req: AuthRequest, res) => {
  try {
    const requests = await PriceRequest.find({
      cancellation_requested: true,
      status: { $ne: 'Cancelado' },
    }).sort({ cancellation_requested_at: -1 });

    res.json(requests);
  } catch (error) {
    console.error('Erro ao listar solicitações de cancelamento:', error);
    res.status(500).json({ error: 'Erro ao listar solicitações de cancelamento' });
  }
});

export default router;
