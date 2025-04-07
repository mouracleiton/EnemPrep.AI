#!/bin/bash

# Cores para melhor visualização
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Iniciando ENEM Prep AI com Hermes ativado ===${NC}"

# Limpar o cache do Metro
echo -e "${YELLOW}Limpando o cache do Metro...${NC}"
npx expo start --clear

# Verificar se o comando anterior foi executado com sucesso
if [ $? -ne 0 ]; then
  echo -e "${RED}Falha ao limpar o cache. Tentando método alternativo...${NC}"
  
  # Limpar o cache do Metro manualmente
  echo -e "${YELLOW}Limpando o cache do Metro manualmente...${NC}"
  rm -rf node_modules/.cache
  
  # Limpar o cache do Watchman se estiver instalado
  if command -v watchman &> /dev/null; then
    echo -e "${YELLOW}Limpando o cache do Watchman...${NC}"
    watchman watch-del-all
  fi
  
  # Limpar o cache do Yarn se estiver usando Yarn
  if [ -f "yarn.lock" ]; then
    echo -e "${YELLOW}Limpando o cache do Yarn...${NC}"
    yarn cache clean
  fi
  
  # Limpar o cache do npm
  echo -e "${YELLOW}Limpando o cache do npm...${NC}"
  npm cache clean --force
  
  echo -e "${GREEN}Cache limpo com sucesso!${NC}"
fi

# Verificar se o Hermes está habilitado no app.json
if grep -q "\"jsEngine\": \"hermes\"" app.json; then
  echo -e "${GREEN}✓ Hermes está habilitado no app.json${NC}"
else
  echo -e "${YELLOW}! Hermes não está habilitado no app.json. Habilitando...${NC}"
  # Este comando é simplificado e pode não funcionar em todos os casos
  # É melhor editar o arquivo manualmente como fizemos anteriormente
  echo -e "${RED}Por favor, edite o app.json manualmente para habilitar o Hermes.${NC}"
  echo -e "${YELLOW}Adicione \"jsEngine\": \"hermes\" nas seções android e ios.${NC}"
  exit 1
fi

# Perguntar como o usuário deseja executar o aplicativo
echo -e "${BLUE}Como você deseja executar o aplicativo?${NC}"
echo -e "${YELLOW}1) Android${NC}"
echo -e "${YELLOW}2) iOS${NC}"
echo -e "${YELLOW}3) Ambos (modo padrão)${NC}"
read -p "Escolha (1/2/3): " PLATFORM

case $PLATFORM in
  1)
    echo -e "${BLUE}Iniciando o aplicativo para Android com Hermes...${NC}"
    npx expo start --android --clear
    ;;
  2)
    echo -e "${BLUE}Iniciando o aplicativo para iOS com Hermes...${NC}"
    npx expo start --ios --clear
    ;;
  *)
    echo -e "${BLUE}Iniciando o aplicativo no modo padrão com Hermes...${NC}"
    npx expo start --clear
    ;;
esac
