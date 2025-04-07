import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import modelService from '../services/ModelService';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Screen for managing model downloads
 */
const ModelDownloadScreen: React.FC = () => {
  const [status, setStatus] = useState<string>('');
  const [isModelLoaded, setIsModelLoaded] = useState<boolean>(false);
  const [isModelDownloading, setIsModelDownloading] = useState<boolean>(false);
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    // Check if model is loaded
    setIsModelLoaded(modelService.isModelLoaded());
    setIsModelDownloading(modelService.isModelDownloading());

    // Subscribe to loading status updates
    const unsubscribeStatus = modelService.onLoadingStatus(status => {
      setStatus(status);
    });

    // Subscribe to model loaded events
    const unsubscribeModel = modelService.onModelLoaded(() => {
      setIsModelLoaded(true);
      setIsModelDownloading(false);
    });

    return () => {
      unsubscribeStatus();
      unsubscribeModel();
    };
  }, []);

  /**
   * Handle download button press
   */
  const handleDownload = async () => {
    try {
      setIsModelDownloading(true);
      const success = await modelService.downloadModel();

      if (success) {
        setIsModelLoaded(true);
        Alert.alert(
          'Download Concluído',
          'O modelo foi baixado com sucesso e está pronto para uso.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Download Cancelado',
          'O download do modelo foi cancelado ou falhou.',
          [{ text: 'OK' }]
        );
      }

      setIsModelDownloading(false);
    } catch (error) {
      setIsModelDownloading(false);
      Alert.alert(
        'Erro',
        `Ocorreu um erro ao baixar o modelo: ${error.message}`,
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#3498db" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gerenciador de Modelo</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Modelo MobileLLM</Text>
          <Text style={styles.infoDescription}>
            Este modelo de IA é necessário para funcionalidades como avaliação de redações e reconhecimento de texto em imagens.
            O modelo ocupa aproximadamente 125MB de espaço e funciona completamente offline após o download.
          </Text>

          <View style={styles.statusContainer}>
            <Text style={styles.statusLabel}>Status:</Text>
            <Text style={[
              styles.statusValue,
              isModelLoaded ? styles.statusSuccess : styles.statusPending
            ]}>
              {isModelLoaded ? 'Instalado' : 'Não instalado'}
            </Text>
          </View>

          {status ? (
            <View style={styles.progressContainer}>
              <ActivityIndicator size="small" color="#3498db" />
              <Text style={styles.progressText}>{status}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={[
              styles.downloadButton,
              (isModelLoaded || isModelDownloading) ? styles.downloadButtonDisabled : {}
            ]}
            onPress={handleDownload}
            disabled={isModelLoaded || isModelDownloading}
          >
            <Text style={styles.downloadButtonText}>
              {isModelLoaded ? 'Modelo Instalado' : isModelDownloading ? 'Baixando...' : 'Baixar Modelo'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Informações</Text>
          <Text style={styles.infoDescription}>
            • O modelo MobileLLM é da Meta e baseado no modelo Llama, otimizado para dispositivos móveis.
          </Text>
          <Text style={styles.infoDescription}>
            • Após o download, todas as funcionalidades de IA funcionarão offline.
          </Text>
          <Text style={styles.infoDescription}>
            • Recomendamos usar Wi-Fi para o download do modelo.
          </Text>
          <Text style={styles.infoDescription}>
            • O modelo é armazenado localmente no dispositivo e não é enviado para servidores externos.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  infoDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 8,
  },
  statusValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusSuccess: {
    color: '#27ae60',
  },
  statusPending: {
    color: '#e74c3c',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#f0f8ff',
    padding: 8,
    borderRadius: 4,
  },
  progressText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#3498db',
  },
  downloadButton: {
    backgroundColor: '#3498db',
    borderRadius: 4,
    padding: 12,
    alignItems: 'center',
  },
  downloadButtonDisabled: {
    backgroundColor: '#bdc3c7',
  },
  downloadButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default ModelDownloadScreen;
