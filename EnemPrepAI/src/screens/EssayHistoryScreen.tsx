import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import Icon from 'react-native-vector-icons/MaterialIcons';
import essayEvaluationService, { EssayEvaluation } from '../services/EssayEvaluationService';

type EssayHistoryScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const EssayHistoryScreen: React.FC = () => {
  const navigation = useNavigation<EssayHistoryScreenNavigationProp>();
  const [essays, setEssays] = useState<EssayEvaluation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEssays();
  }, []);

  const loadEssays = () => {
    try {
      const essayList = essayEvaluationService.getEssays();
      // Sort by timestamp (newest first)
      essayList.sort((a, b) => b.timestamp - a.timestamp);
      setEssays(essayList);
    } catch (error) {
      Alert.alert('Erro', 'Ocorreu um erro ao carregar as redações.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewEssay = (id: string) => {
    navigation.navigate('EssayResult', { evaluationId: id });
  };

  const handleDeleteEssay = (id: string) => {
    Alert.alert(
      'Excluir Redação',
      'Tem certeza que deseja excluir esta redação? Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              const success = await essayEvaluationService.deleteEssay(id);
              if (success) {
                // Refresh the list
                loadEssays();
              } else {
                Alert.alert('Erro', 'Não foi possível excluir a redação.');
              }
            } catch (error) {
              Alert.alert('Erro', 'Ocorreu um erro ao excluir a redação.');
            }
          }
        }
      ]
    );
  };

  const getScoreColor = (score: number) => {
    if (score >= 800) return '#27ae60'; // Excellent
    if (score >= 600) return '#2ecc71'; // Good
    if (score >= 400) return '#f39c12'; // Average
    if (score >= 200) return '#e67e22'; // Below average
    return '#e74c3c'; // Poor
  };

  const renderEssayItem = ({ item }: { item: EssayEvaluation }) => {
    // Get the first 50 characters of the essay text for preview
    const textPreview = item.text.length > 50
      ? `${item.text.substring(0, 50)}...`
      : item.text;

    // Format the date
    const date = new Date(item.timestamp);
    const formattedDate = `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

    return (
      <TouchableOpacity
        style={styles.essayItem}
        onPress={() => handleViewEssay(item.id)}
      >
        <View style={styles.essayHeader}>
          <Text style={styles.essayDate}>{formattedDate}</Text>
          <Text style={[
            styles.essayScore,
            { color: getScoreColor(item.totalScore) }
          ]}>
            {item.totalScore}
          </Text>
        </View>

        <Text style={styles.essayPreview} numberOfLines={2}>
          {textPreview}
        </Text>

        <View style={styles.essayFooter}>
          <View style={styles.essayStats}>
            <Text style={styles.essayStat}>
              <Icon name="text-fields" size={14} color="#777" /> {item.wordCount} palavras
            </Text>
            <Text style={styles.essayStat}>
              <Icon name="short-text" size={14} color="#777" /> {item.lineCount} linhas
            </Text>
          </View>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteEssay(item.id)}
          >
            <Icon name="delete" size={20} color="#e74c3c" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Carregando redações...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Histórico de Redações</Text>
        <Text style={styles.subtitle}>
          Suas redações avaliadas anteriormente
        </Text>
      </View>

      {essays.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="description" size={64} color="#bdc3c7" />
          <Text style={styles.emptyText}>
            Você ainda não tem redações avaliadas.
          </Text>
          <TouchableOpacity
            style={styles.newEssayButton}
            onPress={() => navigation.navigate('Essay')}
          >
            <Icon name="add" size={20} color="#fff" />
            <Text style={styles.newEssayButtonText}>Nova Redação</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={essays}
          renderItem={renderEssayItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
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
  listContainer: {
    padding: 15,
  },
  essayItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  essayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  essayDate: {
    fontSize: 14,
    color: '#777',
  },
  essayScore: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  essayPreview: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
  },
  essayFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
  },
  essayStats: {
    flexDirection: 'row',
  },
  essayStat: {
    fontSize: 12,
    color: '#777',
    marginRight: 10,
  },
  deleteButton: {
    padding: 5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#777',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  newEssayButton: {
    backgroundColor: '#3498db',
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
});

export default EssayHistoryScreen;
