import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Linking,
  Platform
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import Icon from 'react-native-vector-icons/MaterialIcons';

type SupportScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Support'>;

const SupportScreen = () => {
  const navigation = useNavigation<SupportScreenNavigationProp>();

  const handleSupportPress = async () => {
    const url = 'https://apoia.se/enemprepai';
    const supported = await Linking.canOpenURL(url);

    if (supported) {
      await Linking.openURL(url);
    } else {
      console.error(`Não foi possível abrir a URL: ${url}`);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Apoie o Desenvolvedor</Text>
      </View>

      <View style={styles.content}>
        <Image
          source={require('../../assets/images/enem-logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={styles.description}>
          O EnemPrepAI é um aplicativo gratuito desenvolvido para ajudar estudantes
          a se prepararem para o ENEM. Todo o conteúdo e funcionalidades estão
          disponíveis offline, incluindo:
        </Text>

        <View style={styles.featureList}>
          <View style={styles.featureItem}>
            <Icon name="check-circle" size={24} color="#3498db" />
            <Text style={styles.featureText}>Questões do ENEM com aulas explicativas</Text>
          </View>
          <View style={styles.featureItem}>
            <Icon name="check-circle" size={24} color="#3498db" />
            <Text style={styles.featureText}>Avaliação de redações com IA offline</Text>
          </View>
          <View style={styles.featureItem}>
            <Icon name="check-circle" size={24} color="#3498db" />
            <Text style={styles.featureText}>Escaneamento de redações manuscritas</Text>
          </View>
          <View style={styles.featureItem}>
            <Icon name="check-circle" size={24} color="#3498db" />
            <Text style={styles.featureText}>Estudo personalizado por disciplina</Text>
          </View>
        </View>

        <Text style={styles.supportText}>
          Se você gostou do aplicativo e deseja apoiar o desenvolvimento de
          novas funcionalidades, considere fazer uma contribuição através do Apoia.se.
          Sua ajuda é fundamental para manter o projeto e adicionar novos recursos!
        </Text>

        <TouchableOpacity
          style={styles.supportButton}
          onPress={handleSupportPress}
        >
          <Icon name="favorite" size={24} color="#fff" />
          <Text style={styles.supportButtonText}>Apoiar no Apoia.se</Text>
        </TouchableOpacity>

        <View style={styles.developerInfo}>
          <Text style={styles.developerTitle}>Desenvolvido por:</Text>
          <Text style={styles.developerName}>Cloura Dev</Text>
          <Text style={styles.developerContact}>contato@clouradev.com</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
  },
  content: {
    padding: 20,
    alignItems: 'center',
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  featureList: {
    width: '100%',
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
  },
  supportText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  supportButton: {
    flexDirection: 'row',
    backgroundColor: '#e74c3c',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  supportButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  developerInfo: {
    alignItems: 'center',
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    width: '100%',
  },
  developerTitle: {
    fontSize: 14,
    color: '#777',
  },
  developerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 5,
  },
  developerContact: {
    fontSize: 14,
    color: '#3498db',
    marginTop: 5,
  },
});

export default SupportScreen;
