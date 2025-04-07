import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import Icon from 'react-native-vector-icons/MaterialIcons';
import dataService from '../services/DataService';
import { Question } from '../types/data';

type ExamDetailScreenRouteProp = RouteProp<RootStackParamList, 'ExamDetail'>;
type ExamDetailScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const ExamDetailScreen: React.FC = () => {
  const navigation = useNavigation<ExamDetailScreenNavigationProp>();
  const route = useRoute<ExamDetailScreenRouteProp>();
  const { examYear, examType } = route.params;
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        setLoading(true);
        const examQuestions = dataService.getQuestionsByYear(examYear);
        setQuestions(examQuestions);
      } catch (error) {
        console.error('Erro ao carregar questões:', error);
      } finally {
        setLoading(false);
      }
    };

    loadQuestions();
  }, [examYear]);

  const handleQuestionPress = (question: Question) => {
    navigation.navigate('Question', {
      questionId: `${question.year}-${question.index}`
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Carregando questões...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>ENEM {examYear} - {examType}</Text>
        <Text style={styles.subtitle}>
          {questions.length} questões disponíveis
        </Text>
      </View>

      {questions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="error-outline" size={48} color="#95a5a6" />
          <Text style={styles.emptyText}>Nenhuma questão disponível para esta prova</Text>
        </View>
      ) : (
        <FlatList
          data={questions}
          keyExtractor={(item) => `${item.year}-${item.index}`}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.questionItem}
              onPress={() => handleQuestionPress(item)}
            >
              <View style={styles.questionItemContent}>
                <View style={styles.questionInfo}>
                  <Text style={styles.questionNumber}>Questão {item.index}</Text>
                  <Text style={styles.questionDiscipline}>{item.discipline}</Text>
                </View>
                <Icon name="chevron-right" size={24} color="#7f8c8d" />
              </View>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.listContainer}
        />
      )}
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
    marginTop: 10,
    fontSize: 16,
    color: '#7f8c8d',
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  listContainer: {
    padding: 15,
  },
  questionItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  questionItemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
  },
  questionInfo: {
    flex: 1,
  },
  questionNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  questionDiscipline: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 5,
  },
});

export default ExamDetailScreen;
