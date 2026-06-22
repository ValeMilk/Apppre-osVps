# ESTRUTURA COMPLETA DO PROJETO

## Estrutura de Diretórios

```
App preços VPS/
│
├── backend/                          # API Node.js + Express + TypeScript
│   ├── src/
│   │   ├── models/
│   │   │   ├── User.ts              # Schema do usuário
│   │   │   └── PriceRequest.ts      # Schema da solicitação
│   │   ├── routes/
│   │   │   ├── auth.ts              # Rotas de autenticação
│   │   │   ├── requests.ts          # Rotas de solicitações
│   │   │   └── analytics.ts         # Rotas de relatórios
│   │   ├── middleware/
│   │   │   └── auth.ts              # Middleware JWT
│   │   ├── index.ts                 # Servidor Express
│   │   └── create-admin.ts          # Script criação admin
│   ├── Dockerfile                    # Build backend
│   ├── package.json                  # Dependências Node.js
│   ├── tsconfig.json                 # Config TypeScript
│   ├── .env.example                  # Exemplo de variáveis
│   └── .gitignore
│
├── frontend/                         # React 18 + Vite + TypeScript
│   ├── public/
│   │   ├── produtos.csv             # Dados de produtos
│   │   ├── clientes.csv             # Dados de clientes
│   │   └── descontos.csv            # Tabela de descontos
│   ├── src/
│   │   ├── components/
│   │   │   ├── AuthForm.tsx         # Formulário de login
│   │   │   ├── VendorDashboard.tsx  # Dashboard vendedor
│   │   │   ├── RequestForm.tsx      # Form solicitação
│   │   │   ├── CalculadoraStandalone.tsx  # Calculadora
│   │   │   ├── SupervisorPanel.tsx  # Painel supervisor
│   │   │   ├── GerentePanel.tsx     # Painel gerente
│   │   │   └── AdminPanel.tsx       # Painel admin
│   │   ├── config/
│   │   │   └── api.ts               # Helper de API
│   │   ├── types/
│   │   │   └── index.ts             # Interfaces TypeScript
│   │   ├── schemas/
│   │   │   └── index.ts             # Schemas Zod
│   │   ├── utils/
│   │   │   └── dataHelpers.ts       # Helpers CSV
│   │   ├── App.tsx                  # Componente principal
│   │   └── main.tsx                 # Entry point
│   ├── Dockerfile                    # Build frontend
│   ├── nginx.conf                    # Config Nginx
│   ├── package.json                  # Dependências React
│   ├── tsconfig.json                 # Config TypeScript
│   ├── vite.config.ts                # Config Vite
│   ├── index.html                    # HTML base
│   └── .gitignore
│
├── docker-compose.yml                # Orquestração containers
├── .env.example                      # Exemplo variáveis ambiente
├── .gitignore                        # Arquivos ignorados Git
├── README.md                         # Documentação principal
├── DEPLOY_GUIDE.md                   # Guia de deploy
├── PROMPT_RECONSTRUCAO_VPS_DOCKER.md # Prompt original
└── deploy.sh                         # Script de deploy
```

## Tecnologias Utilizadas

### Backend
- **Node.js 18**: Runtime JavaScript
- **Express**: Framework web
- **TypeScript**: Tipagem estática
- **Mongoose**: ODM para MongoDB
- **bcryptjs**: Hash de senhas
- **jsonwebtoken**: Autenticação JWT
- **Zod**: Validação de schemas
- **CORS**: Cross-Origin Resource Sharing
- **dotenv**: Variáveis de ambiente

### Frontend
- **React 18**: Biblioteca UI
- **TypeScript**: Tipagem estática
- **Vite**: Build tool e dev server
- **Material-UI v7**: Componentes UI
- **React Router v7**: Roteamento SPA
- **Zod v4**: Validação client-side
- **PapaParse**: Parser de CSV
- **Emotion**: CSS-in-JS

### Infraestrutura
- **Docker**: Containerização
- **Docker Compose**: Orquestração
- **Nginx**: Servidor web + proxy reverso
- **MongoDB Atlas**: Banco de dados cloud

## Fluxo de Dados

```
┌─────────────────────────────────────────────────────────────┐
│                        USUÁRIO (Browser)                     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ↓ HTTP :80
┌─────────────────────────────────────────────────────────────┐
│                    NGINX (Container frontend)                │
│  - Serve React build estático                                │
│  - Proxy /api/* → http://backend:3001                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ↓ Internal network
┌─────────────────────────────────────────────────────────────┐
│              NODE.JS + EXPRESS (Container backend)           │
│  - API REST                                                  │
│  - Autenticação JWT                                          │
│  - Validação Zod                                             │
│  - Business logic                                            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ↓ MongoDB Driver
┌─────────────────────────────────────────────────────────────┐
│                   MONGODB ATLAS (Cloud)                      │
│  - Collections: users, pricerequests                         │
│  - Backup automático                                         │
│  - Acesso via internet                                       │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│              DADOS ESTÁTICOS (CSV - Frontend)                │
│  - produtos.csv                                              │
│  - clientes.csv                                              │
│  - descontos.csv                                             │
│  Carregados pelo browser, não passam pelo backend           │
└─────────────────────────────────────────────────────────────┘
```

## Rotas da API

### Autenticação (`/api/auth`)
- `POST /register` - Registro público (dev)
- `POST /admin-register` - Registrar vendedor (admin)
- `POST /supervisor-register` - Registrar supervisor (admin)
- `POST /gerente-register` - Registrar gerente (admin)
- `GET /users` - Listar usuários
- `POST /login` - Login
- `POST /fix-admin` - Corrigir tipo do admin (dev)

### Solicitações (`/api/requests`)
- `GET /all` - Listar todas (admin, 14 dias)
- `GET /supervisor` - Listar do supervisor (14 dias)
- `GET /gerente` - Listar para gerente (30 dias)
- `POST /` - Criar solicitação
- `PATCH /:id/approve` - Supervisor aprova
- `PATCH /:id/reject` - Supervisor rejeita
- `PATCH /:id/encaminhar-gerencia` - Encaminhar gerência
- `PATCH /batch/:batchId/approve` - Aprovar batch
- `PATCH /batch/:batchId/reject` - Rejeitar batch
- `PATCH /batch/:batchId/encaminhar-gerencia` - Encaminhar batch
- `PATCH /:id/gerente-approve` - Gerente aprova
- `PATCH /:id/gerente-reject` - Gerente rejeita
- `PATCH /:id/mark-altered` - Marcar alterado
- `PATCH /:id/cancel` - Vendedor solicita cancelamento
- `PATCH /:id/approve-cancel` - Admin aprova cancelamento
- `GET /cancellation-requests` - Lista cancelamentos (admin)

### Analytics (`/api/analytics`)
- `GET /requests` - Lista filtrada
- `GET /summary` - Contagens (status)
- `GET /by-product` - Agrupamento por produto
- `GET /by-vendedor` - Desempenho por vendedor
- `GET /by-period` - Série temporal

### Health Check
- `GET /` - Status da API
- `GET /health` - Health check

## Variáveis de Ambiente

### Backend (.env)
```env
NODE_ENV=production
PORT=3001
MONGO_URI=mongodb+srv://...
JWT_SECRET=...
CORS_ORIGIN=http://...
```

### Frontend (build arg)
```env
VITE_API_URL=http://...
```

## Segurança

### Implementado ✅
- JWT com expiração de 7 dias
- Senhas hashadas (bcrypt, 10 rounds)
- CORS configurado (origem específica)
- Validação de entrada (Zod backend + frontend)
- Middleware de autenticação por rota
- Separação de permissões por tipo de usuário
- Proteção contra SQL injection (MongoDB + Mongoose)

### Recomendado ⚠️
- HTTPS com certificado SSL (Let's Encrypt)
- Rate limiting em rotas de login
- Renovação de JWT antes da expiração
- Logs de auditoria
- Monitoramento (ex: Sentry, LogRocket)
- Backup periódico do MongoDB Atlas
- Firewall configurado (UFW)

## Performance

### Backend
- Conexão persistente com MongoDB
- Indexes no banco de dados (email único)
- Queries otimizadas (filtros por data)

### Frontend
- Build otimizado pelo Vite
- Code splitting
- Lazy loading de componentes (potencial melhoria)
- Compressão gzip no Nginx
- Caching de assets estáticos

## Escalabilidade

### Horizontal
- Adicionar mais containers backend
- Load balancer na frente (Nginx)
- MongoDB Atlas suporta sharding

### Vertical
- Aumentar recursos dos containers
- Upgrade do tier do MongoDB Atlas

## Monitoramento

### Logs
```bash
# Todos os logs
docker compose logs -f

# Apenas backend
docker compose logs -f backend

# Apenas frontend
docker compose logs -f frontend
```

### Métricas
- MongoDB Atlas: dashboard de métricas
- Docker: `docker stats`
- Nginx: logs de acesso

## Backup e Recovery

### MongoDB Atlas
- Backup automático contínuo
- Point-in-time recovery
- Snapshots configuráveis

### Código
- Git repository
- Docker images
- Arquivos .env (guardar em local seguro)

## Testes (A Implementar)

### Backend
- Unit tests (Jest)
- Integration tests (Supertest)
- E2E tests (Playwright)

### Frontend
- Unit tests (Vitest)
- Component tests (React Testing Library)
- E2E tests (Playwright)

## CI/CD (A Implementar)

### Opções
- GitHub Actions
- GitLab CI
- Jenkins

### Pipeline sugerido
1. Lint e formatação
2. Testes unitários
3. Build Docker images
4. Deploy para staging
5. Testes E2E
6. Deploy para produção

## Manutenção

### Atualizações
- Dependências: verificar semanalmente
- Node.js: LTS version
- Docker images: latest stable

### Rotinas
- Backup mensal manual (além do automático)
- Review de logs semanalmente
- Update de dependências mensalmente
- Teste de disaster recovery trimestralmente

## Custos Estimados

### Desenvolvimento/Teste (Gratuito)
- MongoDB Atlas: M0 Free Tier
- VPS: $5-10/mês (DigitalOcean, Hetzner)

### Produção
- MongoDB Atlas: M10+ ($57/mês)
- VPS: $10-20/mês
- Domínio: $10-15/ano
- SSL: Gratuito (Let's Encrypt)

### Total estimado: $70-100/mês para produção

## Próximos Passos

### Melhorias Futuras
1. Implementar testes automatizados
2. Adicionar filtros avançados no histórico
3. Exportação de relatórios em Excel
4. Notificações por email
5. Dashboard de métricas (gráficos)
6. App mobile (React Native)
7. Integração com ERP existente
8. Auditoria completa de ações
9. Modo offline (PWA)
10. Multi-tenancy para outras empresas

### Otimizações
1. Implementar Redis para cache
2. Lazy loading de componentes React
3. Virtualização de tabelas grandes
4. Compressão de imagens
5. Service Worker para PWA
6. WebSockets para real-time updates
