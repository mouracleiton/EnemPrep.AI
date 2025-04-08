/**
 * Utilitário para depurar problemas de carregamento de imagens no React Native
 */
import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';

/**
 * Verifica se uma imagem existe no sistema de arquivos (apenas para iOS)
 * @param filename Nome do arquivo da imagem
 * @returns Promise com o resultado da verificação
 */
export const checkImageExists = async (filename: string): Promise<{exists: boolean, path: string}> => {
  if (Platform.OS !== 'ios') {
    return { exists: false, path: '' };
  }
  
  try {
    // Limpar o nome do arquivo (remover qualquer informação de caminho)
    const cleanFilename = filename.split('/').pop() || filename;
    
    // Construir o caminho completo
    const imagePath = `${FileSystem.bundleDirectory}assets/img/${cleanFilename}`;
    
    // Verificar se o arquivo existe
    const fileInfo = await FileSystem.getInfoAsync(imagePath);
    
    return {
      exists: fileInfo.exists,
      path: imagePath
    };
  } catch (e) {
    console.error(`Erro ao verificar existência da imagem: ${e}`);
    return { exists: false, path: '' };
  }
};

/**
 * Obtém informações sobre uma imagem (apenas para iOS)
 * @param filename Nome do arquivo da imagem
 * @returns Promise com informações sobre a imagem
 */
export const getImageInfo = async (filename: string): Promise<any> => {
  if (Platform.OS !== 'ios') {
    return null;
  }
  
  try {
    // Limpar o nome do arquivo (remover qualquer informação de caminho)
    const cleanFilename = filename.split('/').pop() || filename;
    
    // Construir o caminho completo
    const imagePath = `${FileSystem.bundleDirectory}assets/img/${cleanFilename}`;
    
    // Verificar se o arquivo existe
    const fileInfo = await FileSystem.getInfoAsync(imagePath);
    
    if (!fileInfo.exists) {
      return null;
    }
    
    return {
      ...fileInfo,
      filename: cleanFilename,
      path: imagePath
    };
  } catch (e) {
    console.error(`Erro ao obter informações da imagem: ${e}`);
    return null;
  }
};

/**
 * Obtém todos os caminhos possíveis para uma imagem
 * @param filename Nome do arquivo da imagem
 * @returns Array com todos os caminhos possíveis
 */
export const getAllPossiblePaths = (filename: string): string[] => {
  // Limpar o nome do arquivo (remover qualquer informação de caminho)
  const cleanFilename = filename.split('/').pop() || filename;
  
  const paths = [];
  
  if (Platform.OS === 'android') {
    // Caminhos para Android
    paths.push(
      `file:///android_asset/assets/img/${cleanFilename}`,
      `asset:/assets/img/${cleanFilename}`
    );
  } else if (Platform.OS === 'ios') {
    // Caminhos para iOS
    paths.push(
      `${FileSystem.bundleDirectory}assets/img/${cleanFilename}`,
      `${FileSystem.documentDirectory}assets/img/${cleanFilename}`
    );
  } else {
    // Caminhos para web
    paths.push(
      `assets/img/${cleanFilename}`
    );
  }
  
  return paths;
};

/**
 * Registra informações de debug sobre uma imagem
 * @param filename Nome do arquivo da imagem
 */
export const logImageDebugInfo = (filename: string): void => {
  // Limpar o nome do arquivo (remover qualquer informação de caminho)
  const cleanFilename = filename.split('/').pop() || filename;
  
  console.log('=== INFORMAÇÕES DE DEBUG DA IMAGEM ===');
  console.log(`Arquivo: ${cleanFilename}`);
  console.log(`Plataforma: ${Platform.OS}`);
  
  // Obter todos os caminhos possíveis
  const paths = getAllPossiblePaths(cleanFilename);
  console.log('Caminhos possíveis:');
  paths.forEach((path, index) => {
    console.log(`  ${index + 1}. ${path}`);
  });
  
  // Verificar se o arquivo existe (apenas para iOS)
  if (Platform.OS === 'ios') {
    checkImageExists(cleanFilename)
      .then(result => {
        console.log(`Arquivo existe: ${result.exists ? 'Sim' : 'Não'}`);
        console.log(`Caminho verificado: ${result.path}`);
      })
      .catch(e => {
        console.error(`Erro ao verificar existência: ${e}`);
      });
  }
  
  console.log('======================================');
};

export default {
  checkImageExists,
  getImageInfo,
  getAllPossiblePaths,
  logImageDebugInfo
};
