const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Cores para console
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

// Verificar ferramentas necessárias
const checkTools = () => {
  console.log(`${colors.blue}Verificando ferramentas necessárias...${colors.reset}`);

  let missingTools = 0;
  let availableTools = [];

  // Verificar pngquant
  try {
    execSync('which pngquant', { stdio: 'ignore' });
    console.log(`${colors.green}✓ pngquant está instalado${colors.reset}`);
    availableTools.push('pngquant');
  } catch (error) {
    console.log(`${colors.yellow}✗ pngquant não encontrado${colors.reset}`);
    missingTools++;
  }

  // Verificar jpegoptim
  try {
    execSync('which jpegoptim', { stdio: 'ignore' });
    console.log(`${colors.green}✓ jpegoptim está instalado${colors.reset}`);
    availableTools.push('jpegoptim');
  } catch (error) {
    console.log(`${colors.yellow}✗ jpegoptim não encontrado${colors.reset}`);
    missingTools++;
  }

  // Verificar cwebp
  try {
    execSync('which cwebp', { stdio: 'ignore' });
    console.log(`${colors.green}✓ cwebp está instalado${colors.reset}`);
    availableTools.push('cwebp');
  } catch (error) {
    console.log(`${colors.yellow}✗ cwebp não encontrado${colors.reset}`);
  }

  if (missingTools === 2) {
    console.error(`${colors.red}Nenhuma ferramenta de otimização de imagem encontrada.${colors.reset}`);
    console.error('Por favor, instale pelo menos uma das seguintes ferramentas:');
    console.error('  - pngquant: para otimizar PNGs');
    console.error('  - jpegoptim: para otimizar JPEGs');
    console.error('');
    console.error('No Arch Linux, você pode instalar com:');
    console.error('  sudo pacman -S pngquant jpegoptim');
    process.exit(1);
  }

  return availableTools;
};

// Verificar ferramentas disponíveis
const availableTools = checkTools();

// Diretórios
const imgDir = path.join(__dirname, '../assets/img');
const backupDir = path.join(__dirname, '../assets/img_backup');
const optimizedDir = path.join(__dirname, '../assets/img-optimized');

// Função para formatar bytes
const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

// Função para criar backup
const createBackup = () => {
  console.log(`${colors.blue}Criando backup das imagens originais...${colors.reset}`);

  // Verificar se o diretório de backup já existe
  if (fs.existsSync(backupDir)) {
    console.log(`${colors.yellow}Diretório de backup já existe. Será sobrescrito.${colors.reset}`);
    fs.rmSync(backupDir, { recursive: true, force: true });
  }

  // Criar diretório de backup
  fs.mkdirSync(backupDir, { recursive: true });

  // Copiar todas as imagens para o backup
  const copyRecursive = (src, dest) => {
    const exists = fs.existsSync(src);
    if (exists) {
      const stats = fs.statSync(src);
      if (stats.isDirectory()) {
        if (!fs.existsSync(dest)) {
          fs.mkdirSync(dest, { recursive: true });
        }
        fs.readdirSync(src).forEach(childItemName => {
          copyRecursive(path.join(src, childItemName), path.join(dest, childItemName));
        });
      } else {
        fs.copyFileSync(src, dest);
      }
    }
  };

  copyRecursive(imgDir, backupDir);

  console.log(`${colors.green}Backup criado em ${backupDir}${colors.reset}`);
};

// Criar diretório otimizado se não existir
if (!fs.existsSync(optimizedDir)) {
  fs.mkdirSync(optimizedDir, { recursive: true });
}

// Criar backup antes de otimizar
createBackup();

// Encontrar todas as imagens recursivamente
const findImages = (dir, extensions) => {
  let results = [];
  const list = fs.readdirSync(dir);

  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat && stat.isDirectory()) {
      // Recursivamente procurar em subdiretórios
      results = results.concat(findImages(filePath, extensions));
    } else {
      // Verificar extensão
      const ext = path.extname(file).toLowerCase();
      if (extensions.includes(ext)) {
        results.push(filePath);
      }
    }
  });

  return results;
};

// Encontrar imagens PNG e JPG
const pngFiles = findImages(imgDir, ['.png']);
const jpgFiles = findImages(imgDir, ['.jpg', '.jpeg']);

console.log(`${colors.blue}Encontradas ${pngFiles.length} imagens PNG e ${jpgFiles.length} imagens JPG/JPEG para otimizar.${colors.reset}`);

// Estatísticas
let stats = {
  png: { count: pngFiles.length, originalSize: 0, optimizedSize: 0 },
  jpg: { count: jpgFiles.length, originalSize: 0, optimizedSize: 0 },
  errors: 0
};

// Otimizar imagens PNG
if (pngFiles.length > 0 && availableTools.includes('pngquant')) {
  console.log(`${colors.blue}\nOtimizando imagens PNG...${colors.reset}`);

  pngFiles.forEach((filePath, index) => {
    const relativePath = path.relative(imgDir, filePath);
    const outputPath = path.join(optimizedDir, relativePath);

    // Criar diretório de saída se não existir
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Obter tamanho original
    const originalSize = fs.statSync(filePath).size;
    stats.png.originalSize += originalSize;

    // Otimizar a imagem
    try {
      execSync(`pngquant --quality=65-80 --speed 1 --force --strip --output "${outputPath}" "${filePath}"`);

      // Obter tamanho otimizado
      const optimizedSize = fs.statSync(outputPath).size;
      stats.png.optimizedSize += optimizedSize;

      const savingsPercent = ((originalSize - optimizedSize) / originalSize * 100).toFixed(2);
      console.log(`${colors.green}[${index + 1}/${pngFiles.length}]${colors.reset} ${relativePath}: ${formatBytes(originalSize)} -> ${formatBytes(optimizedSize)} (${savingsPercent}% redução)`);
    } catch (error) {
      console.error(`${colors.red}Erro ao otimizar ${relativePath}:${colors.reset}`, error.message);
      stats.errors++;

      // Copiar o arquivo original para o diretório de saída
      fs.copyFileSync(filePath, outputPath);
      stats.png.optimizedSize += originalSize;
    }
  });
} else if (pngFiles.length > 0) {
  console.log(`${colors.yellow}\nPulando otimização de PNG: pngquant não está instalado.${colors.reset}`);
}

// Otimizar imagens JPG
if (jpgFiles.length > 0 && availableTools.includes('jpegoptim')) {
  console.log(`${colors.blue}\nOtimizando imagens JPG/JPEG...${colors.reset}`);

  jpgFiles.forEach((filePath, index) => {
    const relativePath = path.relative(imgDir, filePath);
    const outputPath = path.join(optimizedDir, relativePath);

    // Criar diretório de saída se não existir
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Obter tamanho original
    const originalSize = fs.statSync(filePath).size;
    stats.jpg.originalSize += originalSize;

    // Copiar o arquivo para o diretório de saída primeiro
    fs.copyFileSync(filePath, outputPath);

    // Otimizar a imagem no local
    try {
      execSync(`jpegoptim --strip-all --max=85 "${outputPath}"`);

      // Obter tamanho otimizado
      const optimizedSize = fs.statSync(outputPath).size;
      stats.jpg.optimizedSize += optimizedSize;

      const savingsPercent = ((originalSize - optimizedSize) / originalSize * 100).toFixed(2);
      console.log(`${colors.green}[${index + 1}/${jpgFiles.length}]${colors.reset} ${relativePath}: ${formatBytes(originalSize)} -> ${formatBytes(optimizedSize)} (${savingsPercent}% redução)`);
    } catch (error) {
      console.error(`${colors.red}Erro ao otimizar ${relativePath}:${colors.reset}`, error.message);
      stats.errors++;
      stats.jpg.optimizedSize += originalSize;
    }
  });
} else if (jpgFiles.length > 0) {
  console.log(`${colors.yellow}\nPulando otimização de JPG: jpegoptim não está instalado.${colors.reset}`);
}

// Calcular estatísticas totais
const totalOriginalSize = stats.png.originalSize + stats.jpg.originalSize;
const totalOptimizedSize = stats.png.optimizedSize + stats.jpg.optimizedSize;
const totalSavingsPercent = totalOriginalSize > 0 ? ((totalOriginalSize - totalOptimizedSize) / totalOriginalSize * 100).toFixed(2) : 0;

// Mostrar estatísticas
console.log(`\n${colors.blue}=== Estatísticas de Otimização ===${colors.reset}`);

if (stats.png.count > 0) {
  const pngSavingsPercent = stats.png.originalSize > 0 ? ((stats.png.originalSize - stats.png.optimizedSize) / stats.png.originalSize * 100).toFixed(2) : 0;
  console.log(`${colors.yellow}PNG:${colors.reset} ${stats.png.count} imagens, ${formatBytes(stats.png.originalSize)} -> ${formatBytes(stats.png.optimizedSize)} (${pngSavingsPercent}% redução)`);
}

if (stats.jpg.count > 0) {
  const jpgSavingsPercent = stats.jpg.originalSize > 0 ? ((stats.jpg.originalSize - stats.jpg.optimizedSize) / stats.jpg.originalSize * 100).toFixed(2) : 0;
  console.log(`${colors.yellow}JPG:${colors.reset} ${stats.jpg.count} imagens, ${formatBytes(stats.jpg.originalSize)} -> ${formatBytes(stats.jpg.optimizedSize)} (${jpgSavingsPercent}% redução)`);
}

console.log(`${colors.green}Total:${colors.reset} ${pngFiles.length + jpgFiles.length} imagens, ${formatBytes(totalOriginalSize)} -> ${formatBytes(totalOptimizedSize)} (${totalSavingsPercent}% redução)`);
console.log(`Erros: ${stats.errors}`);

console.log(`\n${colors.green}Imagens otimizadas salvas em: ${optimizedDir}${colors.reset}`);
console.log(`${colors.green}Backup das imagens originais salvo em: ${backupDir}${colors.reset}`);

// Criar um script para substituir as imagens originais pelas otimizadas
console.log(`\n${colors.blue}Para substituir as imagens originais pelas otimizadas, execute:${colors.reset}`);
console.log(`cp -r ${optimizedDir}/* ${imgDir}/`);
