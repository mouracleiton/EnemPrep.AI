import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Switch,
  TextInput
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import DataService, { Discipline } from '../services/DataService';
import Icon from 'react-native-vector-icons/MaterialIcons';

type StudyScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const StudyScreen = () => {
  const navigation = useNavigation<StudyScreenNavigationProp>();
  const [loading, setLoading] = useState(true);
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [selectedDisciplines, setSelectedDisciplines] = useState<string[]>([]);
  const [questionCount, setQuestionCount] = useState('10');
  const [excludeAnswered, setExcludeAnswered] = useState(false);

  useEffect(() => {
    // Load disciplines when data is available
    DataService.onDataLoaded(() => {
      loadDisciplines();
    });

    // Check if data is already loaded
    if (DataService.isDataLoaded()) {
      loadDisciplines();
    }
  }, []);

  const loadDisciplines = () => {
    const exams = DataService.getExams();
    // Get all unique disciplines from all exams
    const allDisciplines = new Set<string>();
    const disciplineObjects: Discipline[] = [];

    exams.forEach(exam => {
      exam.disciplines.forEach(discipline => {
        if (!allDisciplines.has(discipline.value)) {
          allDisciplines.add(discipline.value);
          disciplineObjects.push(discipline);
        }
      });
    });

    // Get disciplines that have questions
    const disciplinesWithQuestions = DataService.getDisciplinesWithQuestions();
    console.log('Disciplines with questions:', disciplinesWithQuestions);

    // Filter disciplines to only include those with questions
    const filteredDisciplines = disciplineObjects.filter(discipline =>
      disciplinesWithQuestions.includes(discipline.value)
    );

    console.log('All disciplines:', disciplineObjects.map(d => d.value));
    console.log('Filtered disciplines:', filteredDisciplines.map(d => d.value));

    setDisciplines(filteredDisciplines);
    setLoading(false);
  };

  const toggleDiscipline = (disciplineValue: string) => {
    setSelectedDisciplines(prev => {
      if (prev.includes(disciplineValue)) {
        return prev.filter(d => d !== disciplineValue);
      } else {
        return [...prev, disciplineValue];
      }
    });
  };

  const handleStartStudy = () => {
    if (selectedDisciplines.length === 0) {
      alert('Selecione pelo menos uma disciplina');
      return;
    }

    const count = parseInt(questionCount);
    if (isNaN(count) || count <= 0) {
      alert('Informe um número válido de questões');
      return;
    }

    // Log selected disciplines for debugging
    console.log('Selected disciplines:', selectedDisciplines);

    // Create a new study session
    const session = DataService.createStudySession(selectedDisciplines, count);

    // Get random questions for the selected disciplines
    const questions = DataService.getRandomQuestionsForStudy(
      selectedDisciplines,
      count,
      excludeAnswered
    );

    // Log the questions we got for debugging
    console.log(`Got ${questions.length} questions for study`);
    const questionsByDiscipline: {[key: string]: number} = {};
    questions.forEach(q => {
      questionsByDiscipline[q.discipline] = (questionsByDiscipline[q.discipline] || 0) + 1;
    });
    console.log('Questions by discipline:', questionsByDiscipline);

    if (questions.length === 0) {
      alert('Não foram encontradas questões para as disciplinas selecionadas');
      return;
    }

    // Navigate to the first question
    const firstQuestion = questions[0];
    navigation.navigate('Question', {
      questionId: `${firstQuestion.year}-${firstQuestion.index}`,
      studySessionId: session.id
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Carregando disciplinas...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Estudo Personalizado</Text>
          <Text style={styles.subtitle}>
            Selecione as disciplinas e a quantidade de questões para estudar
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Disciplinas</Text>
          <Text style={styles.sectionSubtitle}>
            Selecione uma ou mais disciplinas para estudar
          </Text>

          <View style={styles.disciplinesContainer}>
            {disciplines.map((discipline) => (
              <TouchableOpacity
                key={discipline.value}
                style={[
                  styles.disciplineItem,
                  selectedDisciplines.includes(discipline.value) && styles.disciplineSelected
                ]}
                onPress={() => toggleDiscipline(discipline.value)}
              >
                <Text
                  style={[
                    styles.disciplineText,
                    selectedDisciplines.includes(discipline.value) && styles.disciplineTextSelected
                  ]}
                >
                  {discipline.label}
                </Text>
                {selectedDisciplines.includes(discipline.value) && (
                  <Icon name="check" size={20} color="#fff" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quantidade de Questões</Text>
          <TextInput
            style={styles.input}
            value={questionCount}
            onChangeText={setQuestionCount}
            keyboardType="number-pad"
            placeholder="Número de questões"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Opções</Text>
          <View style={styles.optionItem}>
            <Text style={styles.optionText}>Excluir questões já respondidas</Text>
            <Switch
              value={excludeAnswered}
              onValueChange={setExcludeAnswered}
              trackColor={{ false: '#bdc3c7', true: '#3498db' }}
              thumbColor={excludeAnswered ? '#2980b9' : '#f4f3f4'}
            />
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.startButton,
            selectedDisciplines.length === 0 && styles.disabledButton
          ]}
          onPress={handleStartStudy}
          disabled={selectedDisciplines.length === 0}
        >
          <Text style={styles.startButtonText}>Iniciar Estudo</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flex: 1,
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
    backgroundColor: '#27ae60',
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
  section: {
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  disciplinesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  disciplineItem: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    width: '48%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  disciplineSelected: {
    backgroundColor: '#27ae60',
  },
  disciplineText: {
    fontSize: 14,
    color: '#333',
    fontWeight: 'bold',
  },
  disciplineTextSelected: {
    color: '#fff',
  },
  input: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
  startButton: {
    backgroundColor: '#27ae60',
    borderRadius: 10,
    padding: 16,
    margin: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  disabledButton: {
    backgroundColor: '#bdc3c7',
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default StudyScreen;
