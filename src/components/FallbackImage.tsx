import React, { useState } from 'react';
import { View, Image, Text, StyleSheet, Dimensions, Platform } from 'react-native';

interface FallbackImageProps {
  filename: string;
  style?: any;
}

const { width } = Dimensions.get('window');

// Componente que exibe uma imagem com fallback para uma URL externa
const FallbackImage: React.FC<FallbackImageProps> = ({ filename, style }) => {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  // Verificar se o filename é válido
  if (!filename) {
    console.error('FallbackImage: filename is undefined or null');
    return (
      <View style={[styles.container, style]}>
        <Text style={styles.errorText}>Imagem não disponível</Text>
      </View>
    );
  }

  // Remover qualquer caminho da URL e obter apenas o nome do arquivo
  const cleanFilename = filename.split('/').pop() || filename;

  // URL externa para a imagem (sempre disponível)
  const externalUrl = `https://enem.dev/assets/img/${cleanFilename}`;

  return (
    <View style={[styles.container, style]}>
      <Image
        source={{ uri: externalUrl }}
        style={styles.image}
        resizeMode="contain"
        onLoad={() => {
          console.log(`Image loaded successfully from external URL: ${externalUrl}`);
          setLoading(false);
        }}
        onError={() => {
          console.error(`Failed to load image from external URL: ${externalUrl}`);
          setError(true);
          setLoading(false);
        }}
      />
      {(error || loading) && (
        <Text style={styles.errorText}>
          {loading ? 'Carregando...' : `Erro ao carregar: ${cleanFilename}`}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 100,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 16,
    marginVertical: 8,
  },
  image: {
    width: width - 64,
    height: 200,
    borderRadius: 4,
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
});

export default FallbackImage;
