import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
  Image
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type SupportScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const SupportScreen = () => {
  const navigation = useNavigation<SupportScreenNavigationProp>();
  const insets = useSafeAreaInsets();

  const handleOpenLink = async (url: string, errorMessage: string) => {
    const canOpen = await Linking.canOpenURL(url);

    if (canOpen) {
      await Linking.openURL(url);
    } else {
      alert(errorMessage);
    }
  };

  const handleOpenDonationLink = () => {
    handleOpenLink(
      'https://apoia.se/enemprepai',
      'Não foi possível abrir o link de apoio. Por favor, visite https://apoia.se/enemprepai manualmente.'
    );
  };

  const handleOpenReleasesLink = () => {
    handleOpenLink(
      'https://github.com/mouracleiton/EnemPrep.AI/releases',
      'Não foi possível abrir o link das releases. Por favor, visite https://github.com/mouracleiton/EnemPrep.AI/releases manualmente.'
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#3498db" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Apoie o Desenvolvedor</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.supportCard}>
          <Ionicons name="heart" size={60} color="#e74c3c" style={styles.heartIcon} />

          <Text style={styles.supportTitle}>
            Ajude a manter o ENEM Prep AI gratuito!
          </Text>

          <Text style={styles.supportText}>
            Este aplicativo foi desenvolvido para ajudar estudantes a se prepararem para o ENEM de forma gratuita e eficiente.
          </Text>

          <Text style={styles.supportText}>
            Se você está gostando do aplicativo e deseja contribuir para que possamos continuar melhorando e adicionando novos recursos, considere fazer uma doação.
          </Text>

          <Text style={styles.supportText}>
            Sua contribuição ajuda a cobrir os custos de desenvolvimento, hospedagem e manutenção do aplicativo.
          </Text>

          <TouchableOpacity
            style={styles.donateButton}
            onPress={handleOpenDonationLink}
          >
            <Ionicons name="cash-outline" size={24} color="#fff" style={styles.donateIcon} />
            <Text style={styles.donateButtonText}>Apoiar no Apoia.se</Text>
          </TouchableOpacity>

          <Text style={styles.linkText}>
            https://apoia.se/enemprepai
          </Text>

          <View style={styles.thanksContainer}>
            <Ionicons name="star" size={20} color="#f39c12" />
            <Text style={styles.thanksText}>
              Muito obrigado pelo seu apoio!
            </Text>
            <Ionicons name="star" size={20} color="#f39c12" />
          </View>

          <View style={styles.divider} />

          <Text style={styles.releasesTitle}>
            Baixe a última versão
          </Text>

          <Text style={styles.supportText}>
            Acesse o repositório do GitHub para baixar a versão mais recente do aplicativo.
          </Text>

          <TouchableOpacity
            style={styles.releasesButton}
            onPress={handleOpenReleasesLink}
          >
            <Ionicons name="logo-github" size={24} color="#fff" style={styles.donateIcon} />
            <Text style={styles.donateButtonText}>Ver Releases no GitHub</Text>
          </TouchableOpacity>

          <Text style={styles.linkText}>
            github.com/mouracleiton/EnemPrep.AI/releases
          </Text>
        </View>

        <View style={styles.featuresCard}>
          <Text style={styles.featuresTitle}>
            O que oferecemos:
          </Text>

          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={24} color="#27ae60" style={styles.featureIcon} />
            <Text style={styles.featureText}>
              Questões do ENEM com aulas explicativas
            </Text>
          </View>

          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={24} color="#27ae60" style={styles.featureIcon} />
            <Text style={styles.featureText}>
              Funcionamento 100% offline
            </Text>
          </View>

          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={24} color="#27ae60" style={styles.featureIcon} />
            <Text style={styles.featureText}>
              Estudo personalizado por disciplina
            </Text>
          </View>

          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={24} color="#27ae60" style={styles.featureIcon} />
            <Text style={styles.featureText}>
              Estatísticas de desempenho
            </Text>
          </View>

          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={24} color="#27ae60" style={styles.featureIcon} />
            <Text style={styles.featureText}>
              Modelo de IA para avaliação de redações
            </Text>
          </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  supportCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    alignItems: 'center',
  },
  heartIcon: {
    marginBottom: 16,
  },
  supportTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  supportText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
    lineHeight: 24,
    textAlign: 'center',
  },
  donateButton: {
    backgroundColor: '#e74c3c',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    marginBottom: 12,
    width: '100%',
  },
  donateIcon: {
    marginRight: 8,
  },
  donateButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  linkText: {
    fontSize: 14,
    color: '#3498db',
    marginBottom: 16,
  },
  thanksContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  thanksText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginHorizontal: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    width: '100%',
    marginVertical: 20,
  },
  releasesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  releasesButton: {
    backgroundColor: '#333',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    marginBottom: 12,
    width: '100%',
  },
  featuresCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureIcon: {
    marginRight: 12,
  },
  featureText: {
    fontSize: 16,
    color: '#666',
    flex: 1,
  },
});

export default SupportScreen;
