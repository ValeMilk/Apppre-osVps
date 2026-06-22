#!/bin/bash

# Script de Deploy para VPS
# App Preços - Valemilk

echo "========================================="
echo "  Deploy App Preços - Valemilk"
echo "========================================="
echo ""

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verificar se Docker está instalado
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker não está instalado!${NC}"
    echo "Por favor, instale o Docker primeiro:"
    echo "curl -fsSL https://get.docker.com -o get-docker.sh"
    echo "sh get-docker.sh"
    exit 1
fi

# Verificar se Docker Compose está instalado
if ! command -v docker compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose não está instalado!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker e Docker Compose encontrados${NC}"
echo ""

# Verificar se .env existe
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  Arquivo .env não encontrado${NC}"
    echo "Criando .env a partir do .env.example..."
    cp .env.example .env
    echo ""
    echo -e "${RED}IMPORTANTE: Edite o arquivo .env com suas configurações antes de continuar!${NC}"
    echo "Execute: nano .env"
    echo ""
    read -p "Pressione ENTER após configurar o .env..."
fi

echo -e "${YELLOW}🔧 Parando containers existentes...${NC}"
docker compose down

echo ""
echo -e "${YELLOW}🏗️  Building containers...${NC}"
docker compose build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Erro ao fazer build dos containers${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}🚀 Iniciando containers...${NC}"
docker compose up -d

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Erro ao iniciar containers${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ Containers iniciados com sucesso!${NC}"
echo ""

# Aguardar containers subirem
echo -e "${YELLOW}⏳ Aguardando containers iniciarem (30 segundos)...${NC}"
sleep 30

# Criar admin
echo ""
echo -e "${YELLOW}👤 Criando usuário admin...${NC}"
docker compose exec -T backend npm run create-admin

echo ""
echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}  ✅ Deploy concluído com sucesso!${NC}"
echo -e "${GREEN}=========================================${NC}"
echo ""
echo "🌐 Acesse o sistema em: http://$(curl -s ifconfig.me)"
echo ""
echo "👤 Credenciais do Admin:"
echo "   Email: admin@admin.com"
echo "   Senha: admin123"
echo ""
echo "📋 Comandos úteis:"
echo "   Ver logs: docker compose logs -f"
echo "   Parar: docker compose down"
echo "   Reiniciar: docker compose restart"
echo ""
echo -e "${RED}⚠️  IMPORTANTE: Altere a senha do admin após o primeiro login!${NC}"
echo ""
