import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import DataService, { Exam } from '../services/DataService';

type MainScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const MainScreen = () => {
  const navigation = useNavigation<MainScreenNavigationProp>();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingStatus, setLoadingStatus] = useState('Carregando dados...');

  useEffect(() => {
    // Register for loading status updates
    DataService.onLoadingStatus(setLoadingStatus);

    // Register for data loaded event
    DataService.onDataLoaded(() => {
      const examData = DataService.getExams();
      setExams(examData);
      setLoading(false);
    });
  }, []);

  const handleExamPress = (exam: Exam) => {
    // Get questions for this exam year
    const questions = DataService.getQuestionsByYear(exam.year);

    // Navigate to the first question of the exam if available
    if (questions && questions.length > 0) {
      const firstQuestion = questions[0];
      navigation.navigate('Question', {
        questionId: `${firstQuestion.year}-${firstQuestion.index}`
      });
    }
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

      <Text style={styles.sectionTitle}>Provas Disponíveis</Text>

      <FlatList
        data={exams}
        keyExtractor={(item) => `${item.year}`}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.examItem}
            onPress={() => handleExamPress(item)}
          >
            <View style={styles.examInfo}>
              <Text style={styles.examYear}>{item.year}</Text>
              <Text style={styles.examColor}>{item.title || 'ENEM'}</Text>
            </View>
            <Text style={styles.examQuestions}>
              {DataService.getQuestionsByYear(item.year).length} questões
            </Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
});

export default MainScreen;
