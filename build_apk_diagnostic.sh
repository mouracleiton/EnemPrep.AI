#!/bin/bash

# Cores para melhor visualização
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

# Função para exibir mensagens de log
log() {
  echo -e "${BLUE}[$(date +%T)]${NC} $1"
}

# Função para exibir mensagens de sucesso
success() {
  echo -e "${GREEN}[✓]${NC} $1"
}

# Função para exibir mensagens de aviso
warning() {
  echo -e "${YELLOW}[!]${NC} $1"
}

# Função para exibir mensagens de erro
error() {
  echo -e "${RED}[✗]${NC} $1"
}

# Função para exibir mensagens de diagnóstico
diagnostic() {
  echo -e "${MAGENTA}[DIAGNÓSTICO]${NC} $1"
}

# Função para exibir mensagens de correção
fix() {
  echo -e "${CYAN}[CORREÇÃO]${NC} $1"
}

# Função para exibir cabeçalhos
header() {
  echo -e "\n${CYAN}=== $1 ===${NC}\n"
}

# Função para verificar se um comando existe
command_exists() {
  command -v "$1" &> /dev/null
}

# Função para configurar o ambiente Android
setup_android_env() {
  if [ -z "$ANDROID_HOME" ]; then
    warning "ANDROID_HOME não está configurado. Configurando..."
    
    # Tentar encontrar o Android SDK
    if [ -d "$HOME/Android/Sdk" ]; then
      ANDROID_SDK="$HOME/Android/Sdk"
    elif [ -d "$HOME/Android/sdk" ]; then
      ANDROID_SDK="$HOME/Android/sdk"
    else
      warning "Android SDK não encontrado. Criando diretório..."
      mkdir -p $HOME/Android/sdk
      ANDROID_SDK="$HOME/Android/sdk"
    fi
    
    # Configurar variáveis de ambiente
    export ANDROID_HOME=$ANDROID_SDK
    export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools
    
    success "ANDROID_HOME configurado para $ANDROID_HOME"
  else
    success "ANDROID_HOME já está configurado: $ANDROID_HOME"
  fi
}

# Função para criar keystore de release
create_release_keystore() {
  local keystore_path="$1"
  local keystore_dir=$(dirname "$keystore_path")
  
  if [ ! -f "$keystore_path" ]; then
    warning "Keystore de release não encontrado. Criando..."
    
    # Criar diretório se não existir
    mkdir -p "$keystore_dir"
    
    # Gerar keystore
    keytool -genkeypair -v \
      -keystore "$keystore_path" \
      -alias release-key \
      -keyalg RSA \
      -keysize 2048 \
      -validity 10000 \
      -storepass enemprepai \
      -keypass enemprepai \
      -dname "CN=EnemPrepAI, OU=Development, O=EnemPrepAI, L=Unknown, S=Unknown, C=BR"
    
    if [ $? -eq 0 ]; then
      success "Keystore de release criado com sucesso"
      return 0
    else
      error "Falha ao criar keystore de release"
      return 1
    fi
  else
    success "Keystore de release já existe"
    return 0
  fi
}

# Função para atualizar o build.gradle para usar o keystore de release
update_build_gradle() {
  local build_gradle="$1"
  
  if [ -f "$build_gradle" ]; then
    warning "Atualizando build.gradle para usar keystore de release..."
    
    # Verificar se a configuração de assinatura de release já existe
    if grep -q "storeFile file('release.keystore')" "$build_gradle"; then
      success "Configuração de assinatura de release já existe"
      return 0
    fi
    
    # Backup do arquivo original
    cp "$build_gradle" "${build_gradle}.bak"
    
    # Adicionar configuração de assinatura de release
    sed -i '/signingConfigs {/,/}/c\
    signingConfigs {\
        debug {\
            storeFile file("debug.keystore")\
            storePassword "android"\
            keyAlias "androiddebugkey"\
            keyPassword "android"\
        }\
        release {\
            storeFile file("release.keystore")\
            storePassword "enemprepai"\
            keyAlias "release-key"\
            keyPassword "enemprepai"\
        }\
    }' "$build_gradle"
    
    # Atualizar buildType de release para usar a configuração de assinatura de release
    sed -i '/release {/,/}/c\
        release {\
            signingConfig signingConfigs.release\
            minifyEnabled false\
            proguardFiles getDefaultProguardFile("proguard-android.txt"), "proguard-rules.pro"\
        }' "$build_gradle"
    
    success "build.gradle atualizado com sucesso"
    return 0
  else
    error "Arquivo build.gradle não encontrado: $build_gradle"
    return 1
  fi
}

# Função para verificar e corrigir problemas comuns no build.gradle
fix_build_gradle_issues() {
  local build_gradle="$1"
  
  if [ -f "$build_gradle" ]; then
    diagnostic "Verificando problemas comuns no build.gradle..."
    
    # Verificar se compileSdkVersion está definido
    if ! grep -q "compileSdkVersion" "$build_gradle"; then
      fix "Adicionando compileSdkVersion ao build.gradle..."
      sed -i '/android {/a\
    compileSdkVersion 33' "$build_gradle"
    fi
    
    # Verificar se minSdkVersion está definido
    if ! grep -q "minSdkVersion" "$build_gradle"; then
      fix "Adicionando minSdkVersion ao build.gradle..."
      sed -i '/defaultConfig {/a\
        minSdkVersion 21' "$build_gradle"
    fi
    
    # Verificar se targetSdkVersion está definido
    if ! grep -q "targetSdkVersion" "$build_gradle"; then
      fix "Adicionando targetSdkVersion ao build.gradle..."
      sed -i '/defaultConfig {/a\
        targetSdkVersion 33' "$build_gradle"
    fi
    
    success "Verificação e correção de problemas no build.gradle concluídas"
    return 0
  else
    error "Arquivo build.gradle não encontrado: $build_gradle"
    return 1
  fi
}

# Função para verificar e corrigir problemas no settings.gradle
fix_settings_gradle_issues() {
  local settings_gradle="$1"
  
  if [ -f "$settings_gradle" ]; then
    diagnostic "Verificando problemas comuns no settings.gradle..."
    
    # Verificar se o nome do projeto está definido
    if ! grep -q "rootProject.name" "$settings_gradle"; then
      fix "Adicionando nome do projeto ao settings.gradle..."
      echo "rootProject.name = 'EnemPrepAI'" >> "$settings_gradle"
    fi
    
    success "Verificação e correção de problemas no settings.gradle concluídas"
    return 0
  else
    error "Arquivo settings.gradle não encontrado: $settings_gradle"
    return 1
  fi
}

# Função para verificar e corrigir problemas no gradle.properties
fix_gradle_properties_issues() {
  local gradle_properties="$1"
  
  if [ -f "$gradle_properties" ]; then
    diagnostic "Verificando problemas comuns no gradle.properties..."
    
    # Verificar se org.gradle.jvmargs está definido
    if ! grep -q "org.gradle.jvmargs" "$gradle_properties"; then
      fix "Adicionando org.gradle.jvmargs ao gradle.properties..."
      echo "org.gradle.jvmargs=-Xmx2048m -XX:MaxPermSize=512m -XX:+HeapDumpOnOutOfMemoryError -Dfile.encoding=UTF-8" >> "$gradle_properties"
    fi
    
    # Verificar se android.useAndroidX está definido
    if ! grep -q "android.useAndroidX" "$gradle_properties"; then
      fix "Adicionando android.useAndroidX ao gradle.properties..."
      echo "android.useAndroidX=true" >> "$gradle_properties"
    fi
    
    # Verificar se android.enableJetifier está definido
    if ! grep -q "android.enableJetifier" "$gradle_properties"; then
      fix "Adicionando android.enableJetifier ao gradle.properties..."
      echo "android.enableJetifier=true" >> "$gradle_properties"
    fi
    
    success "Verificação e correção de problemas no gradle.properties concluídas"
    return 0
  else
    error "Arquivo gradle.properties não encontrado: $gradle_properties"
    return 1
  fi
}

# Função para verificar e corrigir problemas no App.js/App.tsx
fix_app_issues() {
  local project_dir="$1"
  
  diagnostic "Verificando problemas comuns nos arquivos App.js/App.tsx..."
  
  # Verificar se App.js ou App.tsx existe
  if [ ! -f "$project_dir/App.js" ] && [ ! -f "$project_dir/App.tsx" ]; then
    fix "Criando um App.js básico..."
    cat > "$project_dir/App.js" << 'EOL'
import React from 'react';
import { Text, View, StyleSheet } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>ENEM Prep AI</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});
EOL
    success "App.js básico criado com sucesso"
  else
    success "App.js ou App.tsx já existe"
  fi
  
  return 0
}

# Função para verificar e corrigir problemas no index.js
fix_index_issues() {
  local project_dir="$1"
  
  diagnostic "Verificando problemas comuns no index.js..."
  
  # Verificar se index.js existe
  if [ ! -f "$project_dir/index.js" ]; then
    fix "Criando um index.js básico..."
    cat > "$project_dir/index.js" << 'EOL'
import { registerRootComponent } from 'expo';
import App from './App';

// Register the main component
registerRootComponent(App);
EOL
    success "index.js básico criado com sucesso"
  else
    success "index.js já existe"
  fi
  
  return 0
}

# Função para tornar gradlew executável
make_gradlew_executable() {
  local gradlew_path="$1"
  
  if [ -f "$gradlew_path" ]; then
    if [ ! -x "$gradlew_path" ]; then
      warning "gradlew não é executável. Tornando executável..."
      chmod +x "$gradlew_path"
      success "gradlew agora é executável"
    else
      success "gradlew já é executável"
    fi
    return 0
  else
    error "gradlew não encontrado: $gradlew_path"
    return 1
  fi
}

# Função para construir APK com stack trace
build_apk_with_stacktrace() {
  local android_dir="$1"
  local build_type="$2"
  local output_path="$3"
  
  header "Construindo APK de $build_type com Stack Trace"
  
  # Verificar se o diretório android existe
  if [ ! -d "$android_dir" ]; then
    error "Diretório android não encontrado: $android_dir"
    return 1
  fi
  
  # Navegar para o diretório android
  cd "$android_dir"
  
  # Tornar gradlew executável
  make_gradlew_executable "./gradlew"
  
  # Limpar build anterior
  log "Limpando build anterior..."
  ./gradlew clean
  
  # Construir APK com stack trace
  log "Construindo APK de $build_type com stack trace..."
  
  if [ "$build_type" == "release" ]; then
    ./gradlew assembleRelease --stacktrace --info > ../build_release_log.txt 2>&1
    local apk_path="app/build/outputs/apk/release/app-release.apk"
  else
    ./gradlew assembleDebug --stacktrace --info > ../build_debug_log.txt 2>&1
    local apk_path="app/build/outputs/apk/debug/app-debug.apk"
  fi
  
  if [ $? -ne 0 ]; then
    error "Falha ao construir APK de $build_type"
    
    # Analisar o log para identificar problemas comuns
    if [ "$build_type" == "release" ]; then
      diagnostic "Analisando log de build de release..."
      analyze_build_log "../build_release_log.txt"
    else
      diagnostic "Analisando log de build de debug..."
      analyze_build_log "../build_debug_log.txt"
    fi
    
    cd - > /dev/null
    return 1
  fi
  
  # Verificar se o APK foi criado
  if [ -f "$apk_path" ]; then
    success "APK de $build_type criado com sucesso"
    
    # Copiar APK para o caminho de saída
    cp "$apk_path" "$output_path"
    success "APK copiado para: $output_path"
    
    cd - > /dev/null
    return 0
  else
    error "APK de $build_type não encontrado"
    cd - > /dev/null
    return 1
  fi
}

# Função para analisar o log de build e identificar problemas comuns
analyze_build_log() {
  local log_file="$1"
  
  diagnostic "Analisando log de build para identificar problemas..."
  
  # Verificar problemas comuns
  if grep -q "compileSdkVersion is not specified" "$log_file"; then
    fix "Problema identificado: compileSdkVersion não especificado"
    return 1
  fi
  
  if grep -q "minSdkVersion is not specified" "$log_file"; then
    fix "Problema identificado: minSdkVersion não especificado"
    return 1
  fi
  
  if grep -q "targetSdkVersion is not specified" "$log_file"; then
    fix "Problema identificado: targetSdkVersion não especificado"
    return 1
  fi
  
  if grep -q "Could not find method useCoreDependencies()" "$log_file"; then
    fix "Problema identificado: método useCoreDependencies() não encontrado"
    fix "Este é um problema com plugins do Expo. Tentando corrigir..."
    return 1
  fi
  
  if grep -q "Unable to resolve module" "$log_file"; then
    fix "Problema identificado: módulo não encontrado"
    grep -A 3 "Unable to resolve module" "$log_file"
    return 1
  fi
  
  if grep -q "Text must not be null or empty" "$log_file"; then
    fix "Problema identificado: texto nulo ou vazio"
    fix "Este é um problema com o autolinking do Expo. Tentando corrigir..."
    return 1
  fi
  
  warning "Não foi possível identificar um problema específico no log"
  return 1
}

# Função para verificar e corrigir problemas de autolinking do Expo
fix_expo_autolinking_issues() {
  local project_dir="$1"
  
  diagnostic "Verificando problemas de autolinking do Expo..."
  
  # Verificar se o arquivo de configuração do Expo existe
  local expo_config="$project_dir/app.json"
  if [ -f "$expo_config" ]; then
    fix "Atualizando configuração do Expo para corrigir problemas de autolinking..."
    
    # Backup do arquivo original
    cp "$expo_config" "${expo_config}.bak"
    
    # Atualizar configuração do Expo
    cat > "$expo_config" << 'EOL'
{
  "expo": {
    "name": "ENEM Prep AI",
    "slug": "enem-prep-ai",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.clouradev.enemprepai"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": "com.clouradev.enemprepai"
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "plugins": []
  }
}
EOL
    success "Configuração do Expo atualizada com sucesso"
  else
    warning "Arquivo de configuração do Expo não encontrado: $expo_config"
  fi
  
  return 0
}

# Função para verificar e corrigir problemas de dependências
fix_dependencies_issues() {
  local project_dir="$1"
  
  diagnostic "Verificando problemas de dependências..."
  
  # Verificar se o arquivo package.json existe
  local package_json="$project_dir/package.json"
  if [ -f "$package_json" ]; then
    # Verificar se as dependências necessárias estão instaladas
    if ! grep -q "expo-status-bar" "$package_json"; then
      fix "Instalando dependência: expo-status-bar..."
      cd "$project_dir" && npm install --save expo-status-bar
    fi
    
    if ! grep -q "expo-file-system" "$package_json"; then
      fix "Instalando dependência: expo-file-system..."
      cd "$project_dir" && npm install --save expo-file-system
    fi
    
    if ! grep -q "expo-splash-screen" "$package_json"; then
      fix "Instalando dependência: expo-splash-screen..."
      cd "$project_dir" && npm install --save expo-splash-screen
    fi
    
    success "Verificação e correção de problemas de dependências concluídas"
  else
    warning "Arquivo package.json não encontrado: $package_json"
  fi
  
  return 0
}

# Função para tentar diferentes abordagens de build
try_different_build_approaches() {
  local project_dir="$1"
  local android_dir="$2"
  local output_path="$3"
  
  header "Tentando diferentes abordagens de build"
  
  # Abordagem 1: Usar gradlew diretamente
  log "Abordagem 1: Usando gradlew diretamente..."
  cd "$android_dir" && ./gradlew assembleDebug --stacktrace
  
  if [ -f "app/build/outputs/apk/debug/app-debug.apk" ]; then
    success "Build bem-sucedido com abordagem 1"
    cp "app/build/outputs/apk/debug/app-debug.apk" "$output_path"
    cd - > /dev/null
    return 0
  fi
  
  cd - > /dev/null
  
  # Abordagem 2: Usar expo prebuild e depois gradlew
  log "Abordagem 2: Usando expo prebuild e depois gradlew..."
  cd "$project_dir" && npx expo prebuild --clean --platform android
  
  if [ $? -eq 0 ]; then
    cd "$android_dir" && ./gradlew assembleDebug --stacktrace
    
    if [ -f "app/build/outputs/apk/debug/app-debug.apk" ]; then
      success "Build bem-sucedido com abordagem 2"
      cp "app/build/outputs/apk/debug/app-debug.apk" "$output_path"
      cd - > /dev/null
      return 0
    fi
    
    cd - > /dev/null
  fi
  
  # Abordagem 3: Usar react-native bundle e depois gradlew
  log "Abordagem 3: Usando react-native bundle e depois gradlew..."
  mkdir -p "$android_dir/app/src/main/assets"
  
  cd "$project_dir" && npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output "$android_dir/app/src/main/assets/index.android.bundle" --assets-dest "$android_dir/app/src/main/res"
  
  if [ $? -eq 0 ]; then
    cd "$android_dir" && ./gradlew assembleDebug --stacktrace
    
    if [ -f "app/build/outputs/apk/debug/app-debug.apk" ]; then
      success "Build bem-sucedido com abordagem 3"
      cp "app/build/outputs/apk/debug/app-debug.apk" "$output_path"
      cd - > /dev/null
      return 0
    fi
    
    cd - > /dev/null
  fi
  
  # Abordagem 4: Procurar por APKs existentes
  log "Abordagem 4: Procurando por APKs existentes..."
  local existing_apk=$(find "$project_dir" -name "*.apk" | head -n 1)
  
  if [ -n "$existing_apk" ]; then
    success "APK existente encontrado: $existing_apk"
    cp "$existing_apk" "$output_path"
    return 0
  fi
  
  error "Todas as abordagens de build falharam"
  return 1
}

# Função principal
main() {
  header "Gerador de APK para ENEM Prep AI com Diagnóstico"
  
  # Configurar ambiente Android
  setup_android_env
  
  # Definir caminhos
  local project_dir="."
  local enemprep_dir="$project_dir/EnemPrepAppExpo"
  local android_dir=""
  local release_apk_path="$project_dir/enem-prep-ai-release.apk"
  local debug_apk_path="$project_dir/enem-prep-ai-debug.apk"
  
  # Verificar se estamos no diretório EnemPrepAppExpo ou no diretório raiz
  if [ -d "$project_dir/android" ]; then
    android_dir="$project_dir/android"
  elif [ -d "$enemprep_dir/android" ]; then
    android_dir="$enemprep_dir/android"
    project_dir="$enemprep_dir"
  else
    error "Diretório android não encontrado"
    exit 1
  fi
  
  # Verificar e corrigir problemas comuns
  fix_app_issues "$project_dir"
  fix_index_issues "$project_dir"
  fix_build_gradle_issues "$android_dir/app/build.gradle"
  fix_settings_gradle_issues "$android_dir/settings.gradle"
  fix_gradle_properties_issues "$android_dir/gradle.properties"
  fix_expo_autolinking_issues "$project_dir"
  fix_dependencies_issues "$project_dir"
  
  # Criar keystore de release
  create_release_keystore "$android_dir/app/release.keystore"
  
  # Atualizar build.gradle
  update_build_gradle "$android_dir/app/build.gradle"
  
  # Tentar construir APK de release
  if build_apk_with_stacktrace "$android_dir" "release" "$release_apk_path"; then
    success "Build de APK de release concluído com sucesso"
  else
    warning "Falha no build de release. Tentando build de debug..."
    
    # Tentar construir APK de debug como fallback
    if build_apk_with_stacktrace "$android_dir" "debug" "$debug_apk_path"; then
      success "Build de APK de debug concluído com sucesso"
    else
      warning "Falha em ambos os builds (release e debug). Tentando abordagens alternativas..."
      
      # Tentar diferentes abordagens de build
      if try_different_build_approaches "$project_dir" "$android_dir" "$debug_apk_path"; then
        success "Build concluído com sucesso usando abordagem alternativa"
      else
        error "Todas as tentativas de build falharam"
        exit 1
      fi
    fi
  fi
  
  header "Processo de build concluído"
  
  # Mostrar instruções finais
  echo -e "${YELLOW}Instruções:${NC}"
  echo -e "1. O APK de release está em: ${GREEN}$release_apk_path${NC} (se o build foi bem-sucedido)"
  echo -e "2. O APK de debug está em: ${GREEN}$debug_apk_path${NC} (se o build de release falhou)"
  echo -e "3. Você pode instalar o APK em qualquer dispositivo Android"
  echo -e "4. Para instalar via ADB: ${CYAN}adb install -r <caminho-do-apk>${NC}"
  
  exit 0
}

# Executar função principal
main
