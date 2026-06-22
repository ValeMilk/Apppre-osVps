-- Script de Teste SQL Server
-- Execute este script no seu banco de dados para verificar se as queries funcionam

-- ============================================
-- TESTE 1: Query de Produtos
-- ============================================
PRINT '--- TESTE 1: PRODUTOS ---'
GO

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

-- ============================================
-- TESTE 2: Query de Clientes
-- ============================================
PRINT '--- TESTE 2: CLIENTES ---'
GO

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

-- ============================================
-- TESTE 3: Verificar tabelas existem
-- ============================================
PRINT '--- TESTE 3: VERIFICAR TABELAS ---'
GO

-- Verificar se tabelas existem
IF OBJECT_ID('dbo.E02', 'U') IS NOT NULL
    PRINT '✓ Tabela E02 (Produtos) existe'
ELSE
    PRINT '✗ Tabela E02 NÃO existe'

IF OBJECT_ID('dbo.E23', 'U') IS NOT NULL
    PRINT '✓ Tabela E23 (Categorias) existe'
ELSE
    PRINT '✗ Tabela E23 NÃO existe'

IF OBJECT_ID('dbo.E29', 'U') IS NOT NULL
    PRINT '✓ Tabela E29 (Subcategorias) existe'
ELSE
    PRINT '✗ Tabela E29 NÃO existe'

IF OBJECT_ID('dbo.A00', 'U') IS NOT NULL
    PRINT '✓ Tabela A00 (Clientes/Vendedores) existe'
ELSE
    PRINT '✗ Tabela A00 NÃO existe'

IF OBJECT_ID('dbo.A14', 'U') IS NOT NULL
    PRINT '✓ Tabela A14 (Tipos de Cliente) existe'
ELSE
    PRINT '✗ Tabela A14 NÃO existe'

IF OBJECT_ID('dbo.A02', 'U') IS NOT NULL
    PRINT '✓ Tabela A02 (Segmentos) existe'
ELSE
    PRINT '✗ Tabela A02 NÃO existe'

IF OBJECT_ID('dbo.A16', 'U') IS NOT NULL
    PRINT '✓ Tabela A16 (Redes) existe'
ELSE
    PRINT '✗ Tabela A16 NÃO existe'

-- ============================================
-- TESTE 4: Contar registros
-- ============================================
PRINT '--- TESTE 4: CONTAR REGISTROS ---'
GO

SELECT 
    'E02 (Produtos)' AS Tabela,
    COUNT(*) AS Total
FROM dbo.E02 WITH (NOLOCK)
WHERE E02_TIPO = '04'

SELECT 
    'A00 (Clientes)' AS Tabela,
    COUNT(*) AS Total
FROM dbo.A00 WITH (NOLOCK)
WHERE A00_EN_CL = 1

-- ============================================
-- TESTE 5: Verificar colunas
-- ============================================
PRINT '--- TESTE 5: VERIFICAR COLUNAS ---'
GO

-- E02
PRINT 'Colunas na tabela E02:'
SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'E02' 
  AND COLUMN_NAME IN ('E02_ID', 'E02_LIVRE', 'E02_DESC', 'E02_PRECO', 'E02_PRECO_02', 'E02_PRECO_03', 'E02_CUSTO_LIVRE', 'E02_TIPO', 'E02_ID_E23', 'E02_ID_E29')

-- A00
PRINT 'Colunas na tabela A00:'
SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'A00'
  AND COLUMN_NAME IN ('A00_ID', 'A00_FANTASIA', 'A00_ID_VEND', 'A00_ID_VEND_2', 'A00_ID_A16', 'A00_EN_CL', 'A00_ID_A14', 'A00_ID_A02')

PRINT ''
PRINT '✓ Testes concluídos!'
