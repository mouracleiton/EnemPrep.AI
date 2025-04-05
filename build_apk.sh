#!/bin/bash

# Cores para melhor visualização
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Criando APK do ENEM Prep AI ===${NC}"

# Verificar se o EAS CLI está instalado
if [ -f "node_modules/.bin/eas" ]; then
  echo -e "${GREEN}✓ EAS CLI encontrado localmente${NC}"
  EAS_CMD="npx eas"
elif command -v eas &> /dev/null; then
  echo -e "${GREEN}✓ EAS CLI encontrado globalmente${NC}"
  EAS_CMD="eas"
else
  echo -e "${YELLOW}! EAS CLI não encontrado. Instalando...${NC}"
  npm install --save-dev eas-cli --legacy-peer-deps
  
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ EAS CLI instalado com sucesso${NC}"
    EAS_CMD="npx eas"
  else
    echo -e "${RED}✗ Falha ao instalar o EAS CLI${NC}"
    exit 1
  fi
fi

# Verificar se o arquivo eas.json existe
if [ -f "eas.json" ]; then
  echo -e "${GREEN}✓ Arquivo eas.json encontrado${NC}"
else
  echo -e "${YELLOW}! Arquivo eas.json não encontrado. Criando...${NC}"
  cat > eas.json << 'EOL'
{
  "cli": {
    "version": ">= 3.13.3"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "preview-apk": {
      "extends": "preview",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
EOL
  echo -e "${GREEN}✓ Arquivo eas.json criado${NC}"
fi

# Verificar se o usuário está logado no EAS
echo -e "${BLUE}Verificando login no EAS...${NC}"
$EAS_CMD whoami &> /dev/null

if [ $? -ne 0 ]; then
  echo -e "${YELLOW}! Você não está logado no EAS. Faça login para continuar.${NC}"
  $EAS_CMD login
  
  if [ $? -ne 0 ]; then
    echo -e "${RED}✗ Falha ao fazer login no EAS${NC}"
    echo -e "${YELLOW}! Você pode criar um APK local sem login. Deseja continuar? (s/n)${NC}"
    read -p "Resposta: " CONTINUE_LOCAL
    
    if [ "$CONTINUE_LOCAL" != "s" ] && [ "$CONTINUE_LOCAL" != "S" ]; then
      echo -e "${RED}✗ Operação cancelada${NC}"
      exit 1
    fi
    
    echo -e "${YELLOW}! Continuando com build local...${NC}"
    BUILD_LOCAL=true
  fi
fi

# Perguntar ao usuário qual tipo de build deseja
echo -e "${BLUE}Qual tipo de build você deseja criar?${NC}"
echo -e "${YELLOW}1) APK de desenvolvimento (para testes)${NC}"
echo -e "${YELLOW}2) APK de preview (para distribuição interna)${NC}"
echo -e "${YELLOW}3) APK de produção (versão final)${NC}"
echo -e "${YELLOW}4) APK local (sem EAS)${NC}"
read -p "Escolha (1/2/3/4): " BUILD_TYPE

# Configurar o build com base na escolha do usuário
case $BUILD_TYPE in
  1)
    PROFILE="development"
    echo -e "${BLUE}Criando APK de desenvolvimento...${NC}"
    ;;
  2)
    PROFILE="preview"
    echo -e "${BLUE}Criando APK de preview...${NC}"
    ;;
  3)
    PROFILE="production"
    echo -e "${BLUE}Criando APK de produção...${NC}"
    ;;
  4)
    BUILD_LOCAL=true
    echo -e "${BLUE}Criando APK local...${NC}"
    ;;
  *)
    PROFILE="preview"
    echo -e "${YELLOW}! Opção inválida. Usando perfil de preview.${NC}"
    ;;
esac

# Verificar se o usuário quer um build local
if [ "$BUILD_LOCAL" = true ]; then
  echo -e "${BLUE}Iniciando build local...${NC}"
  
  # Verificar se o Android SDK está configurado
  if [ -z "$ANDROID_HOME" ]; then
    echo -e "${YELLOW}! ANDROID_HOME não está configurado. Configurando...${NC}"
    export ANDROID_HOME="$HOME/Android/sdk"
    export PATH="$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools"
  fi
  
  # Criar diretório para o build
  mkdir -p android/app/build/outputs/apk/release
  
  # Executar o build local
  echo -e "${BLUE}Executando build local...${NC}"
  npx expo prebuild --platform android
  
  if [ $? -ne 0 ]; then
    echo -e "${RED}✗ Falha ao preparar o projeto para build local${NC}"
    exit 1
  fi
  
  # Navegar para o diretório android e executar o build
  cd android
  ./gradlew assembleRelease
  
  if [ $? -ne 0 ]; then
    echo -e "${RED}✗ Falha ao criar o APK local${NC}"
    exit 1
  fi
  
  # Copiar o APK para a raiz do projeto
  cp app/build/outputs/apk/release/app-release.apk ../enem-prep-ai.apk
  cd ..
  
  echo -e "${GREEN}✓ APK local criado com sucesso: enem-prep-ai.apk${NC}"
else
  # Executar o build com EAS
  echo -e "${BLUE}Iniciando build com EAS...${NC}"
  $EAS_CMD build --platform android --profile $PROFILE --non-interactive
  
  if [ $? -ne 0 ]; then
    echo -e "${RED}✗ Falha ao criar o APK com EAS${NC}"
    exit 1
  fi
  
  echo -e "${GREEN}✓ Build iniciado com sucesso!${NC}"
  echo -e "${YELLOW}! O build será processado nos servidores do EAS. Você receberá um link para download quando estiver pronto.${NC}"
fi

echo -e "${BLUE}Processo de build concluído!${NC}"
