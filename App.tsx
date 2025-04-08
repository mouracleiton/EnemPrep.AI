import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ScrollView, ActivityIndicator, Platform } from 'react-native';
import DataService from './src/services/DataService';
import AppNavigator from './src/navigation/AppNavigator';
import * as SplashScreen from 'expo-splash-screen';
import * as FileSystem from 'expo-file-system';
import { DownloadProgress } from './src/components/DownloadProgress';
import { AssetDownloadService } from './src/services/AssetDownloadService';

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync().catch(() => {
  /* reloading the app might trigger some race conditions, ignore them */
});

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [loadingStatus, setLoadingStatus] = useState('Carregando...');
  const [examsCount, setExamsCount] = useState(0);
  const [questionsCount, setQuestionsCount] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadStatus, setDownloadStatus] = useState('');

  // Function to ensure the assets directory exists
  const ensureAssetsDirectory = async () => {
    if (Platform.OS === 'web') return;

    try {
      const imgDir = `${FileSystem.documentDirectory}assets/img`;
      const dirInfo = await FileSystem.getInfoAsync(imgDir);

      if (!dirInfo.exists) {
        console.log('Creating assets/img directory...');
        await FileSystem.makeDirectoryAsync(imgDir, { intermediates: true });
      }
    } catch (error) {
      console.error('Error ensuring assets directory:', error);
    }
  };

  useEffect(() => {
    const initializeApp = async () => {
      try {
        const downloadService = AssetDownloadService.getInstance();
        
        // Verificar se precisa atualizar
        const needsUpdate = await downloadService.checkForUpdates();
        
        if (needsUpdate) {
          setDownloadStatus('Preparando download dos recursos...');
          
          const unsubscribe = downloadService.onProgress(progress => {
            setDownloadProgress(progress);
            if (progress < 60) {
              setDownloadStatus('Baixando arquivos...');
            } else if (progress < 95) {
              setDownloadStatus('Descompactando arquivos...');
            } else {
              setDownloadStatus('Finalizando...');
            }
          });

          await downloadService.downloadAllAssets();
          unsubscribe();
        }

        // Continuar inicialização normal do app
        await initializeServices();
      } catch (error) {
        console.error('Error initializing app:', error);
        setDownloadStatus('Erro ao baixar recursos. Tente novamente.');
      }
    };

    initializeApp();
  }, []);

  const initializeServices = async () => {
    // Ensure assets directory exists
    ensureAssetsDirectory();

    // Register for loading status updates
    DataService.onLoadingStatus(status => {
      setLoadingStatus(status);
    });

    // Register for data loaded event
    DataService.onDataLoaded(() => {
      setExamsCount(DataService.getExams().length);
      setQuestionsCount(DataService.getAllQuestions().length);
      setImagesLoaded(true);
      setIsLoading(false);

      // Hide the splash screen once everything is loaded
      SplashScreen.hideAsync().catch(e => console.warn('Error hiding splash screen:', e));
    });
  };

  return (
    <>
      {downloadProgress > 0 && downloadProgress < 100 ? (
        <DownloadProgress 
          progress={downloadProgress}
          status={downloadStatus}
        />
      ) : (
        // Seu app normal aqui
        isLoading ? (
          <View style={styles.container}>
            <StatusBar style="auto" />
            <Text style={styles.title}>ENEM Prep App</Text>
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#0000ff" />
              <Text style={styles.loadingText}>{loadingStatus}</Text>
              {examsCount > 0 && (
                <Text style={styles.statsText}>
                  {examsCount} exames, {questionsCount} questões carregadas
                </Text>
              )}
            </View>
          </View>
        ) : (
          <AppNavigator />
        )
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    textAlign: 'center',
  },
  contentContainer: {
    flex: 1,
    width: '100%',
  },
  statsText: {
    fontSize: 18,
    marginBottom: 10,
  },
  infoText: {
    marginTop: 20,
    fontSize: 16,
    textAlign: 'center',
    padding: 10,
    backgroundColor: '#e6f7ff',
    borderRadius: 5,
  },
});
