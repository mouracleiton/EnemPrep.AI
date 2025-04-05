import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  FlatList
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import DataService, { StudySession } from '../services/DataService';
import Icon from 'react-native-vector-icons/MaterialIcons';

type StatsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const { width } = Dimensions.get('window');

const StatsScreen = () => {
  const navigation = useNavigation<StatsScreenNavigationProp>();
  const [stats, setStats] = useState<any>(null);
  const [studySessions, setStudySessions] = useState<StudySession[]>([]);
  const [disciplineLabels, setDisciplineLabels] = useState<Record<string, string>>({});
  
  useEffect(() => {
    // Load statistics
    const loadStats = () => {
      const userStats = DataService.getUserStatistics();
      setStats(userStats);
      
      // Load study sessions
      const sessions = DataService.getStudySessions();
      setStudySessions(sessions);
      
      // Get discipline labels
      const labels: Record<string, string> = {};
      const exams = DataService.getExams();
      
      // Get all unique disciplines
      const allDisciplines = new Set<string>();
      
      // Add disciplines from user stats
      Object.keys(userStats.disciplineStats).forEach(discipline => {
        allDisciplines.add(discipline);
      });
      
      // Add disciplines from study sessions
      sessions.forEach(session => {
        session.disciplines.forEach(discipline => {
          allDisciplines.add(discipline);
        });
      });
      
      // Find labels for all disciplines
      allDisciplines.forEach(disciplineValue => {
        // Find the label for this discipline value
        for (const exam of exams) {
          const discipline = exam.disciplines.find(d => d.value === disciplineValue);
          if (discipline) {
            labels[disciplineValue] = discipline.label;
            break;
          }
        }
        
        // If no label was found, use the value
        if (!labels[disciplineValue]) {
          labels[disciplineValue] = disciplineValue;
        }
      });
      
      setDisciplineLabels(labels);
    };
    
    // Register for data loaded event
    DataService.onDataLoaded(loadStats);
    
    // Check if data is already loaded
    if (DataService.isDataLoaded()) {
      loadStats();
    }
  }, []);
  
  const handleViewSession = (sessionId: string) => {
    navigation.navigate('StudyResults', { studySessionId: sessionId });
  };
  
  if (!stats) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Carregando estatísticas...</Text>
      </View>
    );
  }
  
  // Prepare discipline stats for display
  const disciplineStatsArray = Object.entries(stats.disciplineStats).map(
    ([discipline, data]: [string, any]) => ({
      discipline: disciplineLabels[discipline] || discipline,
      disciplineValue: discipline,
      total: data.total,
      correct: data.correct,
      lessonsViewed: data.lessonsViewed || 0,
      accuracy: data.total > 0 ? (data.correct / data.total) * 100 : 0
    })
  ).sort((a, b) => b.total - a.total);
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Meu Desempenho</Text>
        <Text style={styles.subtitle}>
          Acompanhe suas estatísticas e evolução
        </Text>
      </View>
      
      <View style={styles.statsCard}>
        <Text style={styles.cardTitle}>Resumo</Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.correct}</Text>
            <Text style={styles.statLabel}>Corretas</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.accuracy.toFixed(1)}%</Text>
            <Text style={styles.statLabel}>Acertos</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.lessonsCard}>
        <Text style={styles.cardTitle}>Aulas Visualizadas</Text>
        <View style={styles.lessonsStatsRow}>
          <View style={styles.lessonStatItem}>
            <Text style={styles.lessonStatValue}>{stats.lessonsViewed}</Text>
            <Text style={styles.lessonStatLabel}>Total de Aulas</Text>
          </View>
          <View style={styles.lessonStatItem}>
            <Text style={styles.lessonStatValue}>
              {stats.total > 0 ? ((stats.lessonsViewed / stats.total) * 100).toFixed(1) : '0'}%
            </Text>
            <Text style={styles.lessonStatLabel}>das Questões</Text>
          </View>
        </View>
        <Text style={styles.lessonHint}>
          Visualizar as aulas explicativas ajuda a fixar o conteúdo e melhorar seu desempenho!
        </Text>
      </View>
      
      <View style={styles.disciplinesCard}>
        <Text style={styles.cardTitle}>Desempenho por Disciplina</Text>
        {disciplineStatsArray.length > 0 ? (
          disciplineStatsArray.map((item, index) => (
            <View key={index} style={styles.disciplineItem}>
              <View style={styles.disciplineHeader}>
                <Text style={styles.disciplineName}>{item.discipline}</Text>
                <Text style={styles.disciplineAccuracy}>
                  {item.accuracy.toFixed(1)}%
                </Text>
              </View>
              <View style={styles.progressBarContainer}>
                <View 
                  style={[
                    styles.progressBar, 
                    { width: `${item.accuracy}%` }
                  ]} 
                />
              </View>
              <View style={styles.disciplineStats}>
                <Text style={styles.disciplineStat}>
                  {item.correct} corretas de {item.total} questões
                </Text>
                <Text style={styles.disciplineLessonStat}>
                  {item.lessonsViewed} aulas visualizadas
                </Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>
            Nenhuma questão respondida ainda
          </Text>
        )}
      </View>
      
      <View style={styles.sessionsCard}>
        <Text style={styles.cardTitle}>Sessões de Estudo</Text>
        {studySessions.length > 0 ? (
          <FlatList
            data={studySessions.sort((a, b) => b.timestamp - a.timestamp)}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              const accuracy = item.questionsAnswered > 0 
                ? (item.correctAnswers / item.questionsAnswered) * 100 
                : 0;
              
              return (
                <TouchableOpacity
                  style={styles.sessionItem}
                  onPress={() => handleViewSession(item.id)}
                >
                  <View style={styles.sessionHeader}>
                    <Text style={styles.sessionDate}>
                      {new Date(item.timestamp).toLocaleDateString()}
                    </Text>
                    <Text style={styles.sessionAccuracy}>
                      {accuracy.toFixed(1)}%
                    </Text>
                  </View>
                  <View style={styles.sessionDisciplines}>
                    {item.disciplines.map(discipline => (
                      <View key={discipline} style={styles.disciplineTag}>
                        <Text style={styles.disciplineTagText}>
                          {disciplineLabels[discipline] || discipline}
                        </Text>
                      </View>
                    ))}
                  </View>
                  <View style={styles.sessionStats}>
                    <Text style={styles.sessionStat}>
                      {item.correctAnswers} corretas de {item.questionsAnswered} questões
                    </Text>
                    <Text style={styles.sessionLessonStat}>
                      {item.lessonsViewed} aulas visualizadas
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            }}
            scrollEnabled={false}
            style={styles.sessionsList}
          />
        ) : (
          <View style={styles.emptySessionsContainer}>
            <Text style={styles.emptyText}>
              Nenhuma sessão de estudo personalizado realizada
            </Text>
            <TouchableOpacity
              style={styles.startStudyButton}
              onPress={() => navigation.navigate('Study')}
            >
              <Text style={styles.startStudyButtonText}>Iniciar Estudo Personalizado</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
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
  statsCard: {
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
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3498db',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  lessonsCard: {
    backgroundColor: '#fff',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  lessonsStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  lessonStatItem: {
    alignItems: 'center',
  },
  lessonStatValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f39c12',
    marginBottom: 4,
  },
  lessonStatLabel: {
    fontSize: 14,
    color: '#666',
  },
  lessonHint: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  disciplinesCard: {
    backgroundColor: '#fff',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  disciplineItem: {
    marginBottom: 16,
  },
  disciplineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  disciplineName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  disciplineAccuracy: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3498db',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    marginBottom: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#3498db',
    borderRadius: 4,
  },
  disciplineStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  disciplineStat: {
    fontSize: 12,
    color: '#666',
  },
  disciplineLessonStat: {
    fontSize: 12,
    color: '#f39c12',
  },
  sessionsCard: {
    backgroundColor: '#fff',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sessionsList: {
    marginTop: 8,
  },
  sessionItem: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sessionDate: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  sessionAccuracy: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#27ae60',
  },
  sessionDisciplines: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  disciplineTag: {
    backgroundColor: '#3498db',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
    margin: 2,
  },
  disciplineTagText: {
    fontSize: 12,
    color: '#fff',
  },
  sessionStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sessionStat: {
    fontSize: 12,
    color: '#666',
  },
  sessionLessonStat: {
    fontSize: 12,
    color: '#f39c12',
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginVertical: 16,
  },
  emptySessionsContainer: {
    alignItems: 'center',
  },
  startStudyButton: {
    backgroundColor: '#27ae60',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    width: '80%',
  },
  startStudyButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default StatsScreen;
