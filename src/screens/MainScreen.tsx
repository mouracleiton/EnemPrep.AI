import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  ScrollView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import DataService, { Exam } from '../services/DataService';
import modelService from '../services/ModelService';
import { Ionicons } from '@expo/vector-icons';

type MainScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const MainScreen = () => {
  const navigation = useNavigation<MainScreenNavigationProp>();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingStatus, setLoadingStatus] = useState('Carregando dados...');
  const [isModelLoaded, setIsModelLoaded] = useState(false);

  useEffect(() => {
    // Register for loading status updates
    DataService.onLoadingStatus(setLoadingStatus);

    // Register for data loaded event
    DataService.onDataLoaded(() => {
      const examData = DataService.getExams();
      setExams(examData);
      setLoading(false);
    });

    // Check if model is loaded
    setIsModelLoaded(modelService.isModelLoaded());

    // Register for model loaded events
    const unsubscribeModel = modelService.onModelLoaded(() => {
      setIsModelLoaded(true);
    });

    return () => {
      unsubscribeModel();
    };
  }, []);

  const handleExamsListPress = () => {
    navigation.navigate('ExamsList');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>{loadingStatus}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.topScrollContainer} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <Text style={styles.title}>ENEM Prep AI</Text>
        <Text style={styles.subtitle}>Prepare-se para o ENEM com questões e aulas explicativas</Text>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>
          Este aplicativo contém questões do ENEM com aulas explicativas geradas por IA.
          Os dados estão disponíveis offline, sem necessidade de conexão com a internet.
        </Text>
      </View>

        <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={[styles.mainButton, styles.studyButton]}
          onPress={() => navigation.navigate('Study')}
        >
          <Text style={styles.mainButtonText}>Estudo Personalizado</Text>
          <Text style={styles.mainButtonSubtext}>Escolha disciplinas e quantidade de questões</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.mainButton, styles.statsButton]}
          onPress={() => navigation.navigate('Stats')}
        >
          <Text style={styles.mainButtonText}>Estatísticas</Text>
          <Text style={styles.mainButtonSubtext}>Acompanhe seu desempenho e progresso</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.mainButton, styles.essayButton]}
          onPress={() => navigation.navigate('Essay')}
        >
          <Text style={styles.mainButtonText}>Redação ENEM</Text>
          <Text style={styles.mainButtonSubtext}>Escreva ou escaneie sua redação para avaliação</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.mainButton, styles.modelButton, !isModelLoaded ? styles.modelButtonHighlight : {}]}
          onPress={() => navigation.navigate('ModelDownload')}
        >
          <View style={styles.modelButtonContent}>
            <Text style={styles.mainButtonText}>Modelo de IA</Text>
            <Text style={styles.mainButtonSubtext}>
              {isModelLoaded ? 'Modelo instalado e pronto para uso' : 'Baixe o modelo para usar recursos de IA'}
            </Text>
          </View>
          {!isModelLoaded && (
            <View style={styles.modelStatusIndicator}>
              <Ionicons name="alert-circle" size={24} color="#e74c3c" />
            </View>
          )}
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.examsButton}
        onPress={handleExamsListPress}
      >
        <View style={styles.examsButtonContent}>
          <Ionicons name="document-text" size={24} color="#fff" style={styles.examsIcon} />
          <View style={styles.examsTextContainer}>
            <Text style={styles.examsButtonText}>Provas Disponíveis</Text>
            <Text style={styles.examsButtonSubtext}>
              Acesse todas as provas oficiais do ENEM
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#fff" />
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.examsButton, { backgroundColor: '#3498db' }]}
        onPress={() => navigation.navigate('ImageTest')}
      >
        <View style={styles.examsButtonContent}>
          <Ionicons name="images" size={24} color="#fff" style={styles.examsIcon} />
          <View style={styles.examsTextContainer}>
            <Text style={styles.examsButtonText}>Teste de Imagens</Text>
            <Text style={styles.examsButtonSubtext}>
              Verificar acesso às imagens locais
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#fff" />
        </View>
      </TouchableOpacity>
      </ScrollView>

      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={styles.supportButton}
          onPress={() => navigation.navigate('Support')}
        >
          <View style={styles.supportButtonContent}>
            <Ionicons name="heart" size={24} color="#fff" style={styles.supportIcon} />
            <Text style={styles.supportButtonText}>Apoie o Desenvolvedor</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  topScrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  bottomContainer: {
    width: '100%',
    backgroundColor: 'transparent',
    position: 'absolute',
    bottom: 0,
    paddingBottom: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#333',
  },
  header: {
    backgroundColor: '#3498db',
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
    textAlign: 'center',
  },
  modelButtonContent: {
    flex: 1,
  },
  modelStatusIndicator: {
    marginLeft: 8,
    justifyContent: 'center',
  },
  modelButton: {
    backgroundColor: '#7f8c8d',
    flexDirection: 'row',
  },
  modelButtonHighlight: {
    backgroundColor: '#e67e22',
    borderWidth: 1,
    borderColor: '#d35400',
  },
  infoContainer: {
    backgroundColor: '#fff',
    padding: 16,
    margin: 16,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  infoText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  listContainer: {
    padding: 16,
  },
  examItem: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  examInfo: {
    flexDirection: 'column',
  },
  examYear: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  examColor: {
    fontSize: 14,
    color: '#666',
  },
  examQuestions: {
    fontSize: 14,
    color: '#3498db',
    fontWeight: 'bold',
  },
  buttonsContainer: {
    flexDirection: 'column',
    marginHorizontal: 16,
    marginVertical: 8,
  },
  mainButton: {
    borderRadius: 10,
    padding: 16,
    margin: 8,
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  studyButton: {
    backgroundColor: '#27ae60',
  },
  statsButton: {
    backgroundColor: '#3498db',
  },
  essayButton: {
    backgroundColor: '#e67e22',
  },
  mainButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  mainButtonSubtext: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.9,
    textAlign: 'center',
  },
  supportButton: {
    backgroundColor: '#e74c3c',
    borderRadius: 10,
    padding: 10,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    alignSelf: 'center',
    width: '80%',
  },
  supportButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  supportIcon: {
    marginRight: 8,
  },
  supportButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  examsButton: {
    backgroundColor: '#3498db',
    borderRadius: 8,
    margin: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  examsButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  examsIcon: {
    marginRight: 10,
  },
  examsTextContainer: {
    flex: 1,
  },
  examsButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  examsButtonSubtext: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.9,
  },
});

export default MainScreen;
