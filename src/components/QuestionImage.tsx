import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, Platform, Image } from 'react-native';
import * as FileSystem from 'expo-file-system';
import SafeImage from './SafeImage';
import ImagePathMapper from '../utils/ImagePathMapper';
import { getImagePath } from '../utils/imagePathUtils';

interface QuestionImageProps {
  source: string | null;
  style?: any;
}

const { width } = Dimensions.get('window');

// Use our new question icon as a placeholder
const placeholderImage = require('../../assets/images/question-icon.png');

// Cache directory
const CACHE_DIRECTORY = `${FileSystem.cacheDirectory}question-image-cache/`;

const QuestionImage: React.FC<QuestionImageProps> = ({ source, style }) => {
  const [imageUri, setImageUri] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    loadImage();
  }, [source]);

  const loadImage = async () => {
    if (!source) {
      setLoading(false);
      setError(true);
      return;
    }

    try {
      // Get the filename from the source, handling different formats
      let filename = '';

      // Check if the source is a URL from enem.dev
      if (source.includes('enem.dev')) {
        // Extract just the filename from the URL
        const urlParts = source.split('/');
        filename = urlParts[urlParts.length - 1];
        console.log(`Converted enem.dev URL to filename: ${filename}`);
      } else if (source.includes('assets/img/')) {
        // Extract just the filename from the assets/img path
        const urlParts = source.split('/');
        filename = urlParts[urlParts.length - 1];
        console.log(`Converted assets/img path to filename: ${filename}`);
      } else if (source.startsWith('local:')) {
        // Handle local: prefix (from previous implementation)
        filename = source.replace('local:', '');
        console.log(`Extracted filename from local: ${filename}`);
      } else {
        // Handle direct filenames or other formats
        filename = source.split('/').pop() || '';
        console.log(`Using filename directly: ${filename}`);
      }

      // NOVA ABORDAGEM: Usar caminhos diretos para as imagens
      let imagePath;

      if (Platform.OS === 'android') {
        // No Android, vamos tentar com o protocolo file:///android_asset/
        imagePath = `file:///android_asset/assets/img/${filename}`;
        console.log(`Android - Usando caminho: ${imagePath}`);
      } else if (Platform.OS === 'ios') {
        // No iOS, vamos usar o FileSystem.bundleDirectory
        imagePath = `${FileSystem.bundleDirectory}assets/img/${filename}`;
        console.log(`iOS - Usando caminho: ${imagePath}`);
      } else {
        // Para web, usamos o caminho relativo
        imagePath = `assets/img/${filename}`;
        console.log(`Web - Usando caminho: ${imagePath}`);
      }

      // Configurar imagem
      setImageUri({ uri: imagePath });
      setLoading(false);
      return;
    } catch (e) {
      console.error(`Erro ao carregar imagem: ${e}`);
      setError(true);
      setLoading(false);
      setImageUri(placeholderImage);
    }
  };

  if (!source) {
    return null;
  }

  // Get the filename from the source for display
  const filename = source.split('/').pop() || '';

  // Try to use SafeImage component for direct rendering
  if (filename && !filename.includes('/')) {
    return <SafeImage filename={filename} style={style} />;
  }

  // If there's an error or we're still loading without an image
  if (error || (loading && !imageUri)) {
    return (
      <View style={[styles.container, style]}>
        <Image
          source={placeholderImage}
          style={styles.placeholderImage}
          resizeMode="contain"
        />
        <Text style={styles.placeholderText}>[Imagem: {filename}]</Text>
      </View>
    );
  }

  // Display the image
  return (
    <View style={[styles.container, style]}>
      {imageUri && (
        <Image
          source={imageUri}
          style={styles.image}
          resizeMode="contain"
          onError={() => {
            console.error(`Failed to load image: ${source}`);
            setError(true);
          }}
          defaultSource={placeholderImage}
          fadeDuration={300}
        />
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
  placeholderImage: {
    width: 48,
    height: 48,
    marginBottom: 8,
  },
  placeholderText: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default QuestionImage;
