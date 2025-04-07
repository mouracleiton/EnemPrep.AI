import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import DataService from '../services/DataService';

type LessonScreenRouteProp = RouteProp<RootStackParamList, 'Lesson'>;
type LessonScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const LessonScreen = () => {
  const route = useRoute<LessonScreenRouteProp>();
  const navigation = useNavigation<LessonScreenNavigationProp>();
  const { questionId, studySessionId } = route.params;

  const [lesson, setLesson] = useState<string | null>(null);
  const [title, setTitle] = useState<string>('');

  useEffect(() => {
    const loadLesson = () => {
      const question = DataService.getQuestionById(questionId);
      if (question && question.lesson) {
        setLesson(question.lesson);
        setTitle(`${question.discipline} - ${question.year}`);
      } else {
        Alert.alert('Erro', 'Aula não encontrada');
        navigation.goBack();
      }
    };

    loadLesson();
  }, [questionId, navigation]);

  if (!lesson) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Carregando aula...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.lessonHeader}>
          <Text style={styles.lessonTitle}>Aula Explicativa</Text>
          <Text style={styles.lessonSubtitle}>{title}</Text>
        </View>

        <View style={styles.lessonContent}>
          <Text style={styles.lessonText}>{lesson}</Text>
        </View>
      </ScrollView>

      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.actionButtonText}>Voltar para a Questão</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContainer: {
    flex: 1,
  },
  lessonHeader: {
    backgroundColor: '#f39c12',
    padding: 16,
  },
  lessonTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  lessonSubtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  lessonContent: {
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
  lessonText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  actionContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  actionButton: {
    backgroundColor: '#f39c12',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default LessonScreen;
