import * as FileSystem from 'expo-file-system';
import { DataService } from './DataService';
import { ModelService } from './ModelService';

export class AssetDownloadService {
  private static instance: AssetDownloadService;
  private onProgressCallbacks: ((progress: number) => void)[] = [];
  private downloading: boolean = false;

  private constructor() {}

  static getInstance(): AssetDownloadService {
    if (!this.instance) {
      this.instance = new AssetDownloadService();
    }
    return this.instance;
  }

  onProgress(callback: (progress: number) => void) {
    this.onProgressCallbacks.push(callback);
    return () => {
      this.onProgressCallbacks = this.onProgressCallbacks.filter(cb => cb !== callback);
    };
  }

  async downloadAllAssets() {
    if (this.downloading) return;
    this.downloading = true;

    try {
      // 1. Iniciar download do modelo
      const modelService = ModelService.getInstance();
      if (!modelService.isModelLoaded()) {
        await modelService.downloadModel();
      }

      // 2. Preparar diretório de imagens
      const imgDir = `${FileSystem.documentDirectory}assets/img`;
      await FileSystem.makeDirectoryAsync(imgDir, { intermediates: true });

      // 3. Obter lista de todas as imagens das questões
      const questions = DataService.getInstance().getAllQuestions();
      const imageFiles = new Set<string>();
      
      questions.forEach(question => {
        if (question.files) {
          question.files.forEach(file => imageFiles.add(file));
        }
        // Checar imagens nas alternativas também
        question.alternatives?.forEach(alt => {
          if (alt.file) imageFiles.add(alt.file);
        });
      });

      // 4. Download das imagens
      const totalImages = imageFiles.size;
      let downloadedImages = 0;

      for (const imageFile of imageFiles) {
        const destination = `${imgDir}/${imageFile}`;
        const fileInfo = await FileSystem.getInfoAsync(destination);

        if (!fileInfo.exists) {
          const imageUrl = `https://seu-servidor.com/images/${imageFile}`;
          await FileSystem.downloadAsync(imageUrl, destination);
        }

        downloadedImages++;
        const progress = (downloadedImages / totalImages) * 100;
        this.onProgressCallbacks.forEach(callback => callback(progress));
      }

      return true;
    } catch (error) {
      console.error('Error downloading assets:', error);
      return false;
    } finally {
      this.downloading = false;
    }
  }

  isDownloading(): boolean {
    return this.downloading;
  }
}