# Troubleshooting - SQL Server Integration

## Problema 1: "Connection timeout" ou "Connection refused"

### Sintomas
```
Error: connect ECONNREFUSED 192.168.1.100:1433
Error: Connection timeout
```

### Soluções

**1. Verificar se SQL Server está rodando**
```bash
# No servidor SQL Server
nslookup seu-servidor.com.br
# Deve retornar um IP válido
```

**2. Testar conectividade de rede**
```bash
# Na VPS
telnet seu-servidor.com.br 1433

# Deve conectar (tela preta sem erros)
# Ctrl+] depois quit para sair
```

**3. Verificar firewall**
```bash
# Na VPS (se UFW está ativo)
sudo ufw allow from <IP_SQL_SERVER> to any port 1433
```

**4. Verificar configuração .env**
```env
# Correto
SQL_SERVER=seu-servidor.com.br
SQL_SERVER=192.168.1.100

# Errado
SQL_SERVER=seu-servidor.com.br:1433  # Porta adicionada
SQL_SERVER=Server=seu-servidor       # Formato errado
```

**5. Ver logs do backend**
```bash
docker compose logs backend | grep -i "connection\|sql"
```

---

## Problema 2: "Login failed for user 'app_precos'"

### Sintomas
```
Login failed for user 'app_precos'. Reason: An attempt to login using SQL authentication failed.
```

### Soluções

**1. Verificar credenciais**
```bash
# Testar login no SQL Server diretamente
sqlcmd -S seu-servidor.com.br -U app_precos -P SenhaForte123!@#
```

**2. Verificar caso (maiúsculas/minúsculas)**
```env
# SQL Server é case-sensitive em Linux
SQL_USER=app_precos  # Correto
SQL_USER=APP_PRECOS  # Pode dar erro
```

**3. Verificar se usuário existe**
```sql
-- Execute no SQL Server Management Studio
SELECT * FROM sys.sysusers WHERE name = 'app_precos'
```

**4. Resetar senha do usuário**
```sql
-- Execute como admin
USE master
ALTER LOGIN [app_precos] WITH PASSWORD = 'NovaSenha123!@#'
```

**5. Verificar modo de autenticação**
```sql
-- SQL Server pode estar em modo Windows apenas
-- Deve estar em "SQL Server and Windows Authentication"
-- Verificar em: SQL Server Management Studio > Properties > Security
```

---

## Problema 3: "Invalid column name 'E02_CUSTO_LIVRE'"

### Sintomas
```
Incorrect syntax near ')'. Msg 207, Level 16, State 1
Invalid column name 'E02_CUSTO_LIVRE'
```

### Soluções

**1. Verificar nome da coluna exato**
```sql
-- Execute no SQL Server
SELECT COLUMN_NAME 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'E02'
ORDER BY COLUMN_NAME

-- Procurar por coluna similar:
-- E02_CUSTO
-- E02_CUSTO_LIVRE
-- E02_CUSTO_UNITARIO
-- etc
```

**2. Atualizar query com nome correto**
```typescript
// backend/src/routes/data.ts
// Alterar 'E02_CUSTO_LIVRE' para o nome correto
```

**3. Rebuilda o backend**
```bash
docker compose up -d --build backend
```

---

## Problema 4: "Unable to connect to SQL Server"

### Sintomas
```
Cannot connect to provider
Protocol not supported
```

### Soluções

**1. Verificar se SQL Server está configurado para aceitar conexões remotas**
```sql
-- Execute no SQL Server
EXEC xp_regread 'HKEY_LOCAL_MACHINE',
  'Software\Microsoft\MSSQLServer\MSSQLServer', 
  'LoginMode'
-- Resultado: 1 = Integrado, 2 = Misto (necessário)
```

**2. Habilitar named pipes e TCP/IP**
- Abrir: SQL Server Configuration Manager
- Protocols > TCP/IP: Enabled
- Protocols > Named Pipes: Enabled
- Reiniciar serviço SQL Server

**3. Verificar porta SQL Server**
```sql
-- Execute no SQL Server Management Studio
SELECT DISTINCT local_net_address, local_tcp_port
FROM sys.dm_exec_connections
WHERE protocol_type = 'TCP'
-- Padrão: 1433
```

---

## Problema 5: "Query timeout expired"

### Sintomas
```
Timeout expired. The timeout period elapsed prior to completion of the operation or the server is not responding.
```

### Soluções

**1. Aumentar timeout na conexão**
```typescript
// backend/src/db/connection.ts
const config = {
  // ...
  pool: {
    // ...
    idleTimeoutMillis: 60000, // Aumentar
  },
  connectionTimeout: 30000,   // Adicionar
  requestTimeout: 30000,      // Adicionar
}
```

**2. Otimizar query**
```sql
-- Adicionar índices
CREATE INDEX IX_E02_TIPO ON dbo.E02(E02_TIPO)
CREATE INDEX IX_E02_DESC ON dbo.E02(E02_DESC)
CREATE INDEX IX_A00_EN_CL ON dbo.A00(A00_EN_CL)
```

**3. Testar query performance**
```sql
-- Execute no SQL Server Management Studio
SET STATISTICS TIME ON
SET STATISTICS IO ON

-- [Execute sua query aqui]

SET STATISTICS TIME OFF
SET STATISTICS IO OFF
-- Ver tempo de execução no resultado
```

---

## Problema 6: "No data returned"

### Sintomas
```
API retorna array vazio []
```

### Soluções

**1. Verificar se existem registros**
```sql
-- Executar queries de contagem
SELECT COUNT(*) FROM dbo.E02 WHERE E02_TIPO = '04'
SELECT COUNT(*) FROM dbo.A00 WHERE A00_EN_CL = 1
```

**2. Verificar filtros WHERE**
```sql
-- Testar query sem WHERE
SELECT TOP 10 * FROM dbo.E02

-- Depois adicionar WHERE um por um
SELECT * FROM dbo.E02 WHERE E02_TIPO = '04'
SELECT * FROM dbo.E02 WHERE E02_ID <> '58'
-- etc
```

**3. Verificar LEFT JOINs**
```sql
-- Se muitos registros são NULL, LEFT JOIN pode estar removendo dados
-- Testar sem LEFT JOINs
SELECT TOP 10 * FROM dbo.E02 WHERE E02_TIPO = '04'
```

---

## Problema 7: "Permission denied" ou "Access denied"

### Sintomas
```
The SELECT permission was denied on object 'E02'
```

### Soluções

**1. Verificar permissões do usuário**
```sql
-- Execute como admin
SELECT * FROM sys.database_permissions 
WHERE principal_id = (SELECT principal_id FROM sys.database_principals WHERE name = 'app_precos')
```

**2. Conceder permissões**
```sql
-- Execute como admin
GRANT SELECT ON dbo.E02 TO [app_precos]
GRANT SELECT ON dbo.E23 TO [app_precos]
GRANT SELECT ON dbo.E29 TO [app_precos]
GRANT SELECT ON dbo.A00 TO [app_precos]
GRANT SELECT ON dbo.A14 TO [app_precos]
GRANT SELECT ON dbo.A02 TO [app_precos]
GRANT SELECT ON dbo.A16 TO [app_precos]
```

---

## Problema 8: "Fallback para CSV" - SQL Server nunca é usado

### Sintomas
```
⚠️  Erro ao carregar produtos do SQL Server, tentando CSV
Sistema usa CSV ao invés de SQL Server
```

### Causas Possíveis

**1. Variável de ambiente não configurada**
```bash
# Verificar se SQL_SERVER está no .env
grep SQL_SERVER .env

# Deve haver:
SQL_SERVER=seu-servidor.com.br
SQL_USER=usuario
SQL_PASSWORD=senha
SQL_DATABASE=banco
```

**2. Variável não carregada no container**
```bash
# Verificar variáveis dentro do container
docker compose exec backend env | grep SQL

# Deve retornar:
# SQL_SERVER=seu-servidor.com.br
# SQL_USER=usuario
# etc
```

**3. Verificar se .env foi atualizado**
```bash
# Parar containers
docker compose down

# Atualizar .env
nano .env

# Rebuild com flag --build
docker compose up -d --build
```

---

## Problema 9: "SELF SIGNED CERTIFICATE IN CERTIFICATE CHAIN"

### Sintomas
```
Error: SELF_SIGNED_CERT_IN_CHAIN
```

### Soluções

**1. Desabilitar verificação de certificado (NÃO recomendado em produção)**
```typescript
// backend/src/db/connection.ts
const config = {
  // ...
  options: {
    encrypt: true,
    trustServerCertificate: true,  // ← Já está aqui
    enableKeepAlive: true,
  },
}
```

**2. Usar certificado válido**
- Obter certificado SSL válido para o servidor SQL
- Instalar no servidor SQL
- Configurar no SQL Server Configuration Manager

---

## Problema 10: "NetworkInterfaceError"

### Sintomas
```
NetworkInterfaceError: something went wrong in error handling
```

### Soluções

**1. Verificar logs do backend**
```bash
docker compose logs backend -f --tail 50
```

**2. Verificar versão do MSSQL package**
```bash
# Dentro do container
docker compose exec backend npm list mssql
```

**3. Atualizar pacote**
```bash
# No backend/
npm install mssql@latest
docker compose up -d --build backend
```

---

## Checklist de Troubleshooting

- [ ] `telnet servidor:1433` conecta
- [ ] Credenciais corretas no .env
- [ ] Usuário SQL tem permissão SELECT
- [ ] `.env` foi recarregado (docker compose rebuild)
- [ ] SQL Server está em modo "SQL Server and Windows"
- [ ] Firewall permite porta 1433
- [ ] Tabelas existem no banco
- [ ] Colunas têm nomes corretos
- [ ] Registros existem para os filtros WHERE
- [ ] Logs mostram erro específico

---

## Verificar Qual Dados Está Sendo Usado

### No Frontend (Developer Tools)

```javascript
// Console
localStorage.getItem('lastDataSource')
// Deve retornar 'sql-server' ou 'csv'
```

### Via API

```bash
# Testar endpoints
curl http://72.61.62.17/api/data/produtos
curl http://72.61.62.17/api/data/clientes

# Deve retornar dados do SQL Server se configurado
```

### Via Logs

```bash
docker compose logs backend | grep -E "produtos|clientes|SQL Server|CSV"
```

---

## Contato para Suporte

Se após seguir este guia o problema persistir:

1. Coletar logs completos:
   ```bash
   docker compose logs backend > backend-logs.txt
   ```

2. Salvar configuração (sem expor senha):
   ```bash
   cat .env | sed 's/PASSWORD.*/PASSWORD=****/g' > env-config.txt
   ```

3. Executar script de teste:
   ```bash
   # No SQL Server Management Studio
   # Executar: SQL_SERVER_TESTS.sql
   ```

4. Enviar:
   - backend-logs.txt
   - env-config.txt
   - Saída do SQL_SERVER_TESTS.sql
   - Descrição detalhada do problema
