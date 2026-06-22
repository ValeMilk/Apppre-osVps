# App Preços - Sistema de Solicitação de Preços Especiais (Valemilk)

Sistema completo de solicitação e aprovação de preços especiais para distribuidora de laticínios.

## Stack Técnica

- **Backend**: Node.js + Express + TypeScript + MongoDB Atlas
- **Frontend**: React 18 + Vite + TypeScript + Material-UI v7
- **Infraestrutura**: Docker + Docker Compose + Nginx

## Estrutura do Projeto

```
projeto/
├── backend/          # API Node.js + Express
├── frontend/         # React + Vite
├── docker-compose.yml
└── .env
```

## Pré-requisitos

- Docker e Docker Compose instalados
- Conta MongoDB Atlas (banco de dados cloud)
- VPS Linux com acesso SSH

## Configuração Rápida

### 1. Clonar/Copiar o Projeto para a VPS

```bash
ssh root@72.61.62.17
cd /root
mkdir app-precos
cd app-precos
# Copiar todos os arquivos do projeto para este diretório
```

### 2. Configurar Variáveis de Ambiente

```bash
cp .env.example .env
nano .env
```

Editar as seguintes variáveis:
- `MONGO_URI`: String de conexão do MongoDB Atlas
- `JWT_SECRET`: Chave secreta para JWT (mínimo 32 caracteres aleatórios)
- `CORS_ORIGIN`: URL da VPS (ex: http://72.61.62.17)
- `VITE_API_URL`: URL da VPS (ex: http://72.61.62.17)

### 3. Build e Start dos Containers

```bash
docker compose up -d --build
```

### 4. Criar Usuário Admin Inicial

```bash
# Aguardar containers subirem (30-60 segundos)
docker compose exec backend npm run create-admin
```

Credenciais do admin:
- **Email**: admin@admin.com
- **Senha**: admin123

### 5. Acessar o Sistema

Abrir no navegador: `http://72.61.62.17`

## Comandos Úteis

```bash
# Ver logs
docker compose logs -f

# Ver logs apenas do backend
docker compose logs -f backend

# Ver logs apenas do frontend
docker compose logs -f frontend

# Parar containers
docker compose down

# Reiniciar containers
docker compose restart

# Rebuild completo
docker compose down
docker compose up -d --build

# Executar comando dentro do container backend
docker compose exec backend <comando>

# Executar comando dentro do container frontend
docker compose exec frontend <comando>
```

## Estrutura de Usuários

### 4 Tipos de Usuário

1. **Admin**: Gerencia usuários e vê todas as solicitações
2. **Vendedor**: Cria solicitações de preço
3. **Supervisor**: Aprova/rejeita/encaminha solicitações
4. **Gerente**: Decisão final para casos encaminhados

### Cadastrar Usuários

Após criar o admin, faça login e acesse o painel admin para cadastrar:
- Vendedores (com código do vendedor)
- Supervisores (com código do supervisor)
- Gerentes

## Fluxo de Aprovação

```
Vendedor cria → PENDENTE
       ↓
Supervisor revisa
  ├→ APROVADO
  ├→ REPROVADO
  └→ AGUARDANDO GERÊNCIA
         ↓
    Gerente revisa
      ├→ APROVADO PELA GERÊNCIA
      ├→ REPROVADO PELA GERÊNCIA
      └→ ALTERADO
```

## Dados CSV

Os arquivos CSV devem estar em `frontend/public/`:
- `produtos.csv`: Lista de produtos
- `clientes.csv`: Lista de clientes
- `descontos.csv`: Tabela de descontos

Estes arquivos são carregados pelo frontend e usados para cálculo de descontos.

## Troubleshooting

### Containers não sobem

```bash
# Ver logs de erro
docker compose logs

# Verificar se portas estão em uso
netstat -tulpn | grep :80
netstat -tulpn | grep :3001
```

### Erro de conexão com MongoDB

- Verificar se MONGO_URI está correto no .env
- Verificar se IP da VPS está na whitelist do MongoDB Atlas

### Frontend não carrega

```bash
# Verificar nginx
docker compose exec frontend nginx -t

# Ver logs do nginx
docker compose logs frontend
```

### Backend retorna erro 500

```bash
# Ver logs detalhados
docker compose logs backend

# Verificar variáveis de ambiente
docker compose exec backend env | grep MONGO
```

## Backup e Manutenção

### Backup do MongoDB Atlas

MongoDB Atlas faz backup automático. Configure snapshots no painel do Atlas.

### Atualizar o Sistema

```bash
cd /root/app-precos
# Fazer alterações nos arquivos
docker compose up -d --build
```

## Segurança

- ✅ JWT com expiração de 7 dias
- ✅ Senhas hashadas com bcrypt
- ✅ CORS configurado
- ✅ Validação com Zod
- ⚠️ **IMPORTANTE**: Alterar senha do admin após primeiro login
- ⚠️ **RECOMENDADO**: Configurar HTTPS com Let's Encrypt

### Configurar HTTPS (Opcional mas Recomendado)

```bash
# Instalar certbot
apt update
apt install certbot python3-certbot-nginx

# Obter certificado SSL
certbot --nginx -d seu-dominio.com

# Auto-renovação
certbot renew --dry-run
```

## Suporte

Para problemas ou dúvidas, verificar:
1. Logs dos containers
2. Configuração do .env
3. Conectividade com MongoDB Atlas
4. Firewall da VPS (portas 80 e 443 devem estar abertas)

## Licença

Propriedade da Valemilk.
