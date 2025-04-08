/**
 * Script para verificar se as imagens estão acessíveis no formato correto
 * 
 * Este script verifica:
 * 1. Se todas as imagens referenciadas no enem_data.json existem no diretório assets/img
 * 2. Se os caminhos estão corretos para acesso no React Native
 */

const fs = require('fs');
const path = require('path');

// Diretórios base
const ROOT_DIR = path.join(__dirname, '..');
const ASSETS_DIR = path.join(ROOT_DIR, 'assets');
const IMG_DIR = path.join(ASSETS_DIR, 'img');
const DATA_FILE = path.join(ASSETS_DIR, 'enem_data.json');

// Função para ler o arquivo JSON
const readJsonFile = (filePath) => {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Erro ao ler o arquivo ${filePath}:`, error);
    return null;
  }
};

// Função para encontrar todas as imagens referenciadas no JSON
const findReferencedImages = (data) => {
  const images = new Set();
  
  // Função recursiva para procurar imagens em strings
  const findImagesInText = (text) => {
    if (!text || typeof text !== 'string') return;
    
    // Procurar por padrões de imagem em markdown: ![](filename.png)
    const markdownPattern = /!\[\]\(([^)]+)\)/g;
    let match;
    while ((match = markdownPattern.exec(text)) !== null) {
      const imagePath = match[1];
      // Extrair apenas o nome do arquivo
      const filename = imagePath.split('/').pop();
      if (filename) images.add(filename);
    }
    
    // Procurar por nomes de arquivo de imagem soltos
    const imageRegex = /\b[\w-]+\.(png|jpg|jpeg|gif|svg)\b/g;
    while ((match = imageRegex.exec(text)) !== null) {
      images.add(match[0]);
    }
  };
  
  // Procurar em questões
  if (data.questions) {
    // Verificar se questions é um objeto com anos como chaves
    if (typeof data.questions === 'object' && !Array.isArray(data.questions)) {
      Object.values(data.questions).forEach(yearQuestions => {
        if (Array.isArray(yearQuestions)) {
          yearQuestions.forEach(question => {
            // Procurar no contexto
            if (question.context) {
              findImagesInText(question.context);
            }
            
            // Procurar nos arquivos
            if (question.files && Array.isArray(question.files)) {
              question.files.forEach(file => {
                if (file) images.add(file);
              });
            }
            
            // Procurar nas alternativas
            if (question.alternatives && Array.isArray(question.alternatives)) {
              question.alternatives.forEach(alt => {
                if (alt.file) images.add(alt.file);
                if (alt.text) findImagesInText(alt.text);
              });
            }
            
            // Procurar na lição
            if (question.lesson) {
              findImagesInText(question.lesson);
            }
          });
        }
      });
    } else if (Array.isArray(data.questions)) {
      // Se questions é um array
      data.questions.forEach(question => {
        // Procurar no contexto
        if (question.context) {
          findImagesInText(question.context);
        }
        
        // Procurar nos arquivos
        if (question.files && Array.isArray(question.files)) {
          question.files.forEach(file => {
            if (file) images.add(file);
          });
        }
        
        // Procurar nas alternativas
        if (question.alternatives && Array.isArray(question.alternatives)) {
          question.alternatives.forEach(alt => {
            if (alt.file) images.add(alt.file);
            if (alt.text) findImagesInText(alt.text);
          });
        }
        
        // Procurar na lição
        if (question.lesson) {
          findImagesInText(question.lesson);
        }
      });
    }
  }
  
  return Array.from(images);
};

// Função para verificar se as imagens existem
const checkImagesExist = (images) => {
  const existingImages = [];
  const missingImages = [];
  
  images.forEach(image => {
    const imagePath = path.join(IMG_DIR, image);
    if (fs.existsSync(imagePath)) {
      existingImages.push(image);
    } else {
      missingImages.push(image);
    }
  });
  
  return { existingImages, missingImages };
};

// Função para gerar um arquivo de teste para verificar o acesso às imagens
const generateTestFile = (images) => {
  const testFilePath = path.join(ROOT_DIR, 'src', 'screens', 'ImageTestScreen.tsx');
  
  // Limitar a 20 imagens para não sobrecarregar o teste
  const testImages = images.slice(0, 20);
  
  const testFileContent = `
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';

const ImageTestScreen: React.FC = () => {
  const [imageResults, setImageResults] = useState<{[key: string]: boolean}>({});
  
  const testImages = [
    ${testImages.map(img => `"${img}"`).join(',\n    ')}
  ];
  
  const getImagePath = (filename: string): string => {
    if (Platform.OS === 'android') {
      return \`asset:/assets/img/\${filename}\`;
    } else if (Platform.OS === 'ios') {
      return \`\${FileSystem.bundleDirectory}assets/img/\${filename}\`;
    } else {
      return \`assets/img/\${filename}\`;
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
`;
  
  fs.writeFileSync(testFilePath, testFileContent);
  console.log(`Arquivo de teste gerado em: ${testFilePath}`);
  console.log('Adicione esta tela ao seu navegador para testar o acesso às imagens.');
};

// Função principal
const main = () => {
  console.log('Verificando acesso às imagens...');
  
  // Ler o arquivo de dados
  const data = readJsonFile(DATA_FILE);
  if (!data) {
    console.error('Não foi possível ler o arquivo de dados.');
    return;
  }
  
  // Encontrar imagens referenciadas
  const referencedImages = findReferencedImages(data);
  console.log(`Encontradas ${referencedImages.length} imagens referenciadas no arquivo de dados.`);
  
  // Verificar se as imagens existem
  const { existingImages, missingImages } = checkImagesExist(referencedImages);
  console.log(`${existingImages.length} imagens existem no diretório assets/img.`);
  
  if (missingImages.length > 0) {
    console.log(`\n⚠️ ${missingImages.length} imagens referenciadas não foram encontradas:`);
    missingImages.forEach(image => {
      console.log(`  - ${image}`);
    });
  } else {
    console.log('\n✅ Todas as imagens referenciadas foram encontradas!');
  }
  
  // Gerar arquivo de teste
  generateTestFile(existingImages);
  
  console.log('\nVerificação concluída!');
};

// Executar o script
main();
