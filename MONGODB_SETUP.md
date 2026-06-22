# Como Obter MONGO_URI do MongoDB Atlas

## Opção 1: Usar MongoDB Atlas (Recomendado - Cloud)

### Passo 1: Criar conta no MongoDB Atlas
1. Acessar: https://www.mongodb.com/cloud/atlas
2. Clicar em "Sign Up" (inscrever-se)
3. Criar conta com email/password
4. Verificar email

### Passo 2: Criar um Cluster
1. Após login, clicar em "Create" ou "New Project"
2. Escolher plano **FREE** (M0 - ideal para desenvolvimento)
3. Selecionar região: **São Paulo (sa-east-1)** ou a mais próxima
4. Aguardar criação (leva ~5-10 minutos)

### Passo 3: Criar Usuário de Banco de Dados
1. No painel do cluster, ir para **Database Access**
2. Clicar em "Add Database User"
3. Preencher:
   - **Username**: `app_precos`
   - **Password**: gerar password seguro (clicar "Auto Generate")
   - **Database User Privileges**: `Built-in Role: Atlas admin`
4. Clicar "Add User"

**Salvar username e password com segurança!**

### Passo 4: Configurar Network Access
1. No painel, ir para **Network Access**
2. Clicar "Add IP Address"
3. Opção 1 (Desenvolvimento): Clicar "Allow Access from Anywhere" (0.0.0.0/0)
4. Opção 2 (Produção): Adicionar IP específico do seu servidor VPS
5. Confirmar

### Passo 5: Obter Connection String
1. No painel do cluster, clicar em "Connect"
2. Escolher "Connect your application"
3. Selecionar:
   - Driver: **Node.js**
   - Version: **4.x or later**
4. Copiar a string exibida:

```
mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority
```

### Passo 6: Montar MONGO_URI

**Exemplo real:**
```
mongodb+srv://app_precos:meuPassword123@cluster-abc.mongodb.net/precos_db?retryWrites=true&w=majority
```

**Substituir:**
- `<username>` → `app_precos` (ou seu usuário)
- `<password>` → seu password gerado
- `<cluster>` → seu cluster (ex: cluster-abc)
- `<dbname>` → nome do banco (ex: precos_db)

---

## Opção 2: MongoDB Local (Windows/Linux)

### Para Windows:

1. **Baixar MongoDB Community Edition**
   - https://www.mongodb.com/try/download/community
   - Selecionar Windows e baixar

2. **Instalar**
   - Executar instalador
   - Escolher "Complete Setup"
   - Instalar MongoDB Compass (interface visual)

3. **Iniciar servidor**
   ```bash
   mongod
   ```

4. **MONGO_URI**
   ```
   mongodb://localhost:27017/precos_db
   ```

### Para Linux (VPS):

```bash
# Instalar MongoDB
sudo apt-get install -y mongodb

# Iniciar
sudo systemctl start mongodb
sudo systemctl enable mongodb

# Verificar
sudo systemctl status mongodb

# MONGO_URI
mongodb://localhost:27017/precos_db
```

---

## Opção 3: MongoDB Compass (GUI Visual)

Se instalou MongoDB localmente:

1. Abrir **MongoDB Compass**
2. Conectar em `localhost:27017`
3. Criar banco de dados clicando em "Create Database"
4. Nome do banco: `precos_db`
5. Nome da collection: `users` (clicar Create)
6. MONGO_URI: `mongodb://localhost:27017/precos_db`

---

## Testes

### Testar conexão (Node.js):

```bash
npm install mongoose

# Criar arquivo test-mongo.js:
```

```javascript
const mongoose = require('mongoose');

const MONGO_URI = 'mongodb+srv://app_precos:password@cluster.mongodb.net/precos_db?retryWrites=true&w=majority';

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ Conectado ao MongoDB'))
  .catch(err => console.log('❌ Erro:', err.message));
```

```bash
node test-mongo.js
```

---

## Recomendação

Para seu projeto:
- ✅ **MongoDB Atlas (Cloud)** - Mais fácil, sem gerenciar servidor
- Plano FREE suporta até 512MB de dados
- Acesso remoto configurável
- Backups automáticos

---

## MONGO_URI para .env

Após obter a connection string, adicione ao arquivo `.env`:

```env
MONGO_URI=mongodb+srv://app_precos:SuaSenha123@seu-cluster.mongodb.net/precos_db?retryWrites=true&w=majority
```

✅ Pronto! Sistema pronto para conectar ao MongoDB.
