import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import Icon from 'react-native-vector-icons/MaterialIcons';
import essayEvaluationService, { EssayEvaluation } from '../services/EssayEvaluationService';

type EssayResultScreenRouteProp = RouteProp<RootStackParamList, 'EssayResult'>;
type EssayResultScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const EssayResultScreen: React.FC = () => {
  const route = useRoute<EssayResultScreenRouteProp>();
  const navigation = useNavigation<EssayResultScreenNavigationProp>();
  const [evaluation, setEvaluation] = useState<EssayEvaluation | null>(null);
  const [loading, setLoading] = useState(true);
  const { evaluationId } = route.params;

  useEffect(() => {
    loadEvaluation();
  }, [evaluationId]);

  const loadEvaluation = () => {
    try {
      const essayEvaluation = essayEvaluationService.getEssayById(evaluationId);
      if (!essayEvaluation) {
        Alert.alert('Erro', 'Avaliação não encontrada.');
        navigation.goBack();
        return;
      }
      
      setEvaluation(essayEvaluation);
    } catch (error) {
      Alert.alert('Erro', 'Ocorreu um erro ao carregar a avaliação.');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const getCompetencyColor = (score: number) => {
    if (score >= 160) return '#27ae60'; // Excellent
    if (score >= 120) return '#2ecc71'; // Good
    if (score >= 80) return '#f39c12'; // Average
    if (score >= 40) return '#e67e22'; // Below average
    return '#e74c3c'; // Poor
  };

  const getTotalScoreColor = (score: number) => {
    if (score >= 800) return '#27ae60'; // Excellent
    if (score >= 600) return '#2ecc71'; // Good
    if (score >= 400) return '#f39c12'; // Average
    if (score >= 200) return '#e67e22'; // Below average
    return '#e74c3c'; // Poor
  };

  const handleNewEssay = () => {
    navigation.navigate('Essay');
  };

  const handleViewText = () => {
    if (!evaluation) return;
    
    Alert.alert(
      'Texto da Redação',
      evaluation.text,
      [{ text: 'Fechar' }],
      { cancelable: true }
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Carregando avaliação...</Text>
      </View>
    );
  }

  if (!evaluation) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="error" size={64} color="#e74c3c" />
        <Text style={styles.errorText}>Avaliação não encontrada</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Resultado da Avaliação</Text>
        <Text style={styles.subtitle}>
          Avaliação baseada nos critérios oficiais do ENEM
        </Text>
      </View>

      <View style={styles.scoreContainer}>
        <View style={styles.totalScoreContainer}>
          <Text style={styles.totalScoreLabel}>Nota Final</Text>
          <Text style={[
            styles.totalScore,
            { color: getTotalScoreColor(evaluation.totalScore) }
          ]}>
            {evaluation.totalScore}
          </Text>
          <Text style={styles.totalScoreMax}>/ 1000</Text>
        </View>

        <TouchableOpacity
          style={styles.viewTextButton}
          onPress={handleViewText}
        >
          <Icon name="description" size={16} color="#3498db" />
          <Text style={styles.viewTextButtonText}>Ver Texto</Text>
        </TouchableOpacity>

        <View style={styles.essayInfoContainer}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Palavras:</Text>
            <Text style={styles.infoValue}>{evaluation.wordCount}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Linhas:</Text>
            <Text style={styles.infoValue}>{evaluation.lineCount}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Data:</Text>
            <Text style={styles.infoValue}>
              {new Date(evaluation.timestamp).toLocaleDateString()}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.competenciesContainer}>
        <Text style={styles.sectionTitle}>Competências</Text>

        <View style={styles.competencyItem}>
          <View style={styles.competencyHeader}>
            <Text style={styles.competencyTitle}>Competência 1</Text>
            <Text style={[
              styles.competencyScore,
              { color: getCompetencyColor(evaluation.competencyScores.competency1) }
            ]}>
              {evaluation.competencyScores.competency1}
            </Text>
          </View>
          <Text style={styles.competencyDescription}>
            Demonstrar domínio da norma padrão da língua escrita
          </Text>
          <Text style={styles.competencyFeedback}>
            {evaluation.feedback.competency1Feedback}
          </Text>
        </View>

        <View style={styles.competencyItem}>
          <View style={styles.competencyHeader}>
            <Text style={styles.competencyTitle}>Competência 2</Text>
            <Text style={[
              styles.competencyScore,
              { color: getCompetencyColor(evaluation.competencyScores.competency2) }
            ]}>
              {evaluation.competencyScores.competency2}
            </Text>
          </View>
          <Text style={styles.competencyDescription}>
            Compreender a proposta e aplicar conceitos das várias áreas de conhecimento
          </Text>
          <Text style={styles.competencyFeedback}>
            {evaluation.feedback.competency2Feedback}
          </Text>
        </View>

        <View style={styles.competencyItem}>
          <View style={styles.competencyHeader}>
            <Text style={styles.competencyTitle}>Competência 3</Text>
            <Text style={[
              styles.competencyScore,
              { color: getCompetencyColor(evaluation.competencyScores.competency3) }
            ]}>
              {evaluation.competencyScores.competency3}
            </Text>
          </View>
          <Text style={styles.competencyDescription}>
            Selecionar, relacionar, organizar e interpretar informações em defesa de um ponto de vista
          </Text>
          <Text style={styles.competencyFeedback}>
            {evaluation.feedback.competency3Feedback}
          </Text>
        </View>

        <View style={styles.competencyItem}>
          <View style={styles.competencyHeader}>
            <Text style={styles.competencyTitle}>Competência 4</Text>
            <Text style={[
              styles.competencyScore,
              { color: getCompetencyColor(evaluation.competencyScores.competency4) }
            ]}>
              {evaluation.competencyScores.competency4}
            </Text>
          </View>
          <Text style={styles.competencyDescription}>
            Demonstrar conhecimento dos mecanismos linguísticos necessários para a construção da argumentação
          </Text>
          <Text style={styles.competencyFeedback}>
            {evaluation.feedback.competency4Feedback}
          </Text>
        </View>

        <View style={styles.competencyItem}>
          <View style={styles.competencyHeader}>
            <Text style={styles.competencyTitle}>Competência 5</Text>
            <Text style={[
              styles.competencyScore,
              { color: getCompetencyColor(evaluation.competencyScores.competency5) }
            ]}>
              {evaluation.competencyScores.competency5}
            </Text>
          </View>
          <Text style={styles.competencyDescription}>
            Elaborar proposta de intervenção para o problema abordado, respeitando os direitos humanos
          </Text>
          <Text style={styles.competencyFeedback}>
            {evaluation.feedback.competency5Feedback}
          </Text>
        </View>
      </View>

      <View style={styles.analysisContainer}>
        <Text style={styles.sectionTitle}>Análise Geral</Text>
        <Text style={styles.analysisText}>
          {evaluation.feedback.generalAnalysis}
        </Text>
      </View>

      <View style={styles.summaryContainer}>
        <Text style={styles.sectionTitle}>Resumo</Text>
        <Text style={styles.summaryText}>
          {evaluation.feedback.summary}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.newEssayButton}
        onPress={handleNewEssay}
      >
        <Icon name="add" size={20} color="#fff" />
        <Text style={styles.newEssayButtonText}>Nova Redação</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
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
  scoreContainer: {
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 8,
    margin: 15,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  totalScoreContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  totalScoreLabel: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  totalScore: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  totalScoreMax: {
    fontSize: 16,
    color: '#777',
  },
  viewTextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 5,
    backgroundColor: '#f0f0f0',
    marginBottom: 15,
  },
  viewTextButtonText: {
    color: '#3498db',
    marginLeft: 5,
    fontWeight: 'bold',
  },
  essayInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 15,
  },
  infoItem: {
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
    color: '#777',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  competenciesContainer: {
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    margin: 15,
    marginTop: 0,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  competencyItem: {
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  competencyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  competencyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  competencyScore: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  competencyDescription: {
    fontSize: 14,
    color: '#777',
    marginBottom: 10,
    fontStyle: 'italic',
  },
  competencyFeedback: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  analysisContainer: {
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    margin: 15,
    marginTop: 0,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  analysisText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  summaryContainer: {
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    margin: 15,
    marginTop: 0,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  summaryText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  newEssayButton: {
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 8,
    margin: 15,
    marginTop: 0,
    marginBottom: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  newEssayButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  button: {
    marginTop: 20,
    backgroundColor: '#3498db',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default EssayResultScreen;
