# Integração com SQL Server

## Visão Geral

O sistema agora pode buscar dados de **Produtos** e **Clientes** diretamente do SQL Server do ERP, em tempo real, em vez de usar arquivos CSV.

- ✅ **Produtos**: Via query SQL
- ✅ **Clientes**: Via query SQL  
- ⏸️ **Descontos**: Ainda via CSV (será migrado quando o ERP tiver rastreamento)

## Configuração

### 1. Adicionar Credenciais do SQL Server ao .env

```env
# SQL Server (ERP)
SQL_SERVER=seu-servidor.com.br
SQL_USER=usuario_sql
SQL_PASSWORD=senha_sql
SQL_DATABASE=nome_do_banco
```

**Exemplo prático:**
```env
SQL_SERVER=erp.valemilk.com.br
SQL_USER=app_user
SQL_PASSWORD=SenhaForte123!@#
SQL_DATABASE=ProdERPValemilk
```

### 2. Requisitos de Rede

- O servidor Node.js (VPS) deve conseguir conectar ao SQL Server
- Portas: 1433 (SQL Server padrão)
- Firewall: liberar conexão entre VPS e servidor SQL

### 3. Requisitos de Permissão no Banco

O usuário SQL deve ter permissão de **SELECT** nas seguintes tabelas:

```sql
-- Tabelas necessárias para Produtos
- dbo.E02 (Produtos)
- dbo.E23 (Categorias)
- dbo.E29 (Subcategorias)

-- Tabelas necessárias para Clientes
- dbo.A00 (Clientes/Vendedores/Supervisores)
- dbo.A14 (Tipos de Cliente)
- dbo.A02 (Segmentos)
- dbo.A16 (Redes/Subredes)
```

## Queries Utilizadas

### Query de Produtos

```sql
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
```

**Campos retornados:**
- `codigo` → e02_id (ID do produto)
- `codigoLivre` → e02_livre (Código reduzido)
- `descricao` → e02_desc (Descrição do produto)
- `subcategoria` → subcategoria
- `precoTabela` → tabela_70 (Preço máximo/tabelado)
- `precoMinimo` → minimo (Preço mínimo permitido)
- `precoPromo` → promo (Preço promocional)
- `custo` → custo (Custo do produto)
- `categoria` → categoria

### Query de Clientes

```sql
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
```

**Campos retornados:**
- `clienteCodigo` → a00_id
- `clienteNome` → a00_fantasia
- `vendedorCodigo` → a00_id_vend
- `vendedorNome` → vendedor
- `supervisorCodigo` → a00_id_vend_2
- `supervisorNome` → supervisor
- `codigoRede` → rede_id
- `redeSubrede` → rede

## Endpoints da API

### GET /api/data/produtos

Retorna lista de produtos do SQL Server.

**Response:**
```json
[
  {
    "e02_id": "001",
    "e02_livre": "001",
    "e02_desc": "LEITE INTEGRAL 1L",
    "tabela_70": "5.50",
    "minimo": "4.80",
    "promo": "4.50"
  }
]
```

### GET /api/data/clientes

Retorna lista de clientes do SQL Server.

**Response:**
```json
[
  {
    "a00_id": "C001",
    "a00_fantasia": "Supermercado Silva",
    "rede_id": "10",
    "rede": "Rede Sul",
    "a00_id_vend": "V001",
    "vendedor": "João Silva",
    "a00_id_vend_2": "S001",
    "supervisor": "Carlos Mendes"
  }
]
```

## Fallback para CSV

Se o SQL Server não estiver disponível:

1. Sistema tenta conectar ao SQL Server
2. Se falhar, carrega dados dos CSVs (`produtos.csv` e `clientes.csv`)
3. Mensagem de aviso aparece no console

**Exemplo:**
```
⚠️  Erro ao carregar produtos do SQL Server, tentando CSV: Connection timeout
✅ Produtos carregados do CSV
```

Isso permite que o sistema funcione mesmo com SQL Server indisponível.

## Troubleshooting

### Erro: "Connection timeout"
- Verificar se SQL Server está acessível
- Verificar firewall entre VPS e SQL Server
- Testar conexão: `telnet servidor:1433`

### Erro: "Login failed for user"
- Verificar credenciais no .env
- Verificar se usuário SQL tem permissões corretas
- Verificar se banco de dados existe

### Erro: "Invalid column name"
- Verificar names das colunas na query
- Verificar se tabelas existem no banco

### Produtos/Clientes não atualizam
- Sistema carrega dados uma vez ao abrir o componente
- Para forçar atualização: F5 no navegador
- Para implementar atualização em tempo real: usar WebSocket (future enhancement)

## Performance

### Otimizações Implementadas

✅ **WITH (NOLOCK)** nas queries - leitura sem lock
✅ **LEFT JOIN** - não falha se categoria/subcategoria ausente
✅ **WHERE** clauses - filtros no banco reduzem dados transferidos
✅ **Caching no frontend** - dados carregados uma vez por sessão

### Recomendações

- Criar índices nas colunas de filtro (E02_TIPO, A00_EN_CL, etc)
- Monitorar performance das queries com SQL Profiler
- Implementar paginação se houver muitos registros (>5000)

## Migração Futura dos Descontos

Quando o ERP tiver rastreamento de descontos:

1. Criar tabela de descontos no SQL Server
2. Criar query para buscar descontos
3. Criar endpoint GET /api/data/descontos
4. Atualizar loadDescontos() para usar API

```typescript
// Exemplo futuro
export const loadDescontos = (): Promise<Desconto[]> => {
  return api.get('/api/data/descontos')
    .catch(() => loadDescontosCSV()); // Fallback
};
```

## Monitoramento

### Ver qual fonte está sendo usada

Abrir Console do navegador (F12) e procurar por:
```
✅ Produtos carregados do SQL Server    // ou
⚠️  Erro ao carregar produtos do SQL Server, tentando CSV
```

### Logs do Backend

```bash
docker compose logs backend | grep "SQL Server"
```

## Desenvolvimento Local

Se desenvolver localmente sem acesso ao SQL Server:

```env
# Não definir SQL_SERVER
# Sistema usará CSV automaticamente
```

## Contribuindo

Para melhorias na integração SQL Server:

1. Testar queries no SQL Server Management Studio primeiro
2. Adicionar tratamento de erro apropriado
3. Atualizar esta documentação
4. Testar fallback para CSV

## Contato

Para dúvidas ou problemas com a integração:
- Verificar query SQL no SQL Server Management Studio
- Verificar logs: `docker compose logs backend`
- Testar conectividade: `telnet servidor_sql 1433`
