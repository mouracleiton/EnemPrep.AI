import React, { useState, useEffect } from 'react';
import { Image, Platform, View, StyleSheet, Text } from 'react-native';
import * as FileSystem from 'expo-file-system';

interface LocalImageProps {
  filename: string;
  style?: any;
  resizeMode?: 'contain' | 'cover' | 'stretch' | 'center';
}

// Import placeholder image statically
const placeholderImage = require('../../assets/images/placeholder.png');

const LocalImage: React.FC<LocalImageProps> = ({
  filename,
  style,
  resizeMode = 'contain'
}) => {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [imageSource, setImageSource] = useState<any>(placeholderImage);

  useEffect(() => {
    loadImage();
  }, [filename]);

  const loadImage = () => {
    if (!filename) {
      console.error('No filename provided to LocalImage');
      setError(true);
      setLoading(false);
      return;
    }

    try {
      // Set up the image source based on platform
      if (Platform.OS === 'android') {
        // For Android, use the asset:// protocol
        const source = { uri: `asset:/assets/img/${filename}` };
        console.log(`Loading Android image: ${source.uri}`);
        setImageSource(source);
      } else if (Platform.OS === 'ios') {
        // For iOS, use the bundle directory
        const source = { uri: `${FileSystem.bundleDirectory}assets/img/${filename}` };
        console.log(`Loading iOS image: ${source.uri}`);
        setImageSource(source);
      } else {
        // For web
        const source = { uri: `assets/img/${filename}` };
        console.log(`Loading web image: ${source.uri}`);
        setImageSource(source);
      }
    } catch (e) {
      console.error(`Error setting up image ${filename}:`, e);
      setError(true);
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, style]}>
      <Image
        source={imageSource}
        style={[styles.image, style]}
        resizeMode={resizeMode}
        onLoad={() => {
          console.log(`Image loaded successfully: ${filename}`);
          setLoading(false);
        }}
        onError={() => {
          console.error(`Failed to load image: ${filename}`);
          setError(true);
          setLoading(false);
          // Fall back to placeholder
          setImageSource(placeholderImage);
        }}
        defaultSource={placeholderImage}
      />
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>[Imagem não disponível: {filename}]</Text>
        </View>
      )}
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
  errorContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 4,
  },
  errorText: {
    color: 'white',
    fontSize: 12,
    textAlign: 'center',
  },
});

export default LocalImage;
