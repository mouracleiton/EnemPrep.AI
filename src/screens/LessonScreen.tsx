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
import DataService, { Question } from '../services/DataService';
import Icon from 'react-native-vector-icons/MaterialIcons';

type LessonScreenRouteProp = RouteProp<RootStackParamList, 'Lesson'>;
type LessonScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const LessonScreen = () => {
  const route = useRoute<LessonScreenRouteProp>();
  const navigation = useNavigation<LessonScreenNavigationProp>();
  const { questionId } = route.params;
  
  const [question, setQuestion] = useState<Question | null>(null);
  
  useEffect(() => {
    const loadQuestion = () => {
      const questionData = DataService.getQuestionById(questionId);
      if (questionData) {
        setQuestion(questionData);
      } else {
        Alert.alert('Erro', 'Questão não encontrada');
        navigation.goBack();
      }
    };
    
    loadQuestion();
  }, [questionId, navigation]);
  
  if (!question || !question.lesson) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Carregando aula...</Text>
      </View>
    );
  }
  
  // Function to convert markdown-like content to formatted text
  const formatLesson = (lesson: string) => {
    // Split the lesson into paragraphs
    const paragraphs = lesson.split('\n\n');
    
    return paragraphs.map((paragraph, index) => {
      // Check if it's a header
      if (paragraph.startsWith('## ')) {
        return (
          <Text key={index} style={styles.lessonHeader}>
            {paragraph.replace('## ', '')}
          </Text>
        );
      }
      // Check if it's a subheader
      else if (paragraph.startsWith('**')) {
        return (
          <Text key={index} style={styles.lessonSubheader}>
            {paragraph.replace(/\*\*/g, '')}
          </Text>
        );
      }
      // Check if it's a list item
      else if (paragraph.trim().startsWith('* ')) {
        return (
          <Text key={index} style={styles.lessonListItem}>
            {paragraph.trim().replace('* ', '• ')}
          </Text>
        );
      }
      // Regular paragraph
      else {
        return (
          <Text key={index} style={styles.lessonParagraph}>
            {paragraph}
          </Text>
        );
      }
    });
  };
  
  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.questionHeader}>
          <Text style={styles.questionTitle}>{question.title}</Text>
          <View style={styles.questionMeta}>
            <Text style={styles.questionYear}>{question.year}</Text>
            <Text style={styles.questionDiscipline}>
              {question.discipline}
            </Text>
          </View>
        </View>
        
        <View style={styles.lessonContainer}>
          {formatLesson(question.lesson)}
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
  questionHeader: {
    backgroundColor: '#f39c12',
    padding: 16,
  },
  questionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  questionMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  questionYear: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.8,
  },
  questionDiscipline: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.8,
  },
  lessonContainer: {
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
  lessonHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    marginTop: 8,
  },
  lessonSubheader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    marginTop: 8,
  },
  lessonParagraph: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 12,
  },
  lessonListItem: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 8,
    marginLeft: 16,
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
