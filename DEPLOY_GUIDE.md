# GUIA DE DEPLOY - APP PREÇOS VALEMILK

## PREPARAÇÃO DO MONGODB ATLAS

1. Acesse https://cloud.mongodb.com
2. Crie uma conta (se não tiver)
3. Crie um novo Cluster (opção gratuita M0 é suficiente para testes)
4. Em "Security":
   - Database Access: Crie um usuário com senha
   - Network Access: Adicione o IP da sua VPS (72.61.62.17) ou use 0.0.0.0/0 (permite qualquer IP)
5. Clique em "Connect" → "Connect your application"
6. Copie a string de conexão (ex: mongodb+srv://user:password@cluster.mongodb.net/dbname)

## PASSOS NO SEU COMPUTADOR LOCAL

1. Comprimir o projeto:
```bash
cd "C:\Users\LENOVO 059\Desktop\App preços VPS"
# Use WinRAR, 7zip ou PowerShell para comprimir a pasta em um arquivo .zip
```

2. Transferir para a VPS:
```bash
# Usando SCP (no PowerShell ou terminal)
scp app-precos.zip root@72.61.62.17:/root/

# OU use FileZilla ou WinSCP para transferência via interface gráfica
```

## PASSOS NA VPS (via SSH)

1. Conectar à VPS:
```bash
ssh root@72.61.62.17
```

2. Instalar Docker (se não estiver instalado):
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
```

3. Descompactar projeto:
```bash
cd /root
unzip app-precos.zip -d app-precos
cd app-precos
```

4. Configurar variáveis de ambiente:
```bash
cp .env.example .env
nano .env
```

Editar o arquivo .env com:
```env
NODE_ENV=production
PORT=3001
MONGO_URI=mongodb+srv://SEU_USUARIO:SUA_SENHA@cluster.mongodb.net/app-precos?retryWrites=true&w=majority
JWT_SECRET=GERE_UMA_STRING_ALEATORIA_DE_32_CARACTERES_AQUI
CORS_ORIGIN=http://72.61.62.17
VITE_API_URL=http://72.61.62.17
```

Para gerar JWT_SECRET:
```bash
openssl rand -base64 32
```

Salvar (Ctrl+O) e Sair (Ctrl+X)

5. Tornar script executável:
```bash
chmod +x deploy.sh
```

6. Executar deploy:
```bash
./deploy.sh
```

OU manualmente:
```bash
docker compose up -d --build
sleep 30
docker compose exec backend npm run create-admin
```

7. Verificar status:
```bash
docker compose ps
docker compose logs -f
```

8. Testar acesso:
- Abrir navegador: http://72.61.62.17
- Login: admin@admin.com / admin123

## CONFIGURAÇÃO PÓS-DEPLOY

1. Fazer login como admin
2. Alterar senha do admin
3. Cadastrar usuários:
   - Vendedores (informar código do vendedor)
   - Supervisores (informar código do supervisor)
   - Gerentes

4. Atualizar CSVs (se necessário):
   - Produtos: /root/app-precos/frontend/public/produtos.csv
   - Clientes: /root/app-precos/frontend/public/clientes.csv
   - Descontos: /root/app-precos/frontend/public/descontos.csv
   
   Após atualizar CSVs:
```bash
cd /root/app-precos
docker compose restart frontend
```

## CONFIGURAR HTTPS (RECOMENDADO)

1. Registrar um domínio e apontar para o IP 72.61.62.17

2. Instalar Certbot:
```bash
apt update
apt install certbot python3-certbot-nginx
```

3. Obter certificado:
```bash
certbot --nginx -d seu-dominio.com
```

4. Atualizar .env:
```env
CORS_ORIGIN=https://seu-dominio.com
VITE_API_URL=https://seu-dominio.com
```

5. Rebuild:
```bash
docker compose up -d --build
```

## FIREWALL (IMPORTANTE)

Permitir portas 80 e 443:
```bash
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
```

## MANUTENÇÃO

### Ver logs em tempo real:
```bash
docker compose logs -f
```

### Reiniciar serviços:
```bash
docker compose restart
```

### Atualizar código:
```bash
cd /root/app-precos
# Fazer alterações
docker compose up -d --build
```

### Backup do banco:
MongoDB Atlas faz backup automático. Configure no painel do Atlas.

### Limpar recursos Docker:
```bash
docker system prune -a
```

## TROUBLESHOOTING

### Erro de conexão com MongoDB:
- Verificar MONGO_URI no .env
- Verificar whitelist de IPs no MongoDB Atlas
- Testar conexão: `docker compose exec backend node -e "console.log(process.env.MONGO_URI)"`

### Frontend não carrega:
```bash
docker compose logs frontend
docker compose exec frontend nginx -t
```

### Backend retorna erro:
```bash
docker compose logs backend
docker compose exec backend env
```

### Porta 80 em uso:
```bash
netstat -tulpn | grep :80
# Parar serviço conflitante ou usar outra porta
```

## CONTATOS ÚTEIS

- MongoDB Atlas: https://cloud.mongodb.com
- Docker Docs: https://docs.docker.com
- Certbot: https://certbot.eff.org

## CHECKLIST FINAL

- [ ] MongoDB Atlas configurado
- [ ] .env configurado corretamente
- [ ] Docker e Docker Compose instalados
- [ ] Deploy executado com sucesso
- [ ] Admin criado (admin@admin.com)
- [ ] Sistema acessível via navegador
- [ ] Senha do admin alterada
- [ ] Usuários cadastrados
- [ ] CSVs atualizados (se necessário)
- [ ] HTTPS configurado (opcional mas recomendado)
- [ ] Firewall configurado
- [ ] Backup configurado no MongoDB Atlas
