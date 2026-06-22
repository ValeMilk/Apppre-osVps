╔════════════════════════════════════════════════════════════════════════════╗
║           ✅ INTEGRAÇÃO COM SQL SERVER - ATUALIZAÇÃO CONCLUÍDA             ║
╚════════════════════════════════════════════════════════════════════════════╝

## 🔄 O QUE MUDOU

✅ **ANTES**: Dados via CSVs (produtos.csv, clientes.csv, descontos.csv)
✅ **DEPOIS**: 
  - Produtos → SQL Server (query E02, E23, E29)
  - Clientes → SQL Server (query A00, A14, A02, A16)
  - Descontos → CSV (até ERP rastrear)

---

## 🚀 COMEÇAR A USAR

### PASSO 1: Adicionar Credenciais SQL Server ao .env

```env
# Copiar .env.example e preencher
cp .env.example .env
nano .env

# Adicionar:
SQL_SERVER=seu-servidor-erp.com.br
SQL_USER=app_precos
SQL_PASSWORD=SenhaForte123!@#
SQL_DATABASE=seu_banco_erp
```

### PASSO 2: Testar SQL Server

**No seu servidor SQL (SQL Server Management Studio):**

```bash
1. Abrir arquivo: SQL_SERVER_TESTS.sql
2. Executar as queries (F5)
3. Verificar se retornam dados
```

**Na VPS:**

```bash
# Conectar via SSH
ssh root@72.61.62.17

# Testar conectividade
telnet seu-servidor-erp.com.br 1433

# Deve conectar (tela preta, sem erros)
# Sair: Ctrl+]
```

### PASSO 3: Deploy

```bash
# VPS
cd /root/app-precos

# Rebuild com as novas dependências
docker compose up -d --build

# Aguardar 60 segundos e testar
curl http://72.61.62.17/api/data/produtos
curl http://72.61.62.17/api/data/clientes

# Deve retornar JSON com dados do SQL Server
```

### PASSO 4: Verificar Logs

```bash
# Ver se conectou ao SQL Server
docker compose logs backend | grep -E "SQL Server|CSV|produtos|clientes"

# Esperado:
# ✅ Produtos carregados do SQL Server
# ✅ Clientes carregados do SQL Server
```

---

## 📊 FLUXO DE DADOS AGORA

```
┌──────────────────────────────────────────┐
│  Browser carrega RequestForm             │
└──────────────────────────────────────────┘
              ↓
┌──────────────────────────────────────────┐
│  Frontend: loadProdutos() / loadClientes() │
└──────────────────────────────────────────┘
              ↓
    ┌─────────────────────────┐
    │  Tenta GET /api/data/*  │
    └─────────────────────────┘
              ↓
    ┌─────────────┬──────────────┐
    ↓             ↓              ↓
┌──────────────┐ ✅ SQL Server  ❌ Erro
│ Backend Node │    [Dados ERP]  │
└──────────────┘                 ↓
    ↓                    CSV (fallback)
    └────────────┬──────────────┘
                 ↓
          ┌─────────────┐
          │ Frontend OK │
          └─────────────┘
```

---

## ✨ NOVOS ENDPOINTS

### GET /api/data/produtos
```bash
curl http://72.61.62.17/api/data/produtos

# Response:
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
```bash
curl http://72.61.62.17/api/data/clientes

# Response:
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

---

## 🔐 SEGURANÇA

### Usuário SQL recomendado:

```sql
-- No SQL Server Management Studio, executar SQL_SERVER_USER_SETUP.sql
-- Cria usuário 'app_precos' com permissões SELECT apenas
```

### Conectar com SQL Auth (não Windows Auth):

```bash
# SQL Server deve estar em modo: "SQL Server and Windows Authentication"
# Verificar: SQL Server Management Studio > Properties > Security
```

---

## 📋 DOCUMENTAÇÃO

Novos arquivos criados:

1. **SQL_SERVER_CONFIG.md** - Guia completo de configuração
2. **MIGRATION_SQL_SERVER.md** - Resumo da migração CSV→SQL
3. **SQL_SERVER_TESTS.sql** - Script para testar as queries
4. **SQL_SERVER_USER_SETUP.sql** - Script para criar usuário seguro
5. **SQL_SERVER_TROUBLESHOOTING.md** - Solução de problemas

---

## 🔧 ESTRUTURA DE ARQUIVOS

```
backend/
├── src/
│   ├── db/
│   │   └── connection.ts        ← ✨ Nova: conexão SQL Server
│   └── routes/
│       └── data.ts              ← ✨ Nova: endpoints /api/data/*

frontend/
└── src/
    └── utils/
        └── dataHelpers.ts       ← ✏️ Atualizado: busca API + fallback CSV
```

---

## ⚡ SISTEMA DE FALLBACK

**Se SQL Server cair:**

1. Frontend tenta: `GET /api/data/produtos` → ERRO
2. Frontend carrega fallback: `/produtos.csv` → ✅ OK
3. Usuário nem nota a diferença
4. Console mostra: `⚠️ Erro ao carregar produtos do SQL Server, tentando CSV`

**Manter CSVs sempre sincronizados como backup!**

---

## 🎯 PRÓXIMOS PASSOS

1. ✅ Configurar SQL Server (credenciais + firewall)
2. ✅ Testar conectividade
3. ✅ Deploy com docker compose up -d --build
4. ✅ Verificar logs
5. ⏳ Usar sistema normalmente

---

## 🐛 PROBLEMA?

Se dados não carregam do SQL Server:

```bash
# 1. Ver logs
docker compose logs backend | grep -i "sql\|error"

# 2. Testar conectividade
telnet seu-servidor:1433

# 3. Testar query no SQL Server Management Studio
# Abrir: SQL_SERVER_TESTS.sql

# 4. Ver troubleshooting
# Abrir: SQL_SERVER_TROUBLESHOOTING.md

# 5. Rebuild containers
docker compose down
docker compose up -d --build
```

---

## 📞 CHECKLIST

- [ ] Credenciais SQL Server no .env
- [ ] Testei telnet: `telnet servidor:1433`
- [ ] SQL Server está em modo "SQL Server and Windows"
- [ ] Usuário SQL tem permissão SELECT
- [ ] Tabelas E02, E23, E29, A00, A14, A02, A16 existem
- [ ] Executei SQL_SERVER_TESTS.sql com sucesso
- [ ] Docker compose rebuild concluído
- [ ] Logs mostram "SQL Server" no lugar de "CSV"
- [ ] API retorna dados: curl /api/data/produtos
- [ ] Frontend carrega dados corretamente

---

## 🎉 PRONTO!

O sistema agora integra com seu ERP em tempo real. Dados sempre atualizados! 🚀
