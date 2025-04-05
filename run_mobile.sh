#!/bin/bash

# Configurar o ambiente Android
export ANDROID_HOME=~/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools

echo "Ambiente Android configurado:"
echo "ANDROID_HOME=$ANDROID_HOME"

# Verificar se o usuário quer executar no Android ou iOS
echo "Em qual plataforma você deseja executar o aplicativo?"
echo "1) Android"
echo "2) iOS"
read -p "Escolha (1/2): " platform

if [ "$platform" == "1" ]; then
  echo "Iniciando o aplicativo no Android..."
  npx expo start --android
elif [ "$platform" == "2" ]; then
  echo "Iniciando o aplicativo no iOS..."
  npx expo start --ios
else
  echo "Opção inválida. Iniciando o aplicativo no modo padrão..."
  npx expo start
fi
