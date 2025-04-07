import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import Icon from 'react-native-vector-icons/MaterialIcons';
import dataService from '../services/DataService';
import { Exam } from '../types/data';

type ExamsListScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const ExamsListScreen: React.FC = () => {
  const navigation = useNavigation<ExamsListScreenNavigationProp>();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadExams = async () => {
      try {
        setLoading(true);
        const availableExams = dataService.getExams();
        setExams(availableExams);
      } catch (error) {
        console.error('Erro ao carregar provas:', error);
      } finally {
        setLoading(false);
      }
    };

    loadExams();
  }, []);

  const handleExamPress = (exam: Exam) => {
    navigation.navigate('ExamDetail', { examYear: exam.year, examType: exam.type });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Carregando provas...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Provas Disponíveis</Text>
        <Text style={styles.subtitle}>
          Selecione uma prova para praticar com questões oficiais do ENEM
        </Text>
      </View>

      {exams.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="error-outline" size={48} color="#95a5a6" />
          <Text style={styles.emptyText}>Nenhuma prova disponível</Text>
        </View>
      ) : (
        <FlatList
          data={exams}
          keyExtractor={(item) => `${item.year}-${item.type}`}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.examItem}
              onPress={() => handleExamPress(item)}
            >
              <View style={styles.examItemContent}>
                <View style={styles.examInfo}>
                  <Text style={styles.examTitle}>
                    ENEM {item.year} - {item.type}
                  </Text>
                  <Text style={styles.examSubtitle}>
                    {dataService.getQuestionsByYear(item.year).length} questões
                  </Text>
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
  examItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  examItemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
  },
  examInfo: {
    flex: 1,
  },
  examTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  examSubtitle: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 5,
  },
});

export default ExamsListScreen;
