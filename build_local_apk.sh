#!/bin/bash

# Cores para melhor visualização
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Criando APK Local do ENEM Prep AI ===${NC}"

# Verificar se o Android SDK está configurado
if [ -z "$ANDROID_HOME" ]; then
  echo -e "${YELLOW}! ANDROID_HOME não está configurado. Configurando...${NC}"
  
  # Tentar encontrar o Android SDK
  if [ -d "$HOME/Android/Sdk" ]; then
    ANDROID_SDK="$HOME/Android/Sdk"
  elif [ -d "$HOME/Android/sdk" ]; then
    ANDROID_SDK="$HOME/Android/sdk"
  else
    echo -e "${YELLOW}! Android SDK não encontrado. Criando diretório...${NC}"
    mkdir -p $HOME/Android/sdk
    ANDROID_SDK="$HOME/Android/sdk"
  fi
  
  # Configurar variáveis de ambiente
  export ANDROID_HOME=$ANDROID_SDK
  export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools
  
  echo -e "${GREEN}✓ ANDROID_HOME configurado para $ANDROID_HOME${NC}"
fi

# Verificar se o diretório android já existe
if [ -d "android" ]; then
  echo -e "${YELLOW}! Diretório android já existe. Deseja recriá-lo? (s/n)${NC}"
  read -p "Resposta: " RECREATE_ANDROID
  
  if [ "$RECREATE_ANDROID" == "s" ] || [ "$RECREATE_ANDROID" == "S" ]; then
    echo -e "${YELLOW}! Removendo diretório android...${NC}"
    rm -rf android
    echo -e "${GREEN}✓ Diretório android removido${NC}"
  fi
fi

# Preparar o projeto para build nativo se o diretório android não existir
if [ ! -d "android" ]; then
  echo -e "${BLUE}Preparando o projeto para build nativo...${NC}"
  npx expo prebuild --platform android --no-install
  
  if [ $? -ne 0 ]; then
    echo -e "${RED}✗ Falha ao preparar o projeto para build nativo${NC}"
    exit 1
  fi
  
  echo -e "${GREEN}✓ Projeto preparado para build nativo${NC}"
fi

# Navegar para o diretório android
cd android

# Verificar se o gradlew é executável
if [ ! -x "gradlew" ]; then
  echo -e "${YELLOW}! gradlew não é executável. Tornando executável...${NC}"
  chmod +x gradlew
  echo -e "${GREEN}✓ gradlew agora é executável${NC}"
fi

# Executar o build
echo -e "${BLUE}Executando build do APK...${NC}"
./gradlew assembleRelease

if [ $? -ne 0 ]; then
  echo -e "${RED}✗ Falha ao criar o APK${NC}"
  cd ..
  exit 1
fi

# Verificar se o APK foi criado
if [ -f "app/build/outputs/apk/release/app-release.apk" ]; then
  echo -e "${GREEN}✓ APK criado com sucesso!${NC}"
  
  # Copiar o APK para a raiz do projeto
  cp app/build/outputs/apk/release/app-release.apk ../enem-prep-ai.apk
  cd ..
  
  echo -e "${GREEN}✓ APK copiado para a raiz do projeto: enem-prep-ai.apk${NC}"
  echo -e "${YELLOW}! Você pode instalar este APK em qualquer dispositivo Android.${NC}"
else
  echo -e "${RED}✗ APK não encontrado${NC}"
  cd ..
  exit 1
fi

echo -e "${BLUE}Processo de build concluído!${NC}"
