/**
 * Script para verificar se as imagens estão no formato correto para o React Native
 * 
 * Este script verifica:
 * 1. Se todas as imagens no diretório assets/img estão em formatos suportados pelo React Native
 * 2. Se há imagens com problemas de formato ou corrupção
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Diretórios base
const ROOT_DIR = path.join(__dirname, '..');
const ASSETS_DIR = path.join(ROOT_DIR, 'assets');
const IMG_DIR = path.join(ASSETS_DIR, 'img');

// Função para verificar se o comando identify está disponível
const checkIdentifyCommand = () => {
  try {
    execSync('identify -version', { stdio: 'ignore' });
    return true;
  } catch (e) {
    console.error('O comando "identify" do ImageMagick não está disponível.');
    console.error('Por favor, instale o ImageMagick para verificar os formatos de imagem:');
    console.error('  - Ubuntu/Debian: sudo apt-get install imagemagick');
    console.error('  - macOS: brew install imagemagick');
    console.error('  - Windows: https://imagemagick.org/script/download.php');
    return false;
  }
};

// Função para verificar o formato de uma imagem
const checkImageFormat = (imagePath) => {
  try {
    const output = execSync(`identify -format "%m %w %h %z" "${imagePath}"`, { encoding: 'utf8' });
    const [format, width, height, depth] = output.trim().split(' ');
    
    return {
      format,
      width: parseInt(width),
      height: parseInt(height),
      depth: parseInt(depth),
      valid: true
    };
  } catch (e) {
    return {
      format: 'UNKNOWN',
      width: 0,
      height: 0,
      depth: 0,
      valid: false,
      error: e.message
    };
  }
};

// Função para verificar todas as imagens no diretório
const checkAllImages = () => {
  // Verificar se o comando identify está disponível
  if (!checkIdentifyCommand()) {
    return;
  }
  
  console.log('Verificando formatos de imagem...');
  
  // Obter lista de arquivos de imagem
  const imageFiles = [];
  const walkDir = (dir) => {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      
      if (fs.statSync(filePath).isDirectory()) {
        walkDir(filePath);
      } else if (/\.(png|jpg|jpeg|gif|bmp|webp)$/i.test(file)) {
        imageFiles.push(filePath);
      }
    });
  };
  
  walkDir(IMG_DIR);
  console.log(`Encontradas ${imageFiles.length} imagens para verificar.`);
  
  // Verificar cada imagem
  const results = {
    valid: [],
    invalid: [],
    byFormat: {}
  };
  
  imageFiles.forEach(imagePath => {
    const result = checkImageFormat(imagePath);
    const relativePath = path.relative(ROOT_DIR, imagePath);
    
    if (result.valid) {
      results.valid.push({
        path: relativePath,
        ...result
      });
      
      // Agrupar por formato
      if (!results.byFormat[result.format]) {
        results.byFormat[result.format] = [];
      }
      results.byFormat[result.format].push(relativePath);
    } else {
      results.invalid.push({
        path: relativePath,
        ...result
      });
    }
  });
  
  // Exibir resultados
  console.log(`\n✅ ${results.valid.length} imagens válidas`);
  console.log(`❌ ${results.invalid.length} imagens inválidas ou com problemas`);
  
  // Exibir formatos
  console.log('\nFormatos encontrados:');
  Object.keys(results.byFormat).forEach(format => {
    console.log(`  - ${format}: ${results.byFormat[format].length} imagens`);
  });
  
  // Exibir imagens inválidas
  if (results.invalid.length > 0) {
    console.log('\nImagens com problemas:');
    results.invalid.forEach(img => {
      console.log(`  - ${img.path}: ${img.error}`);
    });
  }
  
  // Verificar formatos não suportados pelo React Native
  const unsupportedFormats = Object.keys(results.byFormat).filter(format => 
    !['PNG', 'JPEG', 'JPG', 'GIF', 'BMP', 'WEBP'].includes(format.toUpperCase())
  );
  
  if (unsupportedFormats.length > 0) {
    console.log('\n⚠️ Formatos não suportados pelo React Native:');
    unsupportedFormats.forEach(format => {
      console.log(`  - ${format}: ${results.byFormat[format].length} imagens`);
      // Listar as primeiras 5 imagens de cada formato não suportado
      results.byFormat[format].slice(0, 5).forEach(img => {
        console.log(`    * ${img}`);
      });
      if (results.byFormat[format].length > 5) {
        console.log(`    * ... e mais ${results.byFormat[format].length - 5} imagens`);
      }
    });
    
    console.log('\nRecomendação: Converta estas imagens para PNG ou JPEG para melhor compatibilidade.');
  }
  
  // Verificar imagens muito grandes
  const largeImages = results.valid.filter(img => img.width > 2000 || img.height > 2000);
  if (largeImages.length > 0) {
    console.log('\n⚠️ Imagens muito grandes (> 2000px):');
    largeImages.slice(0, 10).forEach(img => {
      console.log(`  - ${img.path}: ${img.width}x${img.height}`);
    });
    if (largeImages.length > 10) {
      console.log(`  - ... e mais ${largeImages.length - 10} imagens`);
    }
    
    console.log('\nRecomendação: Redimensione estas imagens para economizar memória e melhorar o desempenho.');
  }
  
  console.log('\nVerificação concluída!');
};

// Executar o script
checkAllImages();
