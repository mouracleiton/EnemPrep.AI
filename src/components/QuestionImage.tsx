import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, Image, Platform } from 'react-native';
import { getQuestionImage } from '../utils/QuestionImageMapping';
import * as FileSystem from 'expo-file-system';
import imageMapping from '../utils/QuestionImageMapping';

interface QuestionImageProps {
  source: string | null;
  style?: any;
}

const { width } = Dimensions.get('window');

// Use our new question icon as a placeholder
const placeholderImage = require('../../assets/images/question-icon.png');

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
      // Get the filename from the source, handling URLs from enem.dev
      let filename = '';

      // Check if the source is a URL from enem.dev
      if (source.includes('enem.dev')) {
        // Extract just the filename from the URL
        const urlParts = source.split('/');
        filename = urlParts[urlParts.length - 1];
        console.log(`Converted enem.dev URL to filename: ${filename}`);
      } else {
        filename = source.split('/').pop() || '';
      }

      // First try to use the mapping (works for all platforms)
      const mappedImage = getQuestionImage(filename);
      if (mappedImage) {
        setImageUri(mappedImage);
        setLoading(false);
        return;
      }

      // If mapping failed, try direct require for common images
      try {
        // Try to find the image in the mapping by filename
        const keys = Object.keys(imageMapping);
        const matchingKey = keys.find(key => key.toLowerCase() === filename.toLowerCase());

        if (matchingKey) {
          setImageUri(imageMapping[matchingKey]);
          setLoading(false);
          return;
        }
      } catch (e) {
        console.log('Error finding image in mapping:', e);
      }

      // For mobile platforms, try to load from assets directory
      if (Platform.OS === 'ios' || Platform.OS === 'android') {
        try {
          // Try to load from the bundle directory
          const assetUri = `${FileSystem.bundleDirectory}assets/img/${filename}`;
          const assetInfo = await FileSystem.getInfoAsync(assetUri);

          if (assetInfo.exists) {
            setImageUri({ uri: assetUri });
            setLoading(false);
            return;
          }

          // Try alternative path
          const altAssetUri = `${FileSystem.documentDirectory}assets/img/${filename}`;
          const altAssetInfo = await FileSystem.getInfoAsync(altAssetUri);

          if (altAssetInfo.exists) {
            setImageUri({ uri: altAssetUri });
            setLoading(false);
            return;
          }

          // Fallback to placeholder
          console.warn(`Image not found: ${filename}`);
          setImageUri(placeholderImage);
        } catch (e) {
          console.error('Error loading image from filesystem:', e);
          setImageUri(placeholderImage);
          setError(true);
        }
      } else {
        // Fallback for web
        setImageUri({ uri: `asset:/img/${filename}` });
      }
    } catch (e) {
      console.error('Error in loadImage:', e);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  if (!source) {
    return null;
  }

  // Get the filename from the source for display
  const filename = source.split('/').pop() || '';

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
