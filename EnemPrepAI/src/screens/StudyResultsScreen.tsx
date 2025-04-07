import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import DataService, { StudySession } from '../services/DataService';
import Icon from 'react-native-vector-icons/MaterialIcons';

type StudyResultsScreenRouteProp = RouteProp<RootStackParamList, 'StudyResults'>;
type StudyResultsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const StudyResultsScreen = () => {
  const route = useRoute<StudyResultsScreenRouteProp>();
  const navigation = useNavigation<StudyResultsScreenNavigationProp>();
  const { studySessionId } = route.params;
  
  const [session, setSession] = useState<StudySession | null>(null);
  const [disciplineLabels, setDisciplineLabels] = useState<Record<string, string>>({});
  
  useEffect(() => {
    // Load the study session
    const sessionData = DataService.getStudySessionById(studySessionId);
    if (sessionData) {
      setSession(sessionData);
      
      // Get discipline labels
      const labels: Record<string, string> = {};
      const exams = DataService.getExams();
      
      sessionData.disciplines.forEach(disciplineValue => {
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
    }
  }, [studySessionId]);
  
  const handleNewStudy = () => {
    navigation.navigate('Study');
  };
  
  const handleGoHome = () => {
    navigation.navigate('Main');
  };
  
  if (!session) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Carregando resultados...</Text>
      </View>
    );
  }
  
  // Calculate accuracy
  const accuracy = session.questionsAnswered > 0 
    ? (session.correctAnswers / session.questionsAnswered) * 100 
    : 0;
  
  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Resultados do Estudo</Text>
          <Text style={styles.subtitle}>
            Confira seu desempenho nesta sessão de estudo
          </Text>
        </View>
        
        <View style={styles.statsCard}>
          <Text style={styles.cardTitle}>Resumo</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{session.questionsAnswered}</Text>
              <Text style={styles.statLabel}>Questões</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{session.correctAnswers}</Text>
              <Text style={styles.statLabel}>Corretas</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{accuracy.toFixed(1)}%</Text>
              <Text style={styles.statLabel}>Acertos</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.detailsCard}>
          <Text style={styles.cardTitle}>Detalhes</Text>
          
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Disciplinas:</Text>
            <View style={styles.disciplinesList}>
              {session.disciplines.map(discipline => (
                <View key={discipline} style={styles.disciplineTag}>
                  <Text style={styles.disciplineTagText}>
                    {disciplineLabels[discipline] || discipline}
                  </Text>
                </View>
              ))}
            </View>
          </View>
          
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Questões planejadas:</Text>
            <Text style={styles.detailValue}>{session.questionCount}</Text>
          </View>
          
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Questões respondidas:</Text>
            <Text style={styles.detailValue}>{session.questionsAnswered}</Text>
          </View>
          
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Aulas visualizadas:</Text>
            <Text style={styles.detailValue}>{session.lessonsViewed}</Text>
          </View>
          
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Data do estudo:</Text>
            <Text style={styles.detailValue}>
              {new Date(session.timestamp).toLocaleString()}
            </Text>
          </View>
        </View>
        
        <View style={styles.insightCard}>
          <Text style={styles.cardTitle}>Insights</Text>
          
          {session.lessonsViewed > 0 ? (
            <View style={styles.insightItem}>
              <Icon name="lightbulb" size={24} color="#f39c12" style={styles.insightIcon} />
              <Text style={styles.insightText}>
                Você visualizou {session.lessonsViewed} aulas durante este estudo.
                Isso demonstra seu interesse em aprofundar o conhecimento!
              </Text>
            </View>
          ) : (
            <View style={styles.insightItem}>
              <Icon name="lightbulb" size={24} color="#f39c12" style={styles.insightIcon} />
              <Text style={styles.insightText}>
                Você não visualizou nenhuma aula durante este estudo.
                Considere ver as aulas para melhorar seu aprendizado!
              </Text>
            </View>
          )}
          
          {accuracy >= 70 ? (
            <View style={styles.insightItem}>
              <Icon name="emoji-events" size={24} color="#f39c12" style={styles.insightIcon} />
              <Text style={styles.insightText}>
                Parabéns! Você teve um ótimo desempenho com {accuracy.toFixed(1)}% de acertos.
                Continue assim!
              </Text>
            </View>
          ) : accuracy >= 50 ? (
            <View style={styles.insightItem}>
              <Icon name="trending-up" size={24} color="#f39c12" style={styles.insightIcon} />
              <Text style={styles.insightText}>
                Bom trabalho! Você teve um desempenho razoável com {accuracy.toFixed(1)}% de acertos.
                Continue praticando para melhorar!
              </Text>
            </View>
          ) : (
            <View style={styles.insightItem}>
              <Icon name="school" size={24} color="#f39c12" style={styles.insightIcon} />
              <Text style={styles.insightText}>
                Você teve {accuracy.toFixed(1)}% de acertos. Não desanime!
                Revise as aulas e continue praticando para melhorar seu desempenho.
              </Text>
            </View>
          )}
        </View>
        
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.newStudyButton]}
            onPress={handleNewStudy}
          >
            <Text style={styles.actionButtonText}>Novo Estudo</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.homeButton]}
            onPress={handleGoHome}
          >
            <Text style={styles.actionButtonText}>Voltar ao Início</Text>
          </TouchableOpacity>
        </View>
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
    color: '#27ae60',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailsCard: {
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
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailLabel: {
    fontSize: 16,
    color: '#333',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  disciplinesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    flex: 1,
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
  insightCard: {
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
  insightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  insightIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  insightText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
    lineHeight: 20,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  actionButton: {
    flex: 1,
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  newStudyButton: {
    backgroundColor: '#27ae60',
    marginRight: 8,
  },
  homeButton: {
    backgroundColor: '#3498db',
    marginLeft: 8,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default StudyResultsScreen;
