#!/bin/bash

# Cores para melhor visualização
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Criando APK local para ENEM Prep AI ===${NC}"

# Verificar se o Android SDK está configurado
if [ -z "$ANDROID_HOME" ]; then
  echo -e "${YELLOW}! Variável ANDROID_HOME não configurada${NC}"
  
  # Tentar encontrar o Android SDK
  if [ -d "$HOME/Android/Sdk" ]; then
    ANDROID_SDK="$HOME/Android/Sdk"
    echo -e "${GREEN}✓ Android SDK encontrado em $ANDROID_SDK${NC}"
  elif [ -d "$HOME/Android/sdk" ]; then
    ANDROID_SDK="$HOME/Android/sdk"
    echo -e "${GREEN}✓ Android SDK encontrado em $ANDROID_SDK${NC}"
  else
    echo -e "${RED}✗ Android SDK não encontrado. Por favor, instale o Android SDK primeiro.${NC}"
    echo -e "${YELLOW}Você pode usar o script setup_android_sdk.sh para configurar o ambiente.${NC}"
    exit 1
  fi
  
  # Configurar variáveis de ambiente
  echo -e "${BLUE}Configurando variáveis de ambiente temporárias...${NC}"
  export ANDROID_HOME=$ANDROID_SDK
  export PATH=$PATH:$ANDROID_HOME/emulator
  export PATH=$PATH:$ANDROID_HOME/tools
  export PATH=$PATH:$ANDROID_HOME/tools/bin
  export PATH=$PATH:$ANDROID_HOME/platform-tools
fi

echo -e "${GREEN}✓ Android SDK configurado em $ANDROID_HOME${NC}"

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

# Preparar o projeto para build nativo
echo -e "${BLUE}Preparando o projeto para build nativo...${NC}"
npx expo prebuild --platform android --clean

if [ $? -ne 0 ]; then
  echo -e "${RED}✗ Falha ao preparar o projeto. Verifique os erros acima.${NC}"
  exit 1
fi

echo -e "${GREEN}✓ Projeto preparado para build nativo${NC}"

# Corrigir possíveis problemas com arquivos gradle
echo -e "${BLUE}Corrigindo arquivos gradle...${NC}"
npm run fix-gradle

# Navegar para o diretório android
echo -e "${BLUE}Navegando para o diretório android...${NC}"
cd android

# Limpar builds anteriores
echo -e "${BLUE}Limpando builds anteriores...${NC}"
./gradlew clean

if [ $? -ne 0 ]; then
  echo -e "${RED}✗ Falha ao limpar builds anteriores. Verifique os erros acima.${NC}"
  cd ..
  exit 1
fi

# Executar o build de release
echo -e "${BLUE}Executando build de release...${NC}"
./gradlew assembleRelease

if [ $? -ne 0 ]; then
  echo -e "${RED}✗ Falha ao criar o APK. Verifique os erros acima.${NC}"
  cd ..
  exit 1
fi

echo -e "${GREEN}✓ APK criado com sucesso${NC}"

# Copiar o APK para a raiz do projeto
echo -e "${BLUE}Copiando APK para a raiz do projeto...${NC}"
cd ..
cp android/app/build/outputs/apk/release/app-release.apk ./enem-prep-ai.apk

if [ $? -ne 0 ]; then
  echo -e "${RED}✗ Falha ao copiar o APK. Verifique se o arquivo foi criado.${NC}"
  exit 1
fi

echo -e "${GREEN}✓ APK copiado para ./enem-prep-ai.apk${NC}"
echo -e "${BLUE}=== Build concluído com sucesso! ===${NC}"
echo -e "${YELLOW}Você pode instalar o APK em seu dispositivo Android.${NC}"
