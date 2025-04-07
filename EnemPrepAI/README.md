# ENEM Prep AI

Aplicativo de preparação para o ENEM com questões e aulas explicativas geradas por IA.

## Características

- Questões do ENEM com aulas explicativas
- Funciona offline, sem necessidade de conexão com a internet
- Imagens das questões exibidas na ordem correta
- Disponível para Android e iOS

## Requisitos

- Node.js
- npm ou yarn
- Expo CLI
- Android Studio (para desenvolvimento Android)
- Xcode (para desenvolvimento iOS, apenas em macOS)

## Configuração do Ambiente

### Android

1. Instale o Android Studio
2. Configure o Android SDK
3. Execute o script de configuração do ambiente:

```bash
./setup_android_sdk.sh
```

4. Reinicie o terminal ou execute:

```bash
source ~/.bashrc
```

### iOS (apenas macOS)

1. Instale o Xcode
2. Instale o CocoaPods:

```bash
sudo gem install cocoapods
```

## Instalação

1. Clone o repositório
2. Instale as dependências:

```bash
npm install --legacy-peer-deps
```

## Executando o Aplicativo

### Verificação do Ambiente

Antes de executar o aplicativo, verifique se o ambiente está configurado corretamente:

```bash
./check_expo_environment.sh
```

Este script verifica se todas as dependências estão instaladas e se os arquivos necessários estão presentes.

### Configuração do Android

Para configurar o ambiente Android e executar o aplicativo:

```bash
./setup_and_run_android.sh
```

Este script configura o Android SDK, verifica dispositivos conectados, inicia um emulador se necessário e executa o aplicativo.

### Iniciando com o Hermes (Recomendado)

Para iniciar o aplicativo com o motor JavaScript Hermes habilitado (melhor desempenho):

```bash
./start_with_hermes.sh
```

Este script limpa o cache, verifica se o Hermes está habilitado e inicia o aplicativo.

### Usando o script simples

Execute o script para iniciar o aplicativo:

```bash
./run_mobile.sh
```

Siga as instruções para escolher entre Android e iOS.

### Manualmente

Para Android:

```bash
npx expo start --android
```

Para iOS:

```bash
npx expo start --ios
```

### Usando o Expo Go

1. Instale o aplicativo Expo Go no seu dispositivo:
   - [Android](https://play.google.com/store/apps/details?id=host.exp.exponent)
   - [iOS](https://apps.apple.com/app/expo-go/id982107779)

2. Inicie o servidor Expo:

```bash
npx expo start
```

3. Escaneie o código QR com o aplicativo Expo Go (Android) ou com a câmera (iOS)

## Criando o APK

Para criar um arquivo APK que pode ser instalado em dispositivos Android:

### Usando o script simplificado (Recomendado)

Para criar rapidamente um APK local sem depender de serviços externos:

```bash
./build_local_apk.sh
```

Este script:
- Configura automaticamente o ambiente Android
- Prepara o projeto para build nativo
- Gera o APK localmente
- Copia o APK para a raiz do projeto como `enem-prep-ai.apk`

### Usando o script completo

Execute o script de criação de APK com mais opções:

```bash
./build_apk.sh
```

Este script oferece várias opções:

1. **APK de desenvolvimento**: Para testes durante o desenvolvimento
2. **APK de preview**: Para distribuição interna e testes
3. **APK de produção**: Versão final otimizada
4. **APK local**: Construído localmente sem usar os serviços do EAS

### Manualmente com EAS Build

1. Instale o EAS CLI se ainda não tiver
```bash
npm install --save-dev eas-cli
```

2. Faça login na sua conta Expo
```bash
npx eas login
```

3. Configure o projeto para build
```bash
npx eas build:configure
```

4. Inicie o build de produção
```bash
npx eas build --platform android --profile production
```

5. Aguarde o build ser concluído e baixe o APK pelo link fornecido.

### Manualmente sem EAS (build local)

1. Prepare o projeto para build nativo:

```bash
npx expo prebuild --platform android
```

2. Navegue para o diretório android:

```bash
cd android
```

3. Execute o build:

```bash
./gradlew assembleRelease
```

4. O APK estará disponível em `android/app/build/outputs/apk/release/app-release.apk`

## Estrutura do Projeto

- `assets/`: Contém imagens, ícones e dados do aplicativo
  - `img/`: Imagens das questões do ENEM
  - `images/`: Ícones e imagens da interface
  - `enem_data_with_lessons.json`: Dados das questões e aulas
- `src/`: Código-fonte do aplicativo
  - `components/`: Componentes reutilizáveis
  - `screens/`: Telas do aplicativo
  - `services/`: Serviços para manipulação de dados
  - `utils/`: Utilitários e funções auxiliares
  - `navigation/`: Configuração de navegação

## Solução de Problemas

### Erro "No apps connected"

Se você encontrar o erro "No apps connected. Sending 'reload' to all React Native apps failed", isso significa que o Expo não conseguiu encontrar nenhum dispositivo ou emulador conectado.

Soluções:

1. **Verifique se o dispositivo está conectado**:
   ```bash
adb devices
   ```
   Deve mostrar pelo menos um dispositivo na lista.

2. **Inicie um emulador Android**:
   ```bash
./setup_and_run_android.sh
   ```
   Este script vai verificar e iniciar um emulador se necessário.

3. **Use o Expo Go**:
   Instale o aplicativo Expo Go no seu dispositivo e escaneie o código QR.

4. **Reinicie o servidor Expo**:
   Pressione `Ctrl+C` para parar o servidor e inicie novamente com `npx expo start`.

### Erro "No compatible apps connected. JavaScript Debugging can only be used with the Hermes engine"

Este erro ocorre quando você tenta usar o depurador JavaScript, mas o motor Hermes não está habilitado ou não há dispositivos compatíveis conectados.

Soluções:

1. **Use o script para iniciar com Hermes**:
   ```bash
./start_with_hermes.sh
   ```
   Este script limpa o cache e inicia o aplicativo com o Hermes habilitado.

2. **Verifique se o Hermes está habilitado**:
   Abra o arquivo `app.json` e verifique se há `"jsEngine": "hermes"` nas seções `android` e `ios`.

3. **Limpe o cache e reinicie**:
   ```bash
npx expo start --clear
   ```

4. **Use um dispositivo físico**:
   Alguns emuladores podem ter problemas com o Hermes. Tente usar um dispositivo físico.

### Erro de Android SDK

Se você encontrar o erro "Failed to resolve the Android SDK path", execute:

```bash
./setup_and_run_android.sh
```

Este script vai configurar o Android SDK e definir as variáveis de ambiente necessárias.

### Erro de Dependências

Se você encontrar erros de dependências, tente instalar com:

```bash
npm install --legacy-peer-deps
```

ou

```bash
npm install --force
```

### Erro ao Carregar Imagens

Se as imagens não estiverem sendo exibidas corretamente:

1. Verifique se o diretório `assets/img` contém todas as imagens necessárias.
2. Execute o script de verificação do ambiente:
   ```bash
./check_expo_environment.sh
   ```
   Este script vai verificar se os arquivos de imagem estão presentes e copiar do diretório pai se necessário.
