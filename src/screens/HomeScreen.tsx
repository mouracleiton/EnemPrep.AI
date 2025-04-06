import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Animated, Easing } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import DataService from '../services/DataService';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [isLoading, setIsLoading] = useState(true);
  const [loadingStatus, setLoadingStatus] = useState('Iniciando...');
  const [stats, setStats] = useState({ total: 0, correct: 0, accuracy: 0 });

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
      setStats(DataService.getUserStatistics());
    });

    // Register a callback for loading status updates
    DataService.onLoadingStatus((status) => {
      setLoadingStatus(status);
    });

    // If data is already loaded, update state immediately
    if (DataService.isDataLoaded()) {
      setIsLoading(false);
      setStats(DataService.getUserStatistics());
    }
  }, []);

  // Get a random question to practice
  const getRandomQuestion = () => {
    const questions = DataService.getAllQuestions();
    if (questions.length > 0) {
      const randomIndex = Math.floor(Math.random() * questions.length);
      const question = questions[randomIndex];
      navigation.navigate('Question', {
        questionId: `${question.year}-${question.index}`
      });
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingTitle}>Carregando dados do ENEM</Text>
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
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Prepare-se para o ENEM</Text>
        <Text style={styles.subtitle}>
          Pratique questões e acompanhe seu desempenho
        </Text>
      </View>

      <View style={styles.statsCard}>
        <Text style={styles.cardTitle}>Seu Desempenho</Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.total}</Text>
            <Text style={styles.statLabel}>Questões</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.accuracy.toFixed(1)}%</Text>
            <Text style={styles.statLabel}>Acertos</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={styles.practiceButton}
        onPress={getRandomQuestion}
      >
        <Text style={styles.practiceButtonText}>Praticar Agora</Text>
      </TouchableOpacity>

      <View style={styles.featuresContainer}>
        <Text style={styles.sectionTitle}>Recursos Disponíveis</Text>

        <View style={styles.featureCard}>
          <View style={styles.featureIcon}>
            <Text style={styles.featureIconText}>📚</Text>
          </View>
          <View style={styles.featureContent}>
            <Text style={styles.featureTitle}>Questões Organizadas</Text>
            <Text style={styles.featureDescription}>
              Acesse questões do ENEM organizadas por ano, disciplina e assunto
            </Text>
          </View>
        </View>

        <View style={styles.featureCard}>
          <View style={styles.featureIcon}>
            <Text style={styles.featureIconText}>📊</Text>
          </View>
          <View style={styles.featureContent}>
            <Text style={styles.featureTitle}>Estatísticas Detalhadas</Text>
            <Text style={styles.featureDescription}>
              Acompanhe seu desempenho com gráficos e estatísticas por disciplina
            </Text>
          </View>
        </View>

        <View style={styles.featureCard}>
          <View style={styles.featureIcon}>
            <Text style={styles.featureIconText}>🎓</Text>
          </View>
          <View style={styles.featureContent}>
            <Text style={styles.featureTitle}>Aulas Personalizadas</Text>
            <Text style={styles.featureDescription}>
              Acesse aulas explicativas para cada questão e aprenda os conceitos
            </Text>
          </View>
        </View>
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
    // Adiciona uma animação de movimento
    position: 'absolute',
    left: 0,
    top: 0,
  },
  header: {
    backgroundColor: '#3498db',
    padding: 20,
    paddingTop: 40,
    paddingBottom: 40,
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
    textAlign: 'center',
  },
  statsCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    margin: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
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
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  practiceButton: {
    backgroundColor: '#2ecc71',
    borderRadius: 10,
    margin: 16,
    padding: 16,
    alignItems: 'center',
  },
  practiceButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  featuresContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  featureCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 16,
    padding: 16,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  featureIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureIconText: {
    fontSize: 24,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#333',
  },
  featureDescription: {
    fontSize: 14,
    color: '#666',
  },
});

export default HomeScreen;
