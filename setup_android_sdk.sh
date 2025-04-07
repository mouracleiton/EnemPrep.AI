#!/bin/bash

# Criar diretório para o Android SDK
mkdir -p ~/Android/sdk

# Definir variáveis de ambiente para a sessão atual
export ANDROID_HOME=~/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools

# Salvar as variáveis de ambiente no arquivo .bashrc
echo "# Android SDK configuration" >> ~/.bashrc
echo "export ANDROID_HOME=\$HOME/Android/sdk" >> ~/.bashrc
echo "export PATH=\$PATH:\$ANDROID_HOME/emulator" >> ~/.bashrc
echo "export PATH=\$PATH:\$ANDROID_HOME/tools" >> ~/.bashrc
echo "export PATH=\$PATH:\$ANDROID_HOME/tools/bin" >> ~/.bashrc
echo "export PATH=\$PATH:\$ANDROID_HOME/platform-tools" >> ~/.bashrc

echo "Configuração do Android SDK concluída!"
echo "ANDROID_HOME configurado para: $ANDROID_HOME"
echo "Por favor, execute 'source ~/.bashrc' para aplicar as mudanças na sessão atual."
echo ""
echo "Agora você precisa baixar o Android SDK. Recomendamos usar o Android Studio para isso."
echo "Após instalar o Android Studio, vá em Tools > SDK Manager e baixe os componentes necessários."
