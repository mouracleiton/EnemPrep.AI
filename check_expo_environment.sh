#!/bin/bash

# Cores para melhor visualização
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Verificação do Ambiente Expo para ENEM Prep AI ===${NC}"

# Verificar se o Node.js está instalado
if command -v node &> /dev/null; then
  NODE_VERSION=$(node -v)
  echo -e "${GREEN}✓ Node.js instalado: $NODE_VERSION${NC}"
else
  echo -e "${RED}✗ Node.js não encontrado. Por favor, instale o Node.js: https://nodejs.org/${NC}"
  exit 1
fi

# Verificar se o npm está instalado
if command -v npm &> /dev/null; then
  NPM_VERSION=$(npm -v)
  echo -e "${GREEN}✓ npm instalado: $NPM_VERSION${NC}"
else
  echo -e "${RED}✗ npm não encontrado. Por favor, reinstale o Node.js: https://nodejs.org/${NC}"
  exit 1
fi

# Verificar se o Expo CLI está instalado
if command -v expo &> /dev/null; then
  EXPO_VERSION=$(expo --version)
  echo -e "${GREEN}✓ Expo CLI instalado: $EXPO_VERSION${NC}"
else
  echo -e "${YELLOW}! Expo CLI não encontrado. Instalando...${NC}"
  npm install -g expo-cli
  
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Expo CLI instalado com sucesso${NC}"
  else
    echo -e "${RED}✗ Falha ao instalar o Expo CLI${NC}"
    exit 1
  fi
fi

# Verificar se o Expo Go está instalado no dispositivo
echo -e "${YELLOW}! Certifique-se de que o aplicativo Expo Go está instalado no seu dispositivo móvel${NC}"
echo -e "${YELLOW}! Android: https://play.google.com/store/apps/details?id=host.exp.exponent${NC}"
echo -e "${YELLOW}! iOS: https://apps.apple.com/app/expo-go/id982107779${NC}"

# Verificar dependências do projeto
echo -e "${BLUE}Verificando dependências do projeto...${NC}"
if [ -f "package.json" ]; then
  echo -e "${GREEN}✓ package.json encontrado${NC}"
  
  # Verificar se node_modules existe
  if [ -d "node_modules" ]; then
    echo -e "${GREEN}✓ node_modules encontrado${NC}"
  else
    echo -e "${YELLOW}! node_modules não encontrado. Instalando dependências...${NC}"
    npm install --legacy-peer-deps
    
    if [ $? -eq 0 ]; then
      echo -e "${GREEN}✓ Dependências instaladas com sucesso${NC}"
    else
      echo -e "${RED}✗ Falha ao instalar dependências${NC}"
      exit 1
    fi
  fi
else
  echo -e "${RED}✗ package.json não encontrado. Verifique se você está no diretório correto${NC}"
  exit 1
fi

# Verificar se o arquivo de dados existe
if [ -f "assets/enem_data_with_lessons.json" ]; then
  echo -e "${GREEN}✓ Arquivo de dados encontrado${NC}"
else
  echo -e "${YELLOW}! Arquivo de dados não encontrado. Verificando no diretório pai...${NC}"
  
  if [ -f "../enem_data_with_lessons.json" ]; then
    echo -e "${YELLOW}! Copiando arquivo de dados do diretório pai...${NC}"
    cp ../enem_data_with_lessons.json ./assets/
    
    if [ $? -eq 0 ]; then
      echo -e "${GREEN}✓ Arquivo de dados copiado com sucesso${NC}"
    else
      echo -e "${RED}✗ Falha ao copiar arquivo de dados${NC}"
    fi
  else
    echo -e "${RED}✗ Arquivo de dados não encontrado. O aplicativo pode não funcionar corretamente${NC}"
  fi
fi

# Verificar se o diretório de imagens existe
if [ -d "assets/img" ]; then
  IMG_COUNT=$(find assets/img -type f | wc -l)
  echo -e "${GREEN}✓ Diretório de imagens encontrado com $IMG_COUNT arquivos${NC}"
else
  echo -e "${YELLOW}! Diretório de imagens não encontrado. Verificando no diretório pai...${NC}"
  
  if [ -d "../img" ]; then
    echo -e "${YELLOW}! Copiando diretório de imagens do diretório pai...${NC}"
    mkdir -p assets/img
    cp -r ../img/* ./assets/img/
    
    if [ $? -eq 0 ]; then
      IMG_COUNT=$(find assets/img -type f | wc -l)
      echo -e "${GREEN}✓ Diretório de imagens copiado com sucesso ($IMG_COUNT arquivos)${NC}"
    else
      echo -e "${RED}✗ Falha ao copiar diretório de imagens${NC}"
    fi
  else
    echo -e "${RED}✗ Diretório de imagens não encontrado. O aplicativo pode não exibir imagens corretamente${NC}"
  fi
fi

# Perguntar se o usuário quer iniciar o aplicativo
echo -e "${BLUE}Deseja iniciar o aplicativo ENEM Prep AI? (s/n)${NC}"
read -p "Resposta: " START_APP

if [ "$START_APP" == "s" ] || [ "$START_APP" == "S" ]; then
  echo -e "${BLUE}Como você deseja executar o aplicativo?${NC}"
  echo -e "${YELLOW}1) Android${NC}"
  echo -e "${YELLOW}2) iOS${NC}"
  echo -e "${YELLOW}3) Ambos (modo padrão)${NC}"
  read -p "Escolha (1/2/3): " PLATFORM
  
  case $PLATFORM in
    1)
      echo -e "${BLUE}Iniciando o aplicativo para Android...${NC}"
      npx expo start --android
      ;;
    2)
      echo -e "${BLUE}Iniciando o aplicativo para iOS...${NC}"
      npx expo start --ios
      ;;
    *)
      echo -e "${BLUE}Iniciando o aplicativo no modo padrão...${NC}"
      npx expo start
      ;;
  esac
else
  echo -e "${BLUE}Verificação concluída. Execute o aplicativo manualmente quando estiver pronto.${NC}"
  echo -e "${BLUE}Comando para iniciar: ${GREEN}npx expo start${NC}"
fi
