import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Animated, Easing } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import DataService, { Question, Exam } from '../services/DataService';
import Icon from 'react-native-vector-icons/MaterialIcons';

type ExamsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const ExamsScreen = () => {
  const navigation = useNavigation<ExamsScreenNavigationProp>();
  const [activeTab, setActiveTab] = useState<'years' | 'disciplines' | 'search'>('years');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [loadingStatus, setLoadingStatus] = useState('Iniciando...');
  const [exams, setExams] = useState<Exam[]>([]);

  // Animação da barra de carregamento
  const loadingAnim = useRef(new Animated.Value(0)).current;

  // Inicia a animação da barra de carregamento
  useEffect(() => {
    if (isLoading) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(loadingAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.linear,
            useNativeDriver: false
          }),
          Animated.timing(loadingAnim, {
            toValue: 0,
            duration: 1000,
            easing: Easing.linear,
            useNativeDriver: false
          })
        ])
      ).start();
    } else {
      loadingAnim.stopAnimation();
    }

    return () => {
      loadingAnim.stopAnimation();
    };
  }, [isLoading, loadingAnim]);

  useEffect(() => {
    // Register a callback to be called when data is loaded
    DataService.onDataLoaded(() => {
      setIsLoading(false);
      setExams(DataService.getExams());
    });

    // Register a callback for loading status updates
    DataService.onLoadingStatus((status) => {
      setLoadingStatus(status);
    });

    // If data is already loaded, update state immediately
    if (DataService.isDataLoaded()) {
      setIsLoading(false);
      setExams(DataService.getExams());
    }
  }, []);

  // Get all unique disciplines from the data
  const disciplines = Array.from(
    new Set(
      exams.flatMap(exam =>
        exam.disciplines.map(discipline => discipline.value)
      )
    )
  );

  // Get discipline label from value
  const getDisciplineLabel = (value: string) => {
    for (const exam of exams) {
      const discipline = exam.disciplines.find(d => d.value === value);
      if (discipline) return discipline.label;
    }
    return value;
  };

  // Filter questions based on search query
  const getFilteredQuestions = () => {
    if (!searchQuery.trim()) return [];

    const query = searchQuery.toLowerCase();
    return DataService.getAllQuestions().filter(question =>
      question.title.toLowerCase().includes(query) ||
      question.context.toLowerCase().includes(query) ||
      question.alternativesIntroduction.toLowerCase().includes(query)
    );
  };

  const renderYearItem = ({ item }: { item: Exam }) => (
    <TouchableOpacity
      style={styles.yearCard}
      onPress={() => {
        // Navigate to a filtered list of questions for this year
        // For simplicity, we'll just show the first question of this year
        const questions = DataService.getQuestionsByYear(item.year);
        if (questions.length > 0) {
          navigation.navigate('Question', {
            questionId: `${questions[0].year}-${questions[0].index}`
          });
        }
      }}
    >
      <Text style={styles.yearTitle}>{item.title}</Text>
      <Text style={styles.yearSubtitle}>{item.disciplines.length} disciplinas</Text>
      <Icon name="chevron-right" size={24} color="#3498db" style={styles.yearIcon} />
    </TouchableOpacity>
  );

  const renderDisciplineItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={styles.disciplineCard}
      onPress={() => {
        // Navigate to a filtered list of questions for this discipline
        // For simplicity, we'll just show the first question of this discipline
        const questions = DataService.getQuestionsByDiscipline(item);
        if (questions.length > 0) {
          navigation.navigate('Question', {
            questionId: `${questions[0].year}-${questions[0].index}`
          });
        }
      }}
    >
      <Text style={styles.disciplineTitle}>{getDisciplineLabel(item)}</Text>
      <Icon name="chevron-right" size={24} color="#3498db" style={styles.disciplineIcon} />
    </TouchableOpacity>
  );

  const renderQuestionItem = ({ item }: { item: Question }) => (
    <TouchableOpacity
      style={styles.questionCard}
      onPress={() => {
        navigation.navigate('Question', {
          questionId: `${item.year}-${item.index}`
        });
      }}
    >
      <Text style={styles.questionTitle}>{item.title}</Text>
      <Text style={styles.questionSubtitle} numberOfLines={2}>
        {item.alternativesIntroduction}
      </Text>
      <View style={styles.questionMeta}>
        <Text style={styles.questionYear}>{item.year}</Text>
        <Text style={styles.questionDiscipline}>
          {getDisciplineLabel(item.discipline)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingTitle}>Carregando questões do ENEM</Text>
        <Text style={styles.loadingText}>{loadingStatus}</Text>
        <View style={styles.loadingIndicator}>
          <Animated.View
            style={[
              styles.loadingBar,
              {
                left: loadingAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '70%']
                })
              }
            ]}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'years' && styles.activeTab]}
          onPress={() => setActiveTab('years')}
        >
          <Text style={[styles.tabText, activeTab === 'years' && styles.activeTabText]}>
            Anos
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'disciplines' && styles.activeTab]}
          onPress={() => setActiveTab('disciplines')}
        >
          <Text style={[styles.tabText, activeTab === 'disciplines' && styles.activeTabText]}>
            Disciplinas
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'search' && styles.activeTab]}
          onPress={() => setActiveTab('search')}
        >
          <Text style={[styles.tabText, activeTab === 'search' && styles.activeTabText]}>
            Buscar
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'years' && (
        <FlatList
          data={exams}
          renderItem={renderYearItem}
          keyExtractor={item => item.title}
          contentContainerStyle={styles.listContainer}
        />
      )}

      {activeTab === 'disciplines' && (
        <FlatList
          data={disciplines}
          renderItem={renderDisciplineItem}
          keyExtractor={item => item}
          contentContainerStyle={styles.listContainer}
        />
      )}

      {activeTab === 'search' && (
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Icon name="search" size={20} color="#666" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar questões..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Icon name="close" size={20} color="#666" />
              </TouchableOpacity>
            )}
          </View>

          <FlatList
            data={getFilteredQuestions()}
            renderItem={renderQuestionItem}
            keyExtractor={item => `${item.year}-${item.index}`}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                {searchQuery.length > 0 ? (
                  <Text style={styles.emptyText}>
                    Nenhuma questão encontrada para "{searchQuery}"
                  </Text>
                ) : (
                  <Text style={styles.emptyText}>
                    Digite algo para buscar questões
                  </Text>
                )}
              </View>
            }
          />
        </View>
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
    padding: 20,
  },
  loadingTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#3498db',
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  loadingIndicator: {
    width: '100%',
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  loadingBar: {
    width: '30%',
    height: '100%',
    backgroundColor: '#3498db',
    borderRadius: 3,
    position: 'absolute',
    left: 0,
    top: 0,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#3498db',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
  },
  activeTabText: {
    color: '#3498db',
    fontWeight: 'bold',
  },
  listContainer: {
    padding: 16,
  },
  yearCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  yearTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  yearSubtitle: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  yearIcon: {
    marginLeft: 8,
  },
  disciplineCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  disciplineTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  disciplineIcon: {
    marginLeft: 8,
  },
  searchContainer: {
    flex: 1,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    margin: 16,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  questionCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  questionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  questionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  questionMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  questionYear: {
    fontSize: 12,
    color: '#3498db',
    fontWeight: 'bold',
  },
  questionDiscipline: {
    fontSize: 12,
    color: '#666',
  },
  emptyContainer: {
    padding: 16,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default ExamsScreen;
