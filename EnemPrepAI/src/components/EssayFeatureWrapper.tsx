import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import modelService from '../services/ModelService';

type EssayFeatureWrapperNavigationProp = NativeStackNavigationProp<RootStackParamList>;

/**
 * A wrapper component for the essay feature that handles error cases
 * and provides a fallback UI when necessary
 */
const EssayFeatureWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigation = useNavigation<EssayFeatureWrapperNavigationProp>();
  const isModelLoaded = modelService.isModelLoaded();

  const handleModelDownload = () => {
    navigation.navigate('ModelDownload');
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  // If the model is not loaded, show a warning
  if (!isModelLoaded) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Modelo de IA Necessário</Text>
        <Text style={styles.message}>
          Para usar a funcionalidade de redação, é necessário baixar o modelo de IA.
          Este modelo permite a avaliação de redações e o reconhecimento de texto em imagens.
        </Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.downloadButton}
            onPress={handleModelDownload}
          >
            <Text style={styles.buttonText}>Baixar Modelo</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleGoBack}
          >
            <Text style={styles.backButtonText}>Voltar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // If everything is OK, render the children
  return <>{children}</>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  buttonContainer: {
    width: '100%',
    flexDirection: 'column',
    alignItems: 'center',
  },
  downloadButton: {
    backgroundColor: '#3498db',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 15,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bdc3c7',
    width: '80%',
    alignItems: 'center',
  },
  backButtonText: {
    color: '#7f8c8d',
    fontSize: 16,
  },
});

export default EssayFeatureWrapper;
