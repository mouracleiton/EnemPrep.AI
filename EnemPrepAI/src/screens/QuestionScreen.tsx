import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  Dimensions
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import DataService, { Question, Alternative } from '../services/DataService';
import Icon from 'react-native-vector-icons/MaterialIcons';
import QuestionImage from '../components/QuestionImage';

type QuestionScreenRouteProp = RouteProp<RootStackParamList, 'Question'>;
type QuestionScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const { width } = Dimensions.get('window');

const QuestionScreen = () => {
  const route = useRoute<QuestionScreenRouteProp>();
  const navigation = useNavigation<QuestionScreenNavigationProp>();
  const { questionId, studySessionId } = route.params;

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

    // Save the answer with study session if available
    DataService.saveUserAnswer(questionId, selectedAlternative, correct, studySessionId);
  };

  const handleNextQuestion = () => {
    // Get the next question based on context
    if (!question) return;

    // If we're in a study session, check if there are more questions
    if (studySessionId) {
      const session = DataService.getStudySessionById(studySessionId);

      if (session && session.questionsAnswered < session.questionCount) {
        // Get more questions from the same disciplines
        const questions = DataService.getRandomQuestionsForStudy(
          session.disciplines,
          1, // Just get one more question
          true // Exclude already answered questions
        );

        if (questions.length > 0) {
          const nextQuestion = questions[0];
          navigation.replace('Question', {
            questionId: `${nextQuestion.year}-${nextQuestion.index}`,
            studySessionId
          });
          return;
        }
      }

      // If we've reached the end of the study session or no more questions,
      // navigate to the study results screen
      navigation.navigate('StudyResults', { studySessionId });
      return;
    }

    // Default behavior for non-study session questions
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
      // Record that the user viewed the lesson
      DataService.recordLessonView(questionId, studySessionId);

      // Navigate to the lesson screen
      navigation.navigate('Lesson', { questionId, studySessionId });
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

          {/* Display question images in order */}
          {question.files && question.files.length > 0 && (
            <View style={styles.imagesContainer}>
              {question.files.map((file, index) => (
                <View key={`img-${index}`} style={styles.imageWrapper}>
                  <QuestionImage source={file} style={styles.questionImage} />
                </View>
              ))}
            </View>
          )}
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
              <View style={styles.alternativeContent}>
                <Text style={styles.alternativeText}>{alternative.text}</Text>

                {/* Display alternative image if available */}
                {alternative.file && (
                  <View style={styles.alternativeImageWrapper}>
                    <QuestionImage source={alternative.file} style={styles.alternativeImage} />
                  </View>
                )}
              </View>

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
  imagesContainer: {
    marginTop: 16,
  },
  imageWrapper: {
    marginVertical: 8,
    alignItems: 'center',
  },
  questionImage: {
    width: width - 64,
    height: 200,
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
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  alternativeContent: {
    flex: 1,
  },
  alternativeImageWrapper: {
    marginTop: 8,
    alignItems: 'center',
  },
  alternativeImage: {
    width: width - 120,
    height: 150,
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
