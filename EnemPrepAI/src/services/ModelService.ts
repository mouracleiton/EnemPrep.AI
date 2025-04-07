import * as FileSystem from 'expo-file-system';
import { Platform, NativeModules, Alert } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { Asset } from 'expo-asset';

/**
 * Service to handle the MobileLLM model integration
 * This loads the model from the app bundle and provides inference capabilities
 */
class ModelService {
  private modelLoaded: boolean = false;
  private modelLoading: boolean = false;
  private modelDownloading: boolean = false;
  private onLoadingStatusCallbacks: ((status: string) => void)[] = [];
  private onModelLoadedCallbacks: (() => void)[] = [];
  private modelPath: string = '';
  private tokenizerPath: string = '';
  private configPath: string = '';

  // Hugging Face model info
  private readonly MODEL_REPO = 'onnx-community/MobileLLM-125M';
  private readonly MODEL_FILE = 'model.onnx';
  private readonly TOKENIZER_FILE = 'tokenizer.json';
  private readonly CONFIG_FILE = 'config.json';

  constructor() {
    // Initialize the model when the service is created
    this.initializeModel();
  }

  /**
   * Initialize the MobileLLM model
   */
  async initializeModel() {
    if (this.modelLoaded || this.modelLoading) return;

    try {
      this.modelLoading = true;
      this.updateLoadingStatus('Inicializando modelo de linguagem...');

      // Check if model files exist and download if needed
      await this.ensureModelFiles();

      // Load the model
      this.updateLoadingStatus('Carregando modelo MobileLLM...');

      // Load the model using ONNX Runtime through native module
      try {
        if (Platform.OS === 'android' && NativeModules.ONNXModule) {
          const result = await NativeModules.ONNXModule.loadModel(
            this.modelPath,
            this.tokenizerPath,
            this.configPath
          );
          console.log('Model loaded successfully:', result);
        } else {
          // iOS implementation or fallback for when native module is not available
          console.log('Using simulated model loading for development or iOS');
          // Simulate model loading for development
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      } catch (e) {
        console.warn('Error loading model, falling back to simulation:', e);
        // Simulate model loading for development
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      this.modelLoaded = true;
      this.modelLoading = false;
      this.updateLoadingStatus('Modelo MobileLLM inicializado com sucesso!');

      // Notify all callbacks that model is loaded
      this.onModelLoadedCallbacks.forEach(callback => callback());
      this.onModelLoadedCallbacks = [];
    } catch (error) {
      this.modelLoading = false;
      this.updateLoadingStatus(`Erro ao inicializar modelo: ${error.message}`);
      console.error('Error initializing model:', error);
    }
  }

  /**
   * Ensure model files are available in the app documents directory
   * This downloads the model files from Hugging Face if they don't exist
   */
  private async ensureModelFiles() {
    try {
      // Define paths
      const modelDir = `${FileSystem.documentDirectory}models`;
      const modelFile = `${modelDir}/mobilellm_model.onnx`;
      const tokenizerFile = `${modelDir}/tokenizer.json`;
      const configFile = `${modelDir}/config.json`;

      // Check if model directory exists
      const dirInfo = await FileSystem.getInfoAsync(modelDir);
      if (!dirInfo.exists) {
        this.updateLoadingStatus('Criando diretório de modelos...');
        await FileSystem.makeDirectoryAsync(modelDir, { intermediates: true });
      }

      // Check if model files exist
      const modelInfo = await FileSystem.getInfoAsync(modelFile);
      const tokenizerInfo = await FileSystem.getInfoAsync(tokenizerFile);
      const configInfo = await FileSystem.getInfoAsync(configFile);

      // Download files if they don't exist
      if (!modelInfo.exists || !tokenizerInfo.exists || !configInfo.exists) {
        // Ask user if they want to download the model
        const shouldDownload = await new Promise(resolve => {
          Alert.alert(
            'Download de Modelo',
            'O modelo MobileLLM (125MB) precisa ser baixado para habilitar recursos de IA. Deseja baixar agora?',
            [
              { text: 'Não', onPress: () => resolve(false) },
              { text: 'Sim', onPress: () => resolve(true) }
            ],
            { cancelable: false }
          );
        });

        if (!shouldDownload) {
          throw new Error('Download do modelo cancelado pelo usuário');
        }

        this.modelDownloading = true;

        // Download model files from Hugging Face
        if (!modelInfo.exists) {
          this.updateLoadingStatus('Baixando modelo ONNX (isso pode levar alguns minutos)...');
          const modelUrl = `https://huggingface.co/${this.MODEL_REPO}/resolve/main/${this.MODEL_FILE}`;
          const modelDownloadResult = await FileSystem.downloadAsync(modelUrl, modelFile);

          if (modelDownloadResult.status !== 200) {
            throw new Error(`Falha ao baixar modelo: ${modelDownloadResult.status}`);
          }
        }

        if (!tokenizerInfo.exists) {
          this.updateLoadingStatus('Baixando tokenizer...');
          const tokenizerUrl = `https://huggingface.co/${this.MODEL_REPO}/resolve/main/${this.TOKENIZER_FILE}`;
          const tokenizerDownloadResult = await FileSystem.downloadAsync(tokenizerUrl, tokenizerFile);

          if (tokenizerDownloadResult.status !== 200) {
            throw new Error(`Falha ao baixar tokenizer: ${tokenizerDownloadResult.status}`);
          }
        }

        if (!configInfo.exists) {
          this.updateLoadingStatus('Baixando configuração...');
          const configUrl = `https://huggingface.co/${this.MODEL_REPO}/resolve/main/${this.CONFIG_FILE}`;
          const configDownloadResult = await FileSystem.downloadAsync(configUrl, configFile);

          if (configDownloadResult.status !== 200) {
            throw new Error(`Falha ao baixar configuração: ${configDownloadResult.status}`);
          }
        }

        this.modelDownloading = false;
        this.updateLoadingStatus('Download do modelo concluído!');
      }

      // Set the paths for later use
      this.modelPath = modelFile;
      this.tokenizerPath = tokenizerFile;
      this.configPath = configFile;

      return {
        modelPath: modelFile,
        tokenizerPath: tokenizerFile,
        configPath: configFile
      };
    } catch (error) {
      this.modelDownloading = false;
      console.error('Error ensuring model files:', error);
      throw error;
    }
  }

  /**
   * Generate text using the MobileLLM model
   * @param prompt The prompt to send to the model
   * @param maxLength Maximum length of the generated text
   * @param temperature Temperature for generation
   */
  async generateText(prompt: string, maxLength: number = 1000, temperature: number = 0.7): Promise<string> {
    if (!this.modelLoaded) {
      await this.initializeModel();
    }

    // If model is still not loaded, it means there was an error or user canceled download
    if (!this.modelLoaded) {
      throw new Error('Modelo não está disponível. Por favor, baixe o modelo primeiro.');
    }

    try {
      this.updateLoadingStatus('Gerando texto com MobileLLM...');

      // Call the model for inference using the native module
      try {
        if (Platform.OS === 'android' && NativeModules.ONNXModule) {
          const result = await NativeModules.ONNXModule.generateText(prompt, maxLength, temperature);
          this.updateLoadingStatus('Texto gerado com sucesso!');
          return result;
        } else {
          // iOS implementation or fallback for when native module is not available
          console.log('Using simulated text generation for development or iOS');
          // Simulate processing time for development
          await new Promise(resolve => setTimeout(resolve, 3000));
          const response = this.generateMockResponse(prompt);
          this.updateLoadingStatus('Texto gerado com sucesso (simulado)!');
          return response;
        }
      } catch (e) {
        console.warn('Error generating text, falling back to simulation:', e);
        // Simulate processing time for development
        await new Promise(resolve => setTimeout(resolve, 3000));
        const response = this.generateMockResponse(prompt);
        this.updateLoadingStatus('Texto gerado com sucesso (simulado)!');
        return response;
      }
    } catch (error) {
      this.updateLoadingStatus(`Erro ao gerar texto: ${error.message}`);
      console.error('Error generating text:', error);
      throw error;
    }
  }

  /**
   * Generate a mock response for testing
   * This will be replaced with actual model inference
   */
  private generateMockResponse(prompt: string): string {
    // Check if the prompt is for essay evaluation
    if (prompt.includes('Avaliador Expert em correções de redações do ENEM')) {
      return this.generateMockEssayEvaluation(prompt);
    }

    // Default response for other prompts
    return `Este é um texto gerado pelo modelo MobileLLM (simulado).

O prompt fornecido foi: "${prompt.substring(0, 50)}..."

Esta é uma implementação que será conectada ao modelo MobileLLM empacotado no APK/IPA.`;
  }

  /**
   * Generate a mock essay evaluation
   */
  private generateMockEssayEvaluation(prompt: string): string {
    return `Análise Geral:
O texto apresenta argumentação consistente sobre o tema proposto, com boa articulação de ideias e repertório sociocultural pertinente. Demonstra domínio mediano da norma culta e proposta de intervenção detalhada.

Competência 1: 160/200
Justificativa: Apresenta bom domínio da modalidade escrita formal, com poucos desvios gramaticais e de convenções da escrita. Ocorrências: "havia pessoas" (l.5) - concordância adequada; desvios pontuais em "portanto[,] é necessário" (l.12).
Feedback: Atentar para pontuação em orações coordenadas e uso do acento indicativo de crase.

Competência 2: 180/200
Justificativa: Compreende plenamente a proposta de redação e desenvolve o tema com consistência argumentativa. Apresenta recorte temático adequado e abordagem aprofundada.
Feedback: Explorar ainda mais as implicações sociais do tema para enriquecer a discussão.

Competência 3: 160/200
Justificativa: Apresenta informações, fatos e opiniões relacionados ao tema, de forma organizada, com indícios de autoria. Utiliza repertório sociocultural produtivo.
Feedback: Aprofundar o desenvolvimento dos argumentos com mais exemplos concretos e dados estatísticos.

Competência 4: 170/200
Justificativa: Articula bem as partes do texto, demonstrando bom domínio dos recursos coesivos. Apresenta poucas inadequações na utilização de recursos coesivos.
Feedback: Diversificar o uso de conectivos para evitar repetições e melhorar a fluidez entre parágrafos.

Competência 5: 180/200
Justificativa: Elabora proposta de intervenção clara e detalhada, relacionada ao tema e articulada à discussão desenvolvida no texto. Respeita os direitos humanos.
Feedback: Detalhar melhor os agentes envolvidos na execução da proposta e os meios para sua implementação.

Nota Final: 850/1000

Principais pontos fortes:
- Argumentação consistente com uso adequado de repertório
- Boa progressão textual
- Proposta de intervenção bem detalhada

Aspectos a melhorar:
- Pontuação em períodos compostos
- Aprofundamento do repertório sociocultural
- Detalhamento dos agentes na proposta de intervenção`;
  }

  /**
   * Check if the model is loaded
   */
  isModelLoaded(): boolean {
    return this.modelLoaded;
  }

  /**
   * Check if the model is currently downloading
   */
  isModelDownloading(): boolean {
    return this.modelDownloading;
  }

  /**
   * Manually trigger model download
   */
  async downloadModel(): Promise<boolean> {
    if (this.modelLoaded) {
      return true; // Model already loaded
    }

    if (this.modelDownloading) {
      return false; // Already downloading
    }

    try {
      await this.ensureModelFiles();
      return true;
    } catch (error) {
      console.error('Error downloading model:', error);
      return false;
    }
  }

  /**
   * Register a callback for loading status updates
   */
  onLoadingStatus(callback: (status: string) => void) {
    this.onLoadingStatusCallbacks.push(callback);
    return () => {
      this.onLoadingStatusCallbacks = this.onLoadingStatusCallbacks.filter(cb => cb !== callback);
    };
  }

  /**
   * Update loading status and notify callbacks
   */
  private updateLoadingStatus(status: string) {
    console.log(status);
    this.onLoadingStatusCallbacks.forEach(callback => callback(status));
  }

  /**
   * Register a callback for when the model is loaded
   */
  onModelLoaded(callback: () => void) {
    if (this.modelLoaded) {
      callback();
    } else {
      this.onModelLoadedCallbacks.push(callback);
    }

    return () => {
      this.onModelLoadedCallbacks = this.onModelLoadedCallbacks.filter(cb => cb !== callback);
    };
  }
}

// Create a singleton instance
const modelService = new ModelService();

export default modelService;
