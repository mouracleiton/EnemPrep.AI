#!/bin/bash

# Cores para melhor visualização
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Criação de APK para ENEM Prep AI ===${NC}"

# Verificar se o EAS CLI está instalado
if ! command -v eas &> /dev/null; then
  echo -e "${YELLOW}! EAS CLI não encontrado. Instalando...${NC}"
  npm install --save-dev eas-cli
  
  if [ $? -ne 0 ]; then
    echo -e "${RED}✗ Falha ao instalar EAS CLI. Verifique os erros acima.${NC}"
    exit 1
  fi
  
  echo -e "${GREEN}✓ EAS CLI instalado com sucesso${NC}"
else
  echo -e "${GREEN}✓ EAS CLI já instalado${NC}"
fi

# Verificar se o projeto tem as dependências instaladas
if [ ! -d "node_modules" ]; then
  echo -e "${YELLOW}! Dependências não encontradas. Instalando...${NC}"
  npm install --legacy-peer-deps
  
  if [ $? -ne 0 ]; then
    echo -e "${RED}✗ Falha ao instalar dependências. Verifique os erros acima.${NC}"
    exit 1
  fi
  
  echo -e "${GREEN}✓ Dependências instaladas com sucesso${NC}"
else
  echo -e "${GREEN}✓ Dependências já instaladas${NC}"
fi

# Menu de opções
echo -e "${BLUE}Escolha o tipo de APK que deseja criar:${NC}"
echo -e "${YELLOW}1) APK de desenvolvimento${NC} - Para testes durante o desenvolvimento"
echo -e "${YELLOW}2) APK de preview${NC} - Para distribuição interna e testes"
echo -e "${YELLOW}3) APK de produção${NC} - Versão final otimizada"
echo -e "${YELLOW}4) APK local${NC} - Construído localmente sem usar os serviços do EAS"
echo -e "${YELLOW}5) Sair${NC}"

read -p "Escolha (1-5): " OPTION

case $OPTION in
  1)
    echo -e "${BLUE}Criando APK de desenvolvimento...${NC}"
    npx eas build --platform android --profile development --local
    ;;
  2)
    echo -e "${BLUE}Criando APK de preview...${NC}"
    npx eas build --platform android --profile preview-apk --local
    ;;
  3)
    echo -e "${BLUE}Criando APK de produção...${NC}"
    npx eas build --platform android --profile production-apk --local
    ;;
  4)
    echo -e "${BLUE}Criando APK local...${NC}"
    ./build_local_apk.sh
    ;;
  5)
    echo -e "${BLUE}Saindo...${NC}"
    exit 0
    ;;
  *)
    echo -e "${RED}Opção inválida!${NC}"
    exit 1
    ;;
esac

if [ $OPTION -ne 4 ] && [ $OPTION -ne 5 ]; then
  echo -e "${GREEN}✓ Build concluído!${NC}"
  echo -e "${YELLOW}O APK estará disponível no diretório indicado acima.${NC}"
fi
