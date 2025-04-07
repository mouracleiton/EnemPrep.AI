import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import Icon from 'react-native-vector-icons/MaterialIcons';
import modelService from '../services/ModelService';

type EssayScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const EssayScreen: React.FC = () => {
  const navigation = useNavigation<EssayScreenNavigationProp>();
  const [loading, setLoading] = useState(false);
  const isModelLoaded = modelService.isModelLoaded();

  const handleTypeEssay = () => {
    navigation.navigate('EssayInput');
  };

  const handleViewHistory = () => {
    Alert.alert('Histórico', 'Funcionalidade em desenvolvimento');
  };



  const handleModelDownload = () => {
    navigation.navigate('ModelDownload');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Redação ENEM</Text>
        <Text style={styles.subtitle}>
          Escreva, fotografe ou escaneie sua redação para avaliação
        </Text>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>
          Sua redação será avaliada de acordo com os critérios oficiais do ENEM,
          recebendo notas de 0 a 200 em cada uma das 5 competências.
        </Text>
      </View>

      {!isModelLoaded && (
        <View style={styles.warningContainer}>
          <Icon name="warning" size={24} color="#e74c3c" />
          <Text style={styles.warningText}>
            O modelo de IA não está disponível. Baixe o modelo para usar esta funcionalidade.
          </Text>
          <TouchableOpacity
            style={styles.downloadButton}
            onPress={handleModelDownload}
          >
            <Text style={styles.downloadButtonText}>Baixar Modelo</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.optionsContainer}>
        <TouchableOpacity
          style={[styles.optionButton, styles.typeButton]}
          onPress={handleTypeEssay}
          disabled={!isModelLoaded}
        >
          <Icon name="edit" size={32} color="#fff" />
          <Text style={styles.optionButtonText}>Digitar Redação</Text>
          <Text style={styles.optionButtonSubtext}>
            Escreva sua redação diretamente no aplicativo
          </Text>
        </TouchableOpacity>



        <TouchableOpacity
          style={[styles.optionButton, styles.historyButton]}
          onPress={handleViewHistory}
        >
          <Icon name="history" size={32} color="#fff" />
          <Text style={styles.optionButtonText}>Histórico</Text>
          <Text style={styles.optionButtonSubtext}>
            Veja suas redações anteriores e avaliações
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tipsContainer}>
        <Text style={styles.tipsTitle}>Dicas para uma boa redação:</Text>
        <View style={styles.tipItem}>
          <Icon name="check-circle" size={20} color="#27ae60" />
          <Text style={styles.tipText}>
            Siga a estrutura dissertativa-argumentativa: introdução, desenvolvimento e conclusão
          </Text>
        </View>
        <View style={styles.tipItem}>
          <Icon name="check-circle" size={20} color="#27ae60" />
          <Text style={styles.tipText}>
            Apresente uma proposta de intervenção detalhada e respeitando os direitos humanos
          </Text>
        </View>
        <View style={styles.tipItem}>
          <Icon name="check-circle" size={20} color="#27ae60" />
          <Text style={styles.tipText}>
            Use repertório sociocultural relevante para fundamentar seus argumentos
          </Text>
        </View>
        <View style={styles.tipItem}>
          <Icon name="check-circle" size={20} color="#27ae60" />
          <Text style={styles.tipText}>
            Mantenha a coesão textual com uso adequado de conectivos
          </Text>
        </View>
        <View style={styles.tipItem}>
          <Icon name="check-circle" size={20} color="#27ae60" />
          <Text style={styles.tipText}>
            Respeite a norma culta da língua portuguesa
          </Text>
        </View>
      </View>
    </ScrollView>
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
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  warningContainer: {
    padding: 15,
    backgroundColor: '#ffeceb',
    borderRadius: 8,
    margin: 15,
    marginTop: 0,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  warningText: {
    fontSize: 14,
    color: '#e74c3c',
    marginLeft: 10,
    marginTop: 5,
    textAlign: 'center',
  },
  downloadButton: {
    backgroundColor: '#e74c3c',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  downloadButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  optionsContainer: {
    padding: 15,
  },
  optionButton: {
    padding: 20,
    borderRadius: 8,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  typeButton: {
    backgroundColor: '#3498db',
  },

  historyButton: {
    backgroundColor: '#f39c12',
  },
  optionButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 10,
    marginBottom: 5,
  },
  optionButtonSubtext: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
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
});

export default EssayScreen;
