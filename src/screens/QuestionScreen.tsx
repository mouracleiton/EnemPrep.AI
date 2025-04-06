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
import DataService, { Question, Alternative } from '../services/DataService';
import Icon from 'react-native-vector-icons/MaterialIcons';

type QuestionScreenRouteProp = RouteProp<RootStackParamList, 'Question'>;
type QuestionScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const QuestionScreen = () => {
  const route = useRoute<QuestionScreenRouteProp>();
  const navigation = useNavigation<QuestionScreenNavigationProp>();
  const { questionId } = route.params;
  
  const [question, setQuestion] = useState<Question | null>(null);
  const [selectedAlternative, setSelectedAlternative] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  
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
  
  const handleSelectAlternative = (letter: string) => {
    if (!answered) {
      setSelectedAlternative(letter);
    }
  };
  
  const handleSubmit = () => {
    if (!selectedAlternative || !question) return;
    
    const correct = selectedAlternative === question.correctAlternative;
    setIsCorrect(correct);
    setAnswered(true);
    
    // Save the answer
    DataService.saveUserAnswer(questionId, selectedAlternative, correct);
  };
  
  const handleNextQuestion = () => {
    // Get the next question in the same discipline
    if (!question) return;
    
    const questions = DataService.getQuestionsByDiscipline(question.discipline);
    const currentIndex = questions.findIndex(q => 
      q.year === question.year && q.index === question.index
    );
    
    if (currentIndex >= 0 && currentIndex < questions.length - 1) {
      const nextQuestion = questions[currentIndex + 1];
      navigation.replace('Question', { 
        questionId: `${nextQuestion.year}-${nextQuestion.index}` 
      });
    } else {
      // If no next question, go back to the exams screen
      navigation.goBack();
    }
  };
  
  const handleViewLesson = () => {
    if (question?.lesson) {
      navigation.navigate('Lesson', { questionId });
    } else {
      Alert.alert('Informação', 'Esta questão não possui aula disponível');
    }
  };
  
  if (!question) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Carregando questão...</Text>
      </View>
    );
  }
  
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
        
        <View style={styles.contextContainer}>
          <Text style={styles.contextText}>{question.context}</Text>
        </View>
        
        <View style={styles.alternativesContainer}>
          <Text style={styles.alternativesIntro}>
            {question.alternativesIntroduction}
          </Text>
          
          {question.alternatives.map((alternative: Alternative) => (
            <TouchableOpacity
              key={alternative.letter}
              style={[
                styles.alternativeItem,
                selectedAlternative === alternative.letter && styles.selectedAlternative,
                answered && alternative.letter === question.correctAlternative && styles.correctAlternative,
                answered && selectedAlternative === alternative.letter && 
                  alternative.letter !== question.correctAlternative && styles.incorrectAlternative,
              ]}
              onPress={() => handleSelectAlternative(alternative.letter)}
              disabled={answered}
            >
              <View style={styles.alternativeLetterContainer}>
                <Text style={styles.alternativeLetter}>{alternative.letter}</Text>
              </View>
              <Text style={styles.alternativeText}>{alternative.text}</Text>
              {answered && alternative.letter === question.correctAlternative && (
                <Icon name="check-circle" size={24} color="#2ecc71" style={styles.alternativeIcon} />
              )}
              {answered && selectedAlternative === alternative.letter && 
                alternative.letter !== question.correctAlternative && (
                <Icon name="cancel" size={24} color="#e74c3c" style={styles.alternativeIcon} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      
      <View style={styles.actionContainer}>
        {!answered ? (
          <TouchableOpacity 
            style={[styles.actionButton, !selectedAlternative && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={!selectedAlternative}
          >
            <Text style={styles.actionButtonText}>Responder</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.resultContainer}>
            <Text style={[
              styles.resultText,
              isCorrect ? styles.correctResultText : styles.incorrectResultText
            ]}>
              {isCorrect ? 'Resposta Correta!' : 'Resposta Incorreta'}
            </Text>
            
            <View style={styles.actionButtonsRow}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.lessonButton]}
                onPress={handleViewLesson}
              >
                <Text style={styles.actionButtonText}>Ver Aula</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.actionButton, styles.nextButton]}
                onPress={handleNextQuestion}
              >
                <Text style={styles.actionButtonText}>Próxima Questão</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
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
    backgroundColor: '#3498db',
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
  contextContainer: {
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
  contextText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  alternativesContainer: {
    padding: 16,
  },
  alternativesIntro: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  alternativeItem: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedAlternative: {
    backgroundColor: '#d6eaf8',
    borderColor: '#3498db',
    borderWidth: 1,
  },
  correctAlternative: {
    backgroundColor: '#d5f5e3',
    borderColor: '#2ecc71',
    borderWidth: 1,
  },
  incorrectAlternative: {
    backgroundColor: '#fadbd8',
    borderColor: '#e74c3c',
    borderWidth: 1,
  },
  alternativeLetterContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  alternativeLetter: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  alternativeText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  alternativeIcon: {
    marginLeft: 8,
  },
  actionContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  actionButton: {
    backgroundColor: '#3498db',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#bdc3c7',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  resultContainer: {
    alignItems: 'center',
  },
  resultText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  correctResultText: {
    color: '#2ecc71',
  },
  incorrectResultText: {
    color: '#e74c3c',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  lessonButton: {
    backgroundColor: '#f39c12',
    flex: 1,
    marginRight: 8,
  },
  nextButton: {
    backgroundColor: '#3498db',
    flex: 1,
    marginLeft: 8,
  },
});

export default QuestionScreen;
