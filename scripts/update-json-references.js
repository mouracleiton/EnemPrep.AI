const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Função para encontrar todos os arquivos JS e JSX no projeto
function findJSFiles() {
  return new Promise((resolve, reject) => {
    glob('**/*.{js,jsx}', {
      ignore: ['node_modules/**', 'scripts/**', 'android/**', 'ios/**', 'build/**', 'dist/**'],
      cwd: path.resolve(__dirname, '..')
    }, (err, files) => {
      if (err) {
        reject(err);
      } else {
        resolve(files);
      }
    });
  });
}

// Função para atualizar as referências ao arquivo JSON
async function updateJSONReferences() {
  try {
    const files = await findJSFiles();
    console.log(`Encontrados ${files.length} arquivos JS/JSX para verificar.`);
    
    let updatedFiles = 0;
    
    for (const file of files) {
      const filePath = path.resolve(__dirname, '..', file);
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Verifica se o arquivo contém referências ao arquivo JSON original
      if (content.includes('enem_data_with_lessons.json')) {
        // Substitui as referências pelo arquivo reduzido
        const updatedContent = content.replace(/enem_data_with_lessons\.json/g, 'enem_data_reduced.json');
        
        // Salva o arquivo atualizado
        fs.writeFileSync(filePath, updatedContent);
        
        console.log(`Atualizado: ${file}`);
        updatedFiles++;
      }
    }
    
    console.log(`\nTotal de arquivos atualizados: ${updatedFiles}`);
    
  } catch (error) {
    console.error('Erro ao atualizar referências:', error);
  }
}

// Executa a função principal
updateJSONReferences();
