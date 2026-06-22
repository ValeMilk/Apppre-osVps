import { Router } from 'express';
import { query } from '../db/connection';

const router = Router();

// GET /api/data/produtos - Buscar produtos do SQL Server
router.get('/produtos', async (req, res) => {
  try {
    const sql = `
      SELECT
          E02_ID            AS codigo,
          E02_LIVRE         AS codigoLivre,
          E02_DESC          AS descricao,
          E29.E29_DESC      AS subcategoria,
          E02_PRECO         AS precoTabela,
          E02_PRECO_02      AS precoMinimo,
          E02_PRECO_03      AS precoPromo,
          E02_CUSTO_LIVRE   AS custo,
          E23.E23_DESC      AS categoria
      FROM dbo.E02 WITH (NOLOCK)
      LEFT JOIN dbo.E23 WITH (NOLOCK) ON E02.E02_ID_E23 = E23.E23_ID
      LEFT JOIN dbo.E29 WITH (NOLOCK) ON E02.E02_ID_E29 = E29.E29_ID
      WHERE
          E02_TIPO = '04'
          AND E02_ID <> '58'
          AND (
              E02_DESC IS NOT NULL
              AND E02_DESC NOT LIKE '%(INATIVO)%'
              AND E02_DESC NOT LIKE '%(INATIVADO)%'
              AND E02_DESC NOT LIKE '%(PASTEURIZADO)%'
          )
      ORDER BY E02_ID ASC
    `;

    const produtos = await query(sql);

    // Mapear campos para compatibilidade com frontend
    const produtosMapeados = produtos.map((p: any) => ({
      e02_id: p.codigo,
      e02_livre: p.codigoLivre,
      e02_desc: p.descricao,
      subcategoria: p.subcategoria,
      tabela_70: p.precoTabela?.toString() || '0',
      minimo: p.precoMinimo?.toString() || '0',
      promo: p.precoPromo?.toString() || '0',
      custo: p.custo?.toString() || '0',
      categoria: p.categoria,
    }));

    res.json(produtosMapeados);
  } catch (error: any) {
    console.error('Erro ao buscar produtos:', error);
    res.status(500).json({ error: 'Erro ao buscar produtos', details: error.message });
  }
});

// GET /api/data/clientes - Buscar clientes do SQL Server
router.get('/clientes', async (req, res) => {
  try {
    const sql = `
      SELECT
          c.A00_ID          AS clienteCodigo,
          c.A00_FANTASIA    AS clienteNome,
          c.A00_ID_VEND     AS vendedorCodigo,
          v.A00_FANTASIA    AS vendedorNome,
          c.A00_ID_VEND_2   AS supervisorCodigo,
          s.A00_FANTASIA    AS supervisorNome,
          c.A00_ID_A16      AS codigoRede,
          seg.A16_DESC      AS redeSubrede
      FROM dbo.A00 c
      INNER JOIN dbo.A14 a   ON c.A00_ID_A14 = a.A14_ID
      INNER JOIN dbo.A02 b   ON c.A00_ID_A02 = b.A02_ID
      LEFT  JOIN dbo.A00 v   ON c.A00_ID_VEND   = v.A00_ID
      LEFT  JOIN dbo.A00 s   ON c.A00_ID_VEND_2 = s.A00_ID
      LEFT  JOIN dbo.A16 seg ON c.A00_ID_A16    = seg.A16_ID
      WHERE
          c.A00_EN_CL = 1
          AND a.A14_DESC NOT IN (
              '999 - L80-INDUSTRIA',
              '700 - L81 - REMESSA VENDA',
              '142 - L82-PARACURU-LICITAÇÃO',
              '147 - L82-PARAIPABA-LICITAÇÃO',
              '149 - L82-SGA-LICITAÇÃO',
              '000 - L82-EXTRA ROTA'
          )
          AND (seg.A16_DESC NOT LIKE '%INATIVO%' OR seg.A16_DESC IS NULL)
          AND (seg.A16_ID NOT IN (22, 58, 124, 160, 1, 37, 52, 72) OR seg.A16_ID IS NULL)
    `;

    const clientes = await query(sql);

    // Mapear campos para compatibilidade com frontend
    const clientesMapeados = clientes.map((c: any) => ({
      a00_id: c.clienteCodigo,
      a00_fantasia: c.clienteNome,
      rede_id: c.codigoRede?.toString() || '',
      rede: c.redeSubrede || 'Independente',
      canal_de_venda: '', // Não incluído na query
      segmento: '', // Não incluído na query
      a00_id_vend: c.vendedorCodigo,
      vendedor: c.vendedorNome || '',
      a00_id_vend_2: c.supervisorCodigo,
      supervisor: c.supervisorNome || '',
    }));

    res.json(clientesMapeados);
  } catch (error: any) {
    console.error('Erro ao buscar clientes:', error);
    res.status(500).json({ error: 'Erro ao buscar clientes', details: error.message });
  }
});

export default router;
