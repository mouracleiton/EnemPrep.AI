import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
  Platform,
} from 'react-native';
import { Camera, CameraType } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import Icon from 'react-native-vector-icons/MaterialIcons';
import ocrService from '../services/OCRService';
import essayEvaluationService from '../services/EssayEvaluationService';
import EssayFeatureWrapper from '../components/EssayFeatureWrapper';

type EssayCameraScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const { width, height } = Dimensions.get('window');

const EssayCameraScreen: React.FC = () => {
  const navigation = useNavigation<EssayCameraScreenNavigationProp>();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [cameraType, setCameraType] = useState(CameraType.back);
  const [loading, setLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('');
  const [flashMode, setFlashMode] = useState(Camera.Constants.FlashMode.off);
  const cameraRef = useRef<Camera | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');

      if (status !== 'granted') {
        Alert.alert(
          'Permissão Necessária',
          'É necessário permitir o acesso à câmera para usar esta funcionalidade.',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      }
    })();

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

  const takePicture = async () => {
    if (!cameraRef.current) return;

    try {
      setLoading(true);
      setLoadingStatus('Capturando imagem...');

      // Take the picture
      const photo = await cameraRef.current.takePictureAsync({
        quality: 1,
        base64: false,
      });

      // Process the image to enhance text recognition
      setLoadingStatus('Processando imagem...');
      const processedImage = await ImageManipulator.manipulateAsync(
        photo.uri,
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

  const toggleCameraType = () => {
    setCameraType(current => (
      current === CameraType.back ? CameraType.front : CameraType.back
    ));
  };

  const toggleFlash = () => {
    setFlashMode(current => (
      current === Camera.Constants.FlashMode.off
        ? Camera.Constants.FlashMode.torch
        : Camera.Constants.FlashMode.off
    ));
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.text}>Solicitando permissão para a câmera...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Icon name="no-photography" size={64} color="#e74c3c" />
        <Text style={styles.text}>Sem acesso à câmera</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>{loadingStatus || 'Processando...'}</Text>
      </View>
    );
  }

  return (
    <EssayFeatureWrapper>
      <View style={styles.container}>
      <Camera
        ref={cameraRef}
        style={styles.camera}
        type={cameraType}
        flashMode={flashMode}
        ratio="4:3"
      >
        <View style={styles.overlay}>
          <View style={styles.header}>
            <Text style={styles.headerText}>Posicione a Redação</Text>
          </View>

          <View style={styles.documentFrame}>
            {/* Document frame guides */}
            <View style={styles.cornerTL} />
            <View style={styles.cornerTR} />
            <View style={styles.cornerBL} />
            <View style={styles.cornerBR} />
          </View>

          <View style={styles.controls}>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={toggleFlash}
            >
              <Icon
                name={flashMode === Camera.Constants.FlashMode.off ? 'flash-off' : 'flash-on'}
                size={28}
                color="#fff"
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.captureButton}
              onPress={takePicture}
            >
              <View style={styles.captureButtonInner} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.controlButton}
              onPress={toggleCameraType}
            >
              <Icon name="flip-camera-android" size={28} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.instructions}>
            <Text style={styles.instructionText}>
              Certifique-se de que toda a redação está visível e bem iluminada
            </Text>
          </View>
        </View>
      </Camera>
    </View>
    </EssayFeatureWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  camera: {
    flex: 1,
    width: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'space-between',
  },
  header: {
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    alignItems: 'center',
  },
  headerText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  documentFrame: {
    flex: 1,
    margin: 40,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 8,
    position: 'relative',
  },
  cornerTL: {
    position: 'absolute',
    top: -2,
    left: -2,
    width: 20,
    height: 20,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderColor: '#fff',
    borderTopLeftRadius: 8,
  },
  cornerTR: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 20,
    height: 20,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderColor: '#fff',
    borderTopRightRadius: 8,
  },
  cornerBL: {
    position: 'absolute',
    bottom: -2,
    left: -2,
    width: 20,
    height: 20,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderColor: '#fff',
    borderBottomLeftRadius: 8,
  },
  cornerBR: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderColor: '#fff',
    borderBottomRightRadius: 8,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  controlButton: {
    padding: 15,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
  },
  instructions: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 100 : 80,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  instructionText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 40,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  text: {
    color: '#333',
    fontSize: 16,
    marginTop: 20,
    textAlign: 'center',
  },
  button: {
    marginTop: 20,
    backgroundColor: '#3498db',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  loadingText: {
    marginTop: 20,
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    padding: 10,
  },
});

export default EssayCameraScreen;
