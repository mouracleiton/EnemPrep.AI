import React, { useState, useEffect } from 'react';
import { View, Image, Text, StyleSheet, Dimensions, Platform } from 'react-native';

interface DirectImageProps {
  filename: string;
  style?: any;
}

const { width } = Dimensions.get('window');

const DirectImage: React.FC<DirectImageProps> = ({ filename, style }) => {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  // State to track the image source
  const [imageSource, setImageSource] = useState<any>(null);

  // Set up the image source based on platform
  useEffect(() => {
    if (Platform.OS === 'android') {
      // Try with the asset:// protocol first
      setImageSource({ uri: `asset:/assets/img/${filename}` });
      console.log(`Using asset:// protocol: asset:/assets/img/${filename}`);
    } else {
      // For iOS and other platforms
      setImageSource({ uri: `assets/img/${filename}` });
    }
  }, [filename]);

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
          console.error(`Failed to load image with direct path: ${filename}`);

          // Try with file:// protocol as fallback
          if (Platform.OS === 'android') {
            const fileSource = { uri: `file:///android_asset/assets/img/${filename}` };
            console.log(`Trying with file:// protocol: ${fileSource.uri}`);

            // Try with a second Image component
            setImageSource(fileSource);
            console.log(`Updated image source to file:// protocol: ${fileSource.uri}`);

            // Set a timeout to show error if still not loaded
            setTimeout(() => {
              if (loading) {
                console.error(`Failed to load image with file:// protocol: ${filename}`);
                setError(true);
                setLoading(false);
              }
            }, 2000);
          } else {
            setError(true);
            setLoading(false);
          }
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

export default DirectImage;
