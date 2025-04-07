import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import Icon from 'react-native-vector-icons/MaterialIcons';
import essayEvaluationService from '../services/EssayEvaluationService';

type EssayInputScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const EssayInputScreen: React.FC = () => {
  const navigation = useNavigation<EssayInputScreenNavigationProp>();
  const [essayText, setEssayText] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [lineCount, setLineCount] = useState(0);

  useEffect(() => {
    // Register for loading status updates
    const unsubscribe = essayEvaluationService.onLoadingStatus((status) => {
      setLoadingStatus(status);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    // Count words and lines
    const words = essayText.split(/\s+/).filter(word => word.length > 0).length;
    const lines = essayText.split('\n').filter(line => line.trim().length > 0).length;

    setWordCount(words);
    setLineCount(lines);
  }, [essayText]);

  const handleSubmit = async () => {
    // Validate essay length
    const validation = essayEvaluationService.validateEssayLength(essayText);

    if (!validation.valid) {
      Alert.alert('Atenção', validation.message || 'Sua redação não atende aos requisitos de tamanho.');
      return;
    }

    try {
      setLoading(true);
      const evaluation = await essayEvaluationService.evaluateEssay(essayText);
      setLoading(false);

      // Navigate to results screen with the evaluation
      navigation.navigate('EssayResult', { evaluationId: evaluation.id });
    } catch (error) {
      setLoading(false);
      Alert.alert('Erro', error.message || 'Ocorreu um erro ao avaliar sua redação.');
    }
  };

  const handleClear = () => {
    Alert.alert(
      'Limpar Redação',
      'Tem certeza que deseja limpar todo o texto da redação?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Limpar', style: 'destructive', onPress: () => setEssayText('') }
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3498db" />
          <Text style={styles.loadingText}>{loadingStatus || 'Processando...'}</Text>
        </View>
      ) : (
        <ScrollView style={styles.scrollContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Digite sua Redação</Text>
            <Text style={styles.subtitle}>
              Escreva uma redação dissertativa-argumentativa seguindo os critérios do ENEM
            </Text>
          </View>

          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>
              Sua redação deve ter entre 120 e 370 palavras.
              Atualmente: {wordCount} palavras e {lineCount} linhas.
            </Text>
          </View>

          <View style={styles.textInputContainer}>
            <TextInput
              style={styles.textInput}
              multiline
              placeholder="Digite sua redação aqui..."
              value={essayText}
              onChangeText={setEssayText}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={styles.clearButton}
              onPress={handleClear}
            >
              <Icon name="delete" size={20} color="#fff" />
              <Text style={styles.buttonText}>Limpar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.submitButton,
                (!essayText || essayText.trim().length < 10) && styles.submitButtonDisabled
              ]}
              onPress={handleSubmit}
              disabled={!essayText || essayText.trim().length < 10}
            >
              <Icon name="check" size={20} color="#fff" />
              <Text style={styles.buttonText}>Avaliar Redação</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.tipsContainer}>
            <Text style={styles.tipsTitle}>Lembre-se:</Text>
            <View style={styles.tipItem}>
              <Icon name="info" size={20} color="#3498db" />
              <Text style={styles.tipText}>
                Estruture seu texto com introdução, desenvolvimento (2 ou 3 parágrafos) e conclusão
              </Text>
            </View>
            <View style={styles.tipItem}>
              <Icon name="info" size={20} color="#3498db" />
              <Text style={styles.tipText}>
                Apresente uma proposta de intervenção detalhada na conclusão
              </Text>
            </View>
            <View style={styles.tipItem}>
              <Icon name="info" size={20} color="#3498db" />
              <Text style={styles.tipText}>
                Evite desvios da norma culta e mantenha a coesão textual
              </Text>
            </View>
          </View>
        </ScrollView>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  scrollContainer: {
    flex: 1,
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
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  textInputContainer: {
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    margin: 15,
    marginTop: 0,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    minHeight: 300,
  },
  textInput: {
    minHeight: 300,
    fontSize: 16,
    lineHeight: 24,
    textAlignVertical: 'top',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
  },
  clearButton: {
    backgroundColor: '#e74c3c',
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginRight: 10,
  },
  submitButton: {
    backgroundColor: '#2ecc71',
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 2,
  },
  submitButtonDisabled: {
    backgroundColor: '#95a5a6',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 5,
  },
  tipsContainer: {
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    margin: 15,
    marginTop: 0,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 10,
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
});

export default EssayInputScreen;
