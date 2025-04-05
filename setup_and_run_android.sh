#!/bin/bash

# Cores para melhor visualização
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Configuração do Ambiente Android para ENEM Prep AI ===${NC}"

# Verificar se o Android SDK está instalado
if [ -d "$HOME/Android/Sdk" ]; then
  ANDROID_SDK="$HOME/Android/Sdk"
  echo -e "${GREEN}✓ Android SDK encontrado em $ANDROID_SDK${NC}"
elif [ -d "$HOME/Android/sdk" ]; then
  ANDROID_SDK="$HOME/Android/sdk"
  echo -e "${GREEN}✓ Android SDK encontrado em $ANDROID_SDK${NC}"
else
  echo -e "${YELLOW}! Android SDK não encontrado nos locais padrão${NC}"
  
  # Criar diretório para o Android SDK
  echo -e "${BLUE}Criando diretório para o Android SDK...${NC}"
  mkdir -p ~/Android/sdk
  ANDROID_SDK="$HOME/Android/sdk"
  echo -e "${GREEN}✓ Diretório criado em $ANDROID_SDK${NC}"
  
  echo -e "${YELLOW}! Você precisa instalar o Android SDK manualmente.${NC}"
  echo -e "${YELLOW}! Recomendamos instalar o Android Studio: https://developer.android.com/studio${NC}"
fi

# Configurar variáveis de ambiente
echo -e "${BLUE}Configurando variáveis de ambiente...${NC}"
export ANDROID_HOME=$ANDROID_SDK
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools

# Salvar as variáveis de ambiente no arquivo .bashrc
if ! grep -q "ANDROID_HOME" ~/.bashrc; then
  echo -e "${BLUE}Adicionando variáveis de ambiente ao .bashrc...${NC}"
  echo "# Android SDK configuration" >> ~/.bashrc
  echo "export ANDROID_HOME=\$HOME/Android/sdk" >> ~/.bashrc
  echo "export PATH=\$PATH:\$ANDROID_HOME/emulator" >> ~/.bashrc
  echo "export PATH=\$PATH:\$ANDROID_HOME/tools" >> ~/.bashrc
  echo "export PATH=\$PATH:\$ANDROID_HOME/tools/bin" >> ~/.bashrc
  echo "export PATH=\$PATH:\$ANDROID_HOME/platform-tools" >> ~/.bashrc
  echo -e "${GREEN}✓ Variáveis de ambiente adicionadas ao .bashrc${NC}"
else
  echo -e "${GREEN}✓ Variáveis de ambiente já configuradas no .bashrc${NC}"
fi

# Verificar se o adb está disponível
if command -v adb &> /dev/null; then
  echo -e "${GREEN}✓ ADB (Android Debug Bridge) encontrado${NC}"
else
  echo -e "${YELLOW}! ADB não encontrado. Verifique se o Android SDK Platform Tools está instalado${NC}"
fi

# Verificar dispositivos conectados
echo -e "${BLUE}Verificando dispositivos Android conectados...${NC}"
DEVICES=$(adb devices | grep -v "List" | grep "device" | wc -l)

if [ $DEVICES -gt 0 ]; then
  echo -e "${GREEN}✓ $DEVICES dispositivo(s) Android conectado(s)${NC}"
  adb devices | grep -v "List"
else
  echo -e "${YELLOW}! Nenhum dispositivo Android conectado${NC}"
  
  # Verificar emuladores disponíveis
  if command -v emulator &> /dev/null; then
    echo -e "${BLUE}Verificando emuladores disponíveis...${NC}"
    EMULATORS=$(emulator -list-avds | wc -l)
    
    if [ $EMULATORS -gt 0 ]; then
      echo -e "${GREEN}✓ $EMULATORS emulador(es) disponível(is):${NC}"
      emulator -list-avds
      
      echo -e "${YELLOW}Deseja iniciar um emulador? (s/n)${NC}"
      read -p "Resposta: " START_EMULATOR
      
      if [ "$START_EMULATOR" == "s" ] || [ "$START_EMULATOR" == "S" ]; then
        echo -e "${BLUE}Escolha um emulador para iniciar:${NC}"
        emulator -list-avds
        read -p "Nome do emulador: " EMULATOR_NAME
        
        echo -e "${BLUE}Iniciando emulador $EMULATOR_NAME...${NC}"
        emulator -avd $EMULATOR_NAME -no-snapshot-load &
        
        echo -e "${YELLOW}Aguardando o emulador iniciar...${NC}"
        sleep 10
        
        # Verificar se o emulador iniciou corretamente
        EMULATOR_STARTED=$(adb devices | grep -v "List" | grep "emulator" | wc -l)
        if [ $EMULATOR_STARTED -gt 0 ]; then
          echo -e "${GREEN}✓ Emulador iniciado com sucesso${NC}"
        else
          echo -e "${RED}✗ Falha ao iniciar o emulador${NC}"
        fi
      fi
    else
      echo -e "${YELLOW}! Nenhum emulador disponível. Crie um emulador no Android Studio${NC}"
    fi
  else
    echo -e "${YELLOW}! Comando 'emulator' não encontrado. Verifique se o Android SDK Emulator está instalado${NC}"
  fi
fi

# Perguntar se o usuário quer iniciar o aplicativo
echo -e "${BLUE}Deseja iniciar o aplicativo ENEM Prep AI? (s/n)${NC}"
read -p "Resposta: " START_APP

if [ "$START_APP" == "s" ] || [ "$START_APP" == "S" ]; then
  echo -e "${BLUE}Iniciando o aplicativo ENEM Prep AI...${NC}"
  cd /home/huggyturd/Documents/augment-projects/EnemPrepAI/EnemPrepAppExpo
  npx expo start --android
else
  echo -e "${BLUE}Configuração concluída. Execute o aplicativo manualmente quando estiver pronto.${NC}"
  echo -e "${BLUE}Comando para iniciar: ${GREEN}npx expo start --android${NC}"
fi
