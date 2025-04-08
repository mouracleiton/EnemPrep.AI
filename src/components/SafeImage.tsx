import React, { useState, useEffect } from 'react';
import { Platform, View, StyleSheet, Text, ImageSourcePropType, TouchableOpacity, Image } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
import ImagePathMapper from '../utils/ImagePathMapper';
import ImageDebugger from '../utils/ImageDebugger';

interface SafeImageProps {
  filename: string;
  style?: any;
  resizeMode?: 'contain' | 'cover' | 'stretch' | 'center';
}

// Import placeholder image statically
const placeholderImage = require('../../assets/images/placeholder.png');

// Cache configuration
const CACHE_DIRECTORY = `${FileSystem.cacheDirectory}image-cache/`;

const SafeImage: React.FC<SafeImageProps> = ({
  filename,
  style,
  resizeMode = 'contain'
}) => {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [imageSource, setImageSource] = useState<ImageSourcePropType>(placeholderImage);
  const [debugMode, setDebugMode] = useState(false);

  // Ensure cache directory exists
  useEffect(() => {
    const ensureCacheDirectory = async () => {
      const dirInfo = await FileSystem.getInfoAsync(CACHE_DIRECTORY);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(CACHE_DIRECTORY, { intermediates: true });
      }
    };

    ensureCacheDirectory();
  }, []);

  // Load image when filename changes
  useEffect(() => {
    loadImage();
  }, [filename]);

  const loadImage = async () => {
    if (!filename) {
      console.error('No filename provided to SafeImage');
      setError(true);
      setLoading(false);
      return;
    }

    try {
      // Clean up the filename if it has any path information
      const cleanFilename = filename.split('/').pop() || filename;
      console.log(`SafeImage loading: ${cleanFilename}`);

      // Registrar informações de debug
      if (debugMode) {
        ImageDebugger.logImageDebugInfo(cleanFilename);
      }

      // Check if image is already cached
      const cachedPath = `${CACHE_DIRECTORY}${cleanFilename}`;
      const cacheInfo = await FileSystem.getInfoAsync(cachedPath);

      if (cacheInfo.exists) {
        console.log(`Using cached image: ${cachedPath}`);
        setImageSource({ uri: cachedPath });
        setLoading(false);
        return;
      }

      // Image not cached, try to load from assets
      try {
        // Obter todos os caminhos possíveis
        const paths = ImageDebugger.getAllPossiblePaths(cleanFilename);

        // Usar o primeiro caminho disponível
        if (paths.length > 0) {
          const imagePath = paths[0];
          console.log(`Usando caminho: ${imagePath}`);

          // Try to cache the image
          try {
            // For Android and iOS, we can try to cache the image
            if (Platform.OS !== 'web') {
              await FileSystem.copyAsync({
                from: imagePath,
                to: cachedPath
              });
              console.log(`Image cached at: ${cachedPath}`);
              setImageSource({ uri: cachedPath });
            } else {
              // For web, just use the path directly
              setImageSource({ uri: imagePath });
            }
          } catch (cacheError) {
            console.log('Error caching image:', cacheError);
            // If caching fails, use the original path
            setImageSource({ uri: imagePath });
          }
        } else {
          console.error(`Nenhum caminho disponível para: ${cleanFilename}`);
          setError(true);
          setImageSource(placeholderImage);
        }
      } catch (e) {
        console.log('Erro ao carregar imagem:', e);
        setError(true);
        setLoading(false);
        setImageSource(placeholderImage);
      }
    } catch (e) {
      console.error(`Erro ao configurar imagem ${filename}:`, e);
      setError(true);
      setLoading(false);
      setImageSource(placeholderImage);
    }
  };

  // Fallback para quando a imagem falha ao carregar
  const handleImageError = async () => {
    console.error(`Falha ao carregar imagem: ${filename}`);

    // Ativar modo de debug automaticamente quando uma imagem falha
    if (!debugMode) {
      setDebugMode(true);
      // Registrar informações de debug
      const cleanFilename = filename.split('/').pop() || filename;
      ImageDebugger.logImageDebugInfo(cleanFilename);
    }

    // Contador de tentativas para evitar loops infinitos
    const maxRetries = 3;
    const currentRetry = (imageSource as any)?.retry || 0;

    if (currentRetry >= maxRetries) {
      console.log(`Atingido número máximo de tentativas (${maxRetries}) para ${filename}`);
      setError(true);
      setImageSource(placeholderImage);
      return;
    }

    // Tentar com caminhos alternativos
    try {
      const cleanFilename = filename.split('/').pop() || filename;
      const paths = ImageDebugger.getAllPossiblePaths(cleanFilename);

      // Usar o próximo caminho disponível
      if (paths.length > currentRetry + 1) {
        const nextPath = paths[currentRetry + 1];
        console.log(`Tentativa ${currentRetry + 1}: Usando caminho alternativo: ${nextPath}`);

        // Try to cache the image from the alternative path
        const cachedPath = `${CACHE_DIRECTORY}${cleanFilename}`;

        try {
          // For Android and iOS, we can try to cache the image
          if (Platform.OS !== 'web') {
            // Remove failed cache if exists
            const cacheInfo = await FileSystem.getInfoAsync(cachedPath);
            if (cacheInfo.exists) {
              await FileSystem.deleteAsync(cachedPath, { idempotent: true });
            }

            // Try to copy from alternative path
            await FileSystem.copyAsync({
              from: nextPath,
              to: cachedPath
            });
            console.log(`Image cached from alternative path at: ${cachedPath}`);
            setImageSource({ uri: cachedPath, retry: currentRetry + 1 });
          } else {
            // For web, just use the path directly
            setImageSource({ uri: nextPath, retry: currentRetry + 1 });
          }
        } catch (cacheError) {
          console.log('Error caching from alternative path:', cacheError);
          // If caching fails, use the alternative path directly
          setImageSource({ uri: nextPath, retry: currentRetry + 1 });
        }

        return;
      }
    } catch (e) {
      console.log('Erro ao tentar caminhos alternativos:', e);
    }

    // Se todas as abordagens falharem, mostrar o placeholder
    console.log(`Todas as abordagens falharam para ${filename}`);
    setError(true);
    setImageSource(placeholderImage);
  };

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        activeOpacity={0.9}
        onLongPress={() => {
          setDebugMode(!debugMode);
          if (!debugMode) {
            const cleanFilename = filename.split('/').pop() || filename;
            ImageDebugger.logImageDebugInfo(cleanFilename);
          }
        }}
        style={{ width: '100%', height: '100%' }}
      >
        <Image
          source={imageSource}
          style={[styles.image, style]}
          resizeMode={resizeMode || 'contain'}
          onLoad={() => {
            console.log(`Image loaded successfully: ${filename}`);
            setLoading(false);
            setError(false);
          }}
          onError={() => {
            // If we're already showing the placeholder, don't try again
            if (imageSource === placeholderImage) {
              setError(true);
              setLoading(false);
            } else {
              handleImageError();
            }
          }}
          defaultSource={placeholderImage}
          // Enable caching
          fadeDuration={300}
        />
        {loading && (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Carregando...</Text>
          </View>
        )}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>[Imagem não disponível: {filename}]</Text>
          </View>
        )}
        {debugMode && (
          <View style={styles.debugContainer}>
            <Text style={styles.debugText}>Debug: {filename}</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: 4,
  },
  loadingText: {
    color: 'white',
    fontSize: 12,
    textAlign: 'center',
  },
  errorContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255,0,0,0.5)',
    padding: 4,
  },
  errorText: {
    color: 'white',
    fontSize: 12,
    textAlign: 'center',
  },
  debugContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,255,0.5)',
    padding: 4,
  },
  debugText: {
    color: 'white',
    fontSize: 10,
    textAlign: 'center',
  },
});

export default SafeImage;
