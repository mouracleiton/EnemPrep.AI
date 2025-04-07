import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import Icon from 'react-native-vector-icons/MaterialIcons';
import ocrService from '../services/OCRService';
import essayEvaluationService from '../services/EssayEvaluationService';
import EssayFeatureWrapper from '../components/EssayFeatureWrapper';

type EssayScanScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const EssayScanScreen: React.FC = () => {
  const navigation = useNavigation<EssayScanScreenNavigationProp>();
  const [loading, setLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    // Register for loading status updates
    const unsubscribeOCR = ocrService.onLoadingStatus((status) => {
      setLoadingStatus(status);
    });

    const unsubscribeEssay = essayEvaluationService.onLoadingStatus((status) => {
      setLoadingStatus(status);
    });

    return () => {
      unsubscribeOCR();
      unsubscribeEssay();
    };
  }, []);

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf'],
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return;
      }

      // Handle the selected document
      const fileUri = result.assets[0].uri;
      const fileType = result.assets[0].mimeType || '';

      if (fileType.startsWith('image/')) {
        // If it's an image, set it directly
        setSelectedImage(fileUri);
      } else if (fileType === 'application/pdf') {
        // For PDFs, we would need to convert to image first
        // This is a simplified version - in a real app, you'd need a PDF renderer
        Alert.alert(
          'PDF Selecionado',
          'O processamento de PDFs é limitado. Para melhores resultados, use imagens diretamente.',
          [{ text: 'OK' }]
        );
        setSelectedImage(null);
      } else {
        Alert.alert(
          'Formato não suportado',
          'Por favor, selecione uma imagem ou um PDF.',
          [{ text: 'OK' }]
        );
        setSelectedImage(null);
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Erro', 'Ocorreu um erro ao selecionar o documento.');
    }
  };

  const processDocument = async () => {
    if (!selectedImage) {
      Alert.alert('Erro', 'Nenhuma imagem selecionada.');
      return;
    }

    try {
      setLoading(true);
      setLoadingStatus('Processando imagem...');

      // Process the image to enhance text recognition
      const processedImage = await ImageManipulator.manipulateAsync(
        selectedImage,
        [
          { resize: { width: 1600 } }, // Resize for better processing
          { contrast: 1.2 }, // Increase contrast
          { brightness: -0.1 }, // Slightly darken to enhance text
        ],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );

      // Extract text using OCR
      setLoadingStatus('Extraindo texto...');
      const extractedText = await ocrService.processImage(processedImage.uri);

      // Validate the extracted text
      const validation = essayEvaluationService.validateEssayLength(extractedText);

      if (!validation.valid) {
        setLoading(false);
        Alert.alert(
          'Texto Extraído Inválido',
          `${validation.message}\n\nPor favor, tente novamente com uma imagem mais clara ou use a opção de digitar a redação.`,
          [{ text: 'OK' }]
        );
        return;
      }

      // Evaluate the essay
      setLoadingStatus('Avaliando redação...');
      const evaluation = await essayEvaluationService.evaluateEssay(extractedText);

      setLoading(false);

      // Navigate to results screen with the evaluation
      navigation.navigate('EssayResult', { evaluationId: evaluation.id });
    } catch (error) {
      setLoading(false);
      Alert.alert('Erro', error.message || 'Ocorreu um erro ao processar a imagem.');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>{loadingStatus || 'Processando...'}</Text>
      </View>
    );
  }

  return (
    <EssayFeatureWrapper>
      <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Escanear Documento</Text>
        <Text style={styles.subtitle}>
          Selecione uma imagem da sua galeria para processar
        </Text>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>
          Para melhores resultados, certifique-se de que:
        </Text>
        <View style={styles.tipItem}>
          <Icon name="check" size={16} color="#2ecc71" />
          <Text style={styles.tipText}>A imagem está bem iluminada e nítida</Text>
        </View>
        <View style={styles.tipItem}>
          <Icon name="check" size={16} color="#2ecc71" />
          <Text style={styles.tipText}>O texto está legível e sem manchas</Text>
        </View>
        <View style={styles.tipItem}>
          <Icon name="check" size={16} color="#2ecc71" />
          <Text style={styles.tipText}>A redação está completamente visível na imagem</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.pickButton}
        onPress={pickDocument}
      >
        <Icon name="file-upload" size={32} color="#fff" />
        <Text style={styles.pickButtonText}>Selecionar Documento</Text>
      </TouchableOpacity>

      {selectedImage && (
        <View style={styles.imagePreviewContainer}>
          <Text style={styles.previewTitle}>Documento Selecionado:</Text>
          <Image
            source={{ uri: selectedImage }}
            style={styles.imagePreview}
            resizeMode="contain"
          />

          <TouchableOpacity
            style={styles.processButton}
            onPress={processDocument}
          >
            <Icon name="document-scanner" size={20} color="#fff" />
            <Text style={styles.processButtonText}>Processar Documento</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionsTitle}>Como funciona:</Text>
        <View style={styles.instructionItem}>
          <Text style={styles.instructionNumber}>1</Text>
          <Text style={styles.instructionText}>
            Selecione uma imagem da sua galeria que contenha sua redação
          </Text>
        </View>
        <View style={styles.instructionItem}>
          <Text style={styles.instructionNumber}>2</Text>
          <Text style={styles.instructionText}>
            O sistema processará a imagem e extrairá o texto usando OCR
          </Text>
        </View>
        <View style={styles.instructionItem}>
          <Text style={styles.instructionNumber}>3</Text>
          <Text style={styles.instructionText}>
            A redação será avaliada de acordo com os critérios do ENEM
          </Text>
        </View>
        <View style={styles.instructionItem}>
          <Text style={styles.instructionNumber}>4</Text>
          <Text style={styles.instructionText}>
            Você receberá uma avaliação detalhada com notas e sugestões
          </Text>
        </View>
      </View>
    </ScrollView>
    </EssayFeatureWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  header: {
    padding: 20,
    backgroundColor: '#3498db',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  infoContainer: {
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    margin: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  infoText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 10,
  },
  pickButton: {
    backgroundColor: '#3498db',
    padding: 20,
    borderRadius: 8,
    margin: 15,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  pickButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
  },
  imagePreviewContainer: {
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    margin: 15,
    marginTop: 0,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    alignSelf: 'flex-start',
  },
  imagePreview: {
    width: '100%',
    height: 300,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  processButton: {
    backgroundColor: '#2ecc71',
    padding: 15,
    borderRadius: 8,
    marginTop: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  processButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  instructionsContainer: {
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    margin: 15,
    marginTop: 0,
    marginBottom: 30,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  instructionItem: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  instructionNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#3498db',
    color: '#fff',
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: 'bold',
    marginRight: 10,
  },
  instructionText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
});

export default EssayScanScreen;
