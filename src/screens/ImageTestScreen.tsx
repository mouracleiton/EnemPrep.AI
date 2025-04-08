
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';

const ImageTestScreen: React.FC = () => {
  const [imageResults, setImageResults] = useState<{[key: string]: boolean}>({});
  
  const testImages = [
    "a4ce09a966c52d6a22d73552d77d4ef9.png",
    "cd90782b16eb371ff19ee95f02680433.jpg",
    "f8f8ec5797e3906a52d7cc37c9a723d6.jpg",
    "3fb2d797bd1afc965fff8b25384586f0.png",
    "f96eac24389a067393d223c83cd4a468.jpg",
    "81125c252f9c3629c0b9d97f10fca384.png",
    "203a5c6558ac928ca4e4a5900ab477d4.png",
    "42ce9b164d93f22ca5b1156daef7b4a1.png",
    "4039cfcccfbe1b608482d3c0c414f548.png",
    "bcdfb000d1f270c26a68e2d3cc75efd2.png",
    "dab5a886fa8d335b68612f3ad78c7085.png",
    "e109e74d0e67fa4f89b56cf267910ed6.png",
    "78f1e7bf9b25c87afd79084e663b1b6a.png",
    "a7a3a500890e67f54f668ae8692955d6.png",
    "faf4244c0699b25958a17b2ce8bd20b8.png",
    "e42fd88162841c839745953d3c3551ed.png",
    "62ef3aece02ea35a9b69960350b78a93.jpg",
    "8632225e17566acdab52b87db8325d3b.jpg",
    "abef525f281416c1857ffd6ffbb6efde.png",
    "a466437182a5820fa9db21e56d2af536.png"
  ];
  
  const getImagePath = (filename: string): string => {
    if (Platform.OS === 'android') {
      return `asset:/assets/img/${filename}`;
    } else if (Platform.OS === 'ios') {
      return `${FileSystem.bundleDirectory}assets/img/${filename}`;
    } else {
      return `assets/img/${filename}`;
    }
  };
  
  const handleImageLoad = (filename: string) => {
    setImageResults(prev => ({
      ...prev,
      [filename]: true
    }));
  };
  
  const handleImageError = (filename: string) => {
    setImageResults(prev => ({
      ...prev,
      [filename]: false
    }));
  };
  
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Teste de Acesso às Imagens</Text>
      <Text style={styles.subtitle}>Plataforma: {Platform.OS}</Text>
      
      {testImages.map((filename, index) => (
        <View key={index} style={styles.imageContainer}>
          <Text style={styles.imageTitle}>{filename}</Text>
          <Image
            source={{ uri: getImagePath(filename) }}
            style={styles.image}
            onLoad={() => handleImageLoad(filename)}
            onError={() => handleImageError(filename)}
          />
          {imageResults[filename] !== undefined && (
            <Text style={[
              styles.resultText,
              imageResults[filename] ? styles.successText : styles.errorText
            ]}>
              {imageResults[filename] ? '✅ Carregada' : '❌ Falha'}
            </Text>
          )}
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 16,
  },
  imageContainer: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  imageTitle: {
    fontSize: 14,
    marginBottom: 8,
  },
  image: {
    width: '100%',
    height: 200,
    resizeMode: 'contain',
    backgroundColor: '#eee',
  },
  resultText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: 'bold',
  },
  successText: {
    color: 'green',
  },
  errorText: {
    color: 'red',
  },
});

export default ImageTestScreen;
