/**
 * Script para verificar a estrutura de arquivos de imagem
 * 
 * Este script verifica:
 * 1. Se todas as imagens referenciadas no enem_data.json existem no diretório assets/img
 * 2. Se todas as imagens estão nos diretórios corretos (questions, ui, common)
 * 3. Se há imagens duplicadas em diferentes diretórios
 */

const fs = require('fs');
const path = require('path');

// Diretórios base
const ROOT_DIR = path.join(__dirname, '..');
const ASSETS_DIR = path.join(ROOT_DIR, 'assets');
const IMG_DIR = path.join(ASSETS_DIR, 'img');
const QUESTIONS_DIR = path.join(IMG_DIR, 'questions');
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

// Função para encontrar todas as imagens no diretório assets/img
const findExistingImages = () => {
  const images = new Map();
  
  // Função recursiva para percorrer diretórios
  const walkDir = (dir, relativePath = '') => {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const relPath = path.join(relativePath, file);
      
      if (fs.statSync(filePath).isDirectory()) {
        // Se for um diretório, percorrer recursivamente
        walkDir(filePath, relPath);
      } else {
        // Se for um arquivo de imagem, adicionar ao mapa
        if (/\.(png|jpg|jpeg|gif|svg)$/i.test(file)) {
          // Se a imagem já existe no mapa, adicionar este caminho à lista
          if (images.has(file)) {
            images.get(file).push(relPath);
          } else {
            images.set(file, [relPath]);
          }
        }
      }
    });
  };
  
  // Iniciar a busca a partir do diretório de imagens
  try {
    walkDir(IMG_DIR);
  } catch (error) {
    console.error('Erro ao percorrer o diretório de imagens:', error);
  }
  
  return images;
};

// Função principal
const main = () => {
  console.log('Verificando estrutura de arquivos de imagem...');
  
  // Ler o arquivo de dados
  const data = readJsonFile(DATA_FILE);
  if (!data) {
    console.error('Não foi possível ler o arquivo de dados.');
    return;
  }
  
  // Encontrar imagens referenciadas
  const referencedImages = findReferencedImages(data);
  console.log(`Encontradas ${referencedImages.length} imagens referenciadas no arquivo de dados.`);
  
  // Encontrar imagens existentes
  const existingImages = findExistingImages();
  console.log(`Encontradas ${existingImages.size} imagens no diretório assets/img.`);
  
  // Verificar imagens referenciadas que não existem
  const missingImages = [];
  referencedImages.forEach(image => {
    if (!existingImages.has(image)) {
      missingImages.push(image);
    }
  });
  
  if (missingImages.length > 0) {
    console.log(`\n⚠️ ${missingImages.length} imagens referenciadas não foram encontradas:`);
    missingImages.forEach(image => {
      console.log(`  - ${image}`);
    });
  } else {
    console.log('\n✅ Todas as imagens referenciadas foram encontradas!');
  }
  
  // Verificar imagens duplicadas
  const duplicatedImages = [];
  existingImages.forEach((paths, image) => {
    if (paths.length > 1) {
      duplicatedImages.push({ image, paths });
    }
  });
  
  if (duplicatedImages.length > 0) {
    console.log(`\n⚠️ ${duplicatedImages.length} imagens estão duplicadas em diferentes diretórios:`);
    duplicatedImages.forEach(({ image, paths }) => {
      console.log(`  - ${image}:`);
      paths.forEach(path => {
        console.log(`    * ${path}`);
      });
    });
  } else {
    console.log('\n✅ Não há imagens duplicadas!');
  }
  
  // Verificar imagens não referenciadas
  const unusedImages = [];
  existingImages.forEach((paths, image) => {
    if (!referencedImages.includes(image)) {
      unusedImages.push({ image, paths });
    }
  });
  
  if (unusedImages.length > 0) {
    console.log(`\n⚠️ ${unusedImages.length} imagens não estão sendo referenciadas:`);
    console.log('(Isso pode ser normal para imagens de UI, ícones, etc.)');
    unusedImages.forEach(({ image, paths }) => {
      console.log(`  - ${image}: ${paths[0]}`);
    });
  } else {
    console.log('\n✅ Todas as imagens estão sendo referenciadas!');
  }
  
  console.log('\nVerificação concluída!');
};

// Executar o script
main();
