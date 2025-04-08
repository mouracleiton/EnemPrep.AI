import React, { useState, useEffect } from 'react';
import { View, Image, Text, StyleSheet, Dimensions, Platform } from 'react-native';

interface AndroidImageProps {
  filename: string;
  style?: any;
}

const { width } = Dimensions.get('window');

const AndroidImage: React.FC<AndroidImageProps> = ({ filename, style }) => {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [imageSource, setImageSource] = useState<any>(null);
  const [attemptCount, setAttemptCount] = useState(0);

  // Try different protocols in sequence
  useEffect(() => {
    if (!filename) {
      setError(true);
      setLoading(false);
      return;
    }

    // Reset states when filename changes
    setError(false);
    setLoading(true);
    
    // Different protocols to try
    const protocols = [
      { name: 'asset', uri: `asset:/assets/img/${filename}` },
      { name: 'file', uri: `file:///android_asset/assets/img/${filename}` },
      { name: 'relative', uri: `assets/img/${filename}` }
    ];
    
    // Use the protocol based on the attempt count
    if (attemptCount < protocols.length) {
      const protocol = protocols[attemptCount];
      console.log(`Attempt ${attemptCount + 1}: Using ${protocol.name} protocol: ${protocol.uri}`);
      setImageSource({ uri: protocol.uri });
    } else {
      // All attempts failed
      console.error(`Failed to load image after ${attemptCount} attempts: ${filename}`);
      setError(true);
      setLoading(false);
    }
  }, [filename, attemptCount]);

  return (
    <View style={[styles.container, style]}>
      {imageSource && (
        <Image
          source={imageSource}
          style={styles.image}
          resizeMode="contain"
          onLoad={() => {
            console.log(`Image loaded successfully with attempt ${attemptCount + 1}: ${filename}`);
            setLoading(false);
          }}
          onError={() => {
            console.error(`Failed to load image with attempt ${attemptCount + 1}: ${filename}`);
            
            // Try the next protocol
            if (attemptCount < 2) {
              setAttemptCount(attemptCount + 1);
            } else {
              setError(true);
              setLoading(false);
            }
          }}
        />
      )}
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

export default AndroidImage;
