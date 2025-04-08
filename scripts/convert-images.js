/**
 * Script para converter imagens para formatos compatíveis com o React Native
 * 
 * Este script:
 * 1. Converte imagens em formatos não suportados para PNG
 * 2. Redimensiona imagens muito grandes
 * 3. Otimiza imagens para melhor desempenho
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Diretórios base
const ROOT_DIR = path.join(__dirname, '..');
const ASSETS_DIR = path.join(ROOT_DIR, 'assets');
const IMG_DIR = path.join(ASSETS_DIR, 'img');

// Função para verificar se o comando convert está disponível
const checkConvertCommand = () => {
  try {
    execSync('convert -version', { stdio: 'ignore' });
    return true;
  } catch (e) {
    console.error('O comando "convert" do ImageMagick não está disponível.');
    console.error('Por favor, instale o ImageMagick para converter as imagens:');
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

// Função para converter uma imagem para PNG
const convertToPNG = (imagePath) => {
  try {
    const dir = path.dirname(imagePath);
    const basename = path.basename(imagePath, path.extname(imagePath));
    const outputPath = path.join(dir, `${basename}.png`);
    
    console.log(`Convertendo ${path.basename(imagePath)} para PNG...`);
    execSync(`convert "${imagePath}" "${outputPath}"`, { stdio: 'ignore' });
    
    // Verificar se a conversão foi bem-sucedida
    if (fs.existsSync(outputPath)) {
      console.log(`✅ Conversão bem-sucedida: ${outputPath}`);
      return outputPath;
    } else {
      console.error(`❌ Falha na conversão: ${outputPath}`);
      return null;
    }
  } catch (e) {
    console.error(`❌ Erro ao converter ${imagePath}: ${e.message}`);
    return null;
  }
};

// Função para redimensionar uma imagem
const resizeImage = (imagePath, maxDimension = 1200) => {
  try {
    const imageInfo = checkImageFormat(imagePath);
    
    // Se a imagem já é menor que a dimensão máxima, não precisa redimensionar
    if (imageInfo.width <= maxDimension && imageInfo.height <= maxDimension) {
      return imagePath;
    }
    
    const dir = path.dirname(imagePath);
    const basename = path.basename(imagePath, path.extname(imagePath));
    const ext = path.extname(imagePath);
    const outputPath = path.join(dir, `${basename}_resized${ext}`);
    
    console.log(`Redimensionando ${path.basename(imagePath)} para máximo de ${maxDimension}px...`);
    execSync(`convert "${imagePath}" -resize ${maxDimension}x${maxDimension}\\> "${outputPath}"`, { stdio: 'ignore' });
    
    // Verificar se o redimensionamento foi bem-sucedido
    if (fs.existsSync(outputPath)) {
      console.log(`✅ Redimensionamento bem-sucedido: ${outputPath}`);
      return outputPath;
    } else {
      console.error(`❌ Falha no redimensionamento: ${outputPath}`);
      return imagePath;
    }
  } catch (e) {
    console.error(`❌ Erro ao redimensionar ${imagePath}: ${e.message}`);
    return imagePath;
  }
};

// Função para otimizar uma imagem PNG
const optimizePNG = (imagePath) => {
  try {
    // Verificar se o arquivo é um PNG
    if (path.extname(imagePath).toLowerCase() !== '.png') {
      return imagePath;
    }
    
    const dir = path.dirname(imagePath);
    const basename = path.basename(imagePath, '.png');
    const outputPath = path.join(dir, `${basename}_optimized.png`);
    
    console.log(`Otimizando ${path.basename(imagePath)}...`);
    execSync(`convert "${imagePath}" -strip -define png:compression-level=9 "${outputPath}"`, { stdio: 'ignore' });
    
    // Verificar se a otimização foi bem-sucedida
    if (fs.existsSync(outputPath)) {
      // Verificar se o arquivo otimizado é menor
      const originalSize = fs.statSync(imagePath).size;
      const optimizedSize = fs.statSync(outputPath).size;
      
      if (optimizedSize < originalSize) {
        console.log(`✅ Otimização bem-sucedida: ${outputPath} (${Math.round((1 - optimizedSize / originalSize) * 100)}% menor)`);
        return outputPath;
      } else {
        console.log(`ℹ️ Otimização não reduziu o tamanho: ${path.basename(imagePath)}`);
        fs.unlinkSync(outputPath); // Remover arquivo otimizado se não for menor
        return imagePath;
      }
    } else {
      console.error(`❌ Falha na otimização: ${outputPath}`);
      return imagePath;
    }
  } catch (e) {
    console.error(`❌ Erro ao otimizar ${imagePath}: ${e.message}`);
    return imagePath;
  }
};

// Função para processar todas as imagens no diretório
const processAllImages = () => {
  // Verificar se o comando convert está disponível
  if (!checkConvertCommand()) {
    return;
  }
  
  console.log('Processando imagens...');
  
  // Obter lista de arquivos de imagem
  const imageFiles = [];
  const walkDir = (dir) => {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      
      if (fs.statSync(filePath).isDirectory()) {
        walkDir(filePath);
      } else if (/\.(png|jpg|jpeg|gif|bmp|webp|tiff|tif|psd|svg|eps|pdf)$/i.test(file)) {
        imageFiles.push(filePath);
      }
    });
  };
  
  walkDir(IMG_DIR);
  console.log(`Encontradas ${imageFiles.length} imagens para processar.`);
  
  // Processar cada imagem
  const results = {
    converted: [],
    resized: [],
    optimized: [],
    failed: []
  };
  
  imageFiles.forEach(imagePath => {
    try {
      const imageInfo = checkImageFormat(imagePath);
      const relativePath = path.relative(ROOT_DIR, imagePath);
      
      if (!imageInfo.valid) {
        console.error(`❌ Imagem inválida: ${relativePath}`);
        results.failed.push(relativePath);
        return;
      }
      
      // Verificar se o formato é suportado pelo React Native
      const supportedFormats = ['PNG', 'JPEG', 'JPG', 'GIF', 'BMP', 'WEBP'];
      if (!supportedFormats.includes(imageInfo.format.toUpperCase())) {
        console.log(`Formato não suportado: ${imageInfo.format} - ${relativePath}`);
        
        // Converter para PNG
        const convertedPath = convertToPNG(imagePath);
        if (convertedPath) {
          results.converted.push({
            original: relativePath,
            converted: path.relative(ROOT_DIR, convertedPath)
          });
          
          // Continuar o processamento com a imagem convertida
          imagePath = convertedPath;
        } else {
          results.failed.push(relativePath);
          return;
        }
      }
      
      // Verificar se a imagem é muito grande
      if (imageInfo.width > 1200 || imageInfo.height > 1200) {
        console.log(`Imagem muito grande: ${imageInfo.width}x${imageInfo.height} - ${relativePath}`);
        
        // Redimensionar a imagem
        const resizedPath = resizeImage(imagePath);
        if (resizedPath !== imagePath) {
          results.resized.push({
            original: relativePath,
            resized: path.relative(ROOT_DIR, resizedPath)
          });
          
          // Continuar o processamento com a imagem redimensionada
          imagePath = resizedPath;
        }
      }
      
      // Otimizar imagens PNG
      if (path.extname(imagePath).toLowerCase() === '.png') {
        const optimizedPath = optimizePNG(imagePath);
        if (optimizedPath !== imagePath) {
          results.optimized.push({
            original: relativePath,
            optimized: path.relative(ROOT_DIR, optimizedPath)
          });
        }
      }
    } catch (e) {
      console.error(`❌ Erro ao processar ${imagePath}: ${e.message}`);
      results.failed.push(path.relative(ROOT_DIR, imagePath));
    }
  });
  
  // Exibir resultados
  console.log('\nResultados:');
  console.log(`✅ ${results.converted.length} imagens convertidas para PNG`);
  console.log(`✅ ${results.resized.length} imagens redimensionadas`);
  console.log(`✅ ${results.optimized.length} imagens PNG otimizadas`);
  console.log(`❌ ${results.failed.length} imagens com falha no processamento`);
  
  console.log('\nProcessamento concluído!');
};

// Executar o script
processAllImages();
