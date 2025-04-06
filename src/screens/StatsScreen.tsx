import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { LineChart, PieChart } from 'react-native-chart-kit';
import DataService from '../services/DataService';

const StatsScreen = () => {
  const stats = DataService.getUserStatistics();
  const screenWidth = Dimensions.get('window').width;
  
  // Prepare data for the pie chart
  const pieChartData = [
    {
      name: 'Corretas',
      population: stats.correct,
      color: '#2ecc71',
      legendFontColor: '#333',
      legendFontSize: 15,
    },
    {
      name: 'Incorretas',
      population: stats.incorrect,
      color: '#e74c3c',
      legendFontColor: '#333',
      legendFontSize: 15,
    },
  ];
  
  // Prepare data for the line chart (last 7 days)
  const userAnswers = DataService.getUserAnswers();
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toISOString().split('T')[0];
  }).reverse();
  
  const answersPerDay = last7Days.map(day => {
    return userAnswers.filter(answer => {
      const answerDate = new Date(answer.timestamp).toISOString().split('T')[0];
      return answerDate === day;
    }).length;
  });
  
  const lineChartData = {
    labels: last7Days.map(day => day.split('-')[2]), // Just show the day
    datasets: [
      {
        data: answersPerDay,
        color: (opacity = 1) => `rgba(52, 152, 219, ${opacity})`,
        strokeWidth: 2,
      },
    ],
    legend: ['Questões por dia'],
  };
  
  // Prepare discipline statistics
  const disciplineStats = Object.entries(stats.disciplineStats || {}).map(
    ([discipline, data]) => ({
      discipline,
      total: data.total,
      correct: data.correct,
      accuracy: data.total > 0 ? (data.correct / data.total) * 100 : 0,
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
      
      {stats.total > 0 && (
        <>
          <View style={styles.chartCard}>
            <Text style={styles.cardTitle}>Distribuição de Respostas</Text>
            <View style={styles.chartContainer}>
              <PieChart
                data={pieChartData}
                width={screenWidth - 32}
                height={200}
                chartConfig={{
                  backgroundColor: '#fff',
                  backgroundGradientFrom: '#fff',
                  backgroundGradientTo: '#fff',
                  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                }}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="15"
                absolute
              />
            </View>
          </View>
          
          <View style={styles.chartCard}>
            <Text style={styles.cardTitle}>Atividade nos Últimos 7 Dias</Text>
            <View style={styles.chartContainer}>
              <LineChart
                data={lineChartData}
                width={screenWidth - 32}
                height={220}
                chartConfig={{
                  backgroundColor: '#fff',
                  backgroundGradientFrom: '#fff',
                  backgroundGradientTo: '#fff',
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  style: {
                    borderRadius: 16,
                  },
                }}
                bezier
                style={{
                  marginVertical: 8,
                  borderRadius: 16,
                }}
              />
            </View>
          </View>
          
          <View style={styles.disciplinesCard}>
            <Text style={styles.cardTitle}>Desempenho por Disciplina</Text>
            {disciplineStats.length > 0 ? (
              disciplineStats.map((item, index) => (
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
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>
                Nenhuma questão respondida por disciplina
              </Text>
            )}
          </View>
        </>
      )}
      
      {stats.total === 0 && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>Sem dados disponíveis</Text>
          <Text style={styles.emptyText}>
            Responda algumas questões para ver suas estatísticas
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
  chartCard: {
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
  chartContainer: {
    alignItems: 'center',
  },
  disciplinesCard: {
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
  disciplineItem: {
    marginBottom: 16,
  },
  disciplineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
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
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#3498db',
    borderRadius: 4,
  },
  disciplineStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  disciplineStat: {
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    margin: 16,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default StatsScreen;
