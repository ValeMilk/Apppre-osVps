## Transição de CSV para SQL Server

## Mudanças Implementadas

### ✅ Backend
- Instalada dependência `mssql` para conexão SQL Server
- Criada camada de conexão (`backend/src/db/connection.ts`)
- Implementadas queries SQL para:
  - Produtos (E02, E23, E29)
  - Clientes (A00, A14, A02, A16)
- Criadas rotas `/api/data/produtos` e `/api/data/clientes`

### ✅ Frontend  
- Atualizado `dataHelpers.ts` para buscar via API
- Sistema automático de fallback para CSV
- Mantido suporte a descontos via CSV

### ✅ Configuração
- Adicionadas variáveis de ambiente SQL Server no `.env.example`
- Criada documentação completa: `SQL_SERVER_CONFIG.md`

## Como Usar

### 1. Configurar Variáveis de Ambiente

No arquivo `.env`:

```env
SQL_SERVER=seu-servidor.com.br
SQL_USER=usuario
SQL_PASSWORD=senha
SQL_DATABASE=banco
```

### 2. Testar Conectividade

```bash
# SSH na VPS
ssh root@72.61.62.17

# Testar porta SQL Server
telnet seu-servidor.com.br 1433

# Ver logs do backend
docker compose logs backend
```

### 3. Sistema Funcionará:

1. **Com SQL Server**: Dados atualizados em tempo real do ERP
2. **Sem SQL Server**: Dados do CSV (fallback automático)

## Fluxo de Dados

```
┌─────────────────────────────────────────┐
│  Frontend tenta carregar dados          │
└─────────────────────────────────────────┘
                      │
                      ↓
        ┌─────────────────────────────┐
        │ GET /api/data/produtos      │
        │ GET /api/data/clientes      │
        └─────────────────────────────┘
                      │
         ┌────────────┴────────────┐
         ↓                         ↓
    ✅ SQL Server            ❌ Erro
         │                        │
         ↓                        ↓
    [Dados ERP]          GET /produtos.csv
         │                 GET /clientes.csv
         │                        │
         └────────────┬───────────┘
                      ↓
            [Dados exibidos]
```

## Migração dos Descontos (Future)

Quando o ERP tiver rastreamento:

```typescript
// Hoje: CSV
export const loadDescontos = () => loadDescontosCSV();

// Futuro: SQL Server + Fallback
export const loadDescontos = () => 
  api.get('/api/data/descontos')
     .catch(() => loadDescontosCSV());
```

## Benefícios

✅ Dados sempre atualizados do ERP
✅ Sem necessidade de sincronização manual  
✅ Reduz erros de dados desatualizados
✅ Fallback automático para CSV se SQL down
✅ Preparação para futuras integrações

## Notas Importantes

- CSVs ainda são mantidos como backup
- Sistema é resiliente a falhas
- Logging automático de qual fonte foi usada
- Sem mudanças na experiência do usuário

## Testes Recomendados

```bash
# 1. Com SQL Server conectado
curl http://localhost:3001/api/data/produtos
curl http://localhost:3001/api/data/clientes

# 2. Simular falha SQL Server (comentar SQL_SERVER no .env)
# Sistema deve usar CSV automaticamente

# 3. Verificar logs
docker compose logs backend | grep -E "SQL Server|CSV|produtos|clientes"
```
