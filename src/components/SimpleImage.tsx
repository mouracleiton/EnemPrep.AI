import React, { useState } from 'react';
import { View, Image, Text, StyleSheet, Dimensions, Platform } from 'react-native';

interface SimpleImageProps {
  filename: string;
  style?: any;
}

const { width } = Dimensions.get('window');

const SimpleImage: React.FC<SimpleImageProps> = ({ filename, style }) => {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  // Determine the image source based on the platform
  let imageSource;
  if (Platform.OS === 'android') {
    // For Android, use the asset:// protocol
    imageSource = { uri: `asset:/assets/img/${filename}` };
  } else if (Platform.OS === 'ios') {
    // For iOS, use a relative path
    imageSource = { uri: `assets/img/${filename}` };
  } else {
    // For web or other platforms
    imageSource = { uri: `assets/img/${filename}` };
  }

  return (
    <View style={[styles.container, style]}>
      <Image
        source={imageSource}
        style={styles.image}
        resizeMode="contain"
        onLoad={() => {
          console.log(`Image loaded successfully: ${filename}`);
          setLoading(false);
        }}
        onError={() => {
          console.error(`Failed to load image: ${filename}`);
          setError(true);
          setLoading(false);
        }}
      />
      {(error || loading) && (
        <Text style={styles.errorText}>
          {loading ? 'Carregando...' : `Erro ao carregar: ${filename}`}
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

export default SimpleImage;
