const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Verificar se o pngquant está instalado
try {
  execSync('which pngquant');
  console.log('pngquant está instalado, prosseguindo com a otimização...');
} catch (error) {
  console.error('pngquant não está instalado. Por favor, instale-o primeiro:');
  console.error('sudo apt-get install pngquant');
  process.exit(1);
}

// Diretório de imagens
const imgDir = path.join(__dirname, '../assets/img');
const optimizedDir = path.join(__dirname, '../assets/img-optimized');

// Criar diretório otimizado se não existir
if (!fs.existsSync(optimizedDir)) {
  fs.mkdirSync(optimizedDir, { recursive: true });
}

// Obter todas as imagens PNG
const pngFiles = fs.readdirSync(imgDir)
  .filter(file => file.toLowerCase().endsWith('.png'));

console.log(`Encontradas ${pngFiles.length} imagens PNG para otimizar.`);

// Otimizar cada imagem
let totalOriginalSize = 0;
let totalOptimizedSize = 0;

pngFiles.forEach(file => {
  const inputPath = path.join(imgDir, file);
  const outputPath = path.join(optimizedDir, file);
  
  // Obter tamanho original
  const originalSize = fs.statSync(inputPath).size;
  totalOriginalSize += originalSize;
  
  // Otimizar a imagem
  try {
    execSync(`pngquant --quality=65-80 --speed 1 --force --strip --output "${outputPath}" "${inputPath}"`);
    
    // Obter tamanho otimizado
    const optimizedSize = fs.statSync(outputPath).size;
    totalOptimizedSize += optimizedSize;
    
    const savingsPercent = ((originalSize - optimizedSize) / originalSize * 100).toFixed(2);
    console.log(`${file}: ${(originalSize/1024).toFixed(2)} KB -> ${(optimizedSize/1024).toFixed(2)} KB (${savingsPercent}% redução)`);
  } catch (error) {
    console.error(`Erro ao otimizar ${file}:`, error.message);
  }
});

// Mostrar estatísticas
const totalSavingsPercent = ((totalOriginalSize - totalOptimizedSize) / totalOriginalSize * 100).toFixed(2);
console.log(`\nTotal: ${(totalOriginalSize/1024/1024).toFixed(2)} MB -> ${(totalOptimizedSize/1024/1024).toFixed(2)} MB (${totalSavingsPercent}% redução)`);
console.log(`Imagens otimizadas salvas em: ${optimizedDir}`);

// Criar um script para substituir as imagens originais pelas otimizadas
console.log('\nPara substituir as imagens originais pelas otimizadas, execute:');
console.log('cp -r assets/img-optimized/* assets/img/');
