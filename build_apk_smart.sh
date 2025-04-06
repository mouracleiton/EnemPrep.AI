#!/bin/bash

# Cores para melhor visualização
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
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

# Função para construir APK de release
build_release_apk() {
  local android_dir="$1"
  local output_path="$2"
  
  header "Construindo APK de Release"
  
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
  
  # Construir APK de release
  log "Construindo APK de release..."
  ./gradlew assembleRelease
  
  if [ $? -ne 0 ]; then
    error "Falha ao construir APK de release"
    cd - > /dev/null
    return 1
  fi
  
  # Verificar se o APK foi criado
  local apk_path="app/build/outputs/apk/release/app-release.apk"
  if [ -f "$apk_path" ]; then
    success "APK de release criado com sucesso"
    
    # Copiar APK para o caminho de saída
    cp "$apk_path" "$output_path"
    success "APK copiado para: $output_path"
    
    cd - > /dev/null
    return 0
  else
    error "APK de release não encontrado"
    cd - > /dev/null
    return 1
  fi
}

# Função para construir APK de debug
build_debug_apk() {
  local android_dir="$1"
  local output_path="$2"
  
  header "Construindo APK de Debug"
  
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
  
  # Construir APK de debug
  log "Construindo APK de debug..."
  ./gradlew assembleDebug
  
  if [ $? -ne 0 ]; then
    error "Falha ao construir APK de debug"
    cd - > /dev/null
    return 1
  fi
  
  # Verificar se o APK foi criado
  local apk_path="app/build/outputs/apk/debug/app-debug.apk"
  if [ -f "$apk_path" ]; then
    success "APK de debug criado com sucesso"
    
    # Copiar APK para o caminho de saída
    cp "$apk_path" "$output_path"
    success "APK copiado para: $output_path"
    
    cd - > /dev/null
    return 0
  else
    error "APK de debug não encontrado"
    cd - > /dev/null
    return 1
  fi
}

# Função para procurar APKs existentes
find_existing_apks() {
  header "Procurando APKs existentes"
  
  local apk_paths=$(find . -name "*.apk" 2>/dev/null)
  
  if [ -n "$apk_paths" ]; then
    success "APKs encontrados:"
    echo "$apk_paths"
    return 0
  else
    warning "Nenhum APK encontrado"
    return 1
  fi
}

# Função principal
main() {
  header "Gerador de APK para ENEM Prep AI"
  
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
    cd "$enemprep_dir"
  else
    error "Diretório android não encontrado"
    find_existing_apks
    exit 1
  fi
  
  # Criar keystore de release
  create_release_keystore "$android_dir/app/release.keystore"
  
  # Atualizar build.gradle
  update_build_gradle "$android_dir/app/build.gradle"
  
  # Tentar construir APK de release
  if build_release_apk "$android_dir" "$release_apk_path"; then
    success "Build de APK de release concluído com sucesso"
  else
    warning "Falha no build de release. Tentando build de debug..."
    
    # Tentar construir APK de debug como fallback
    if build_debug_apk "$android_dir" "$debug_apk_path"; then
      success "Build de APK de debug concluído com sucesso"
    else
      error "Falha em ambos os builds (release e debug)"
      find_existing_apks
      exit 1
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
