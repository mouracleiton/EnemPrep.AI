const fs = require('fs');
const path = require('path');

// Caminho para o arquivo JSON original
const inputFilePath = path.join(__dirname, 'assets', 'enem_data_with_lessons.json');
// Caminho para o arquivo JSON otimizado
const outputFilePath = path.join(__dirname, 'assets', 'enem_data_reduced.json');

// Número de questões a manter por ano
const QUESTIONS_PER_YEAR = 15;

// Função para truncar o texto da lição
function truncateLesson(lesson) {
  if (!lesson) return null;
  
  // Limitar a lição a aproximadamente 500 caracteres
  const maxLength = 500;
  if (lesson.length <= maxLength) return lesson;
  
  // Encontrar um ponto final próximo ao limite para fazer um corte mais natural
  const cutPoint = lesson.indexOf('.', maxLength - 100);
  if (cutPoint !== -1) {
    return lesson.substring(0, cutPoint + 1) + ' [...]';
  }
  
  return lesson.substring(0, maxLength) + ' [...]';
}

// Função principal para otimizar o JSON
async function optimizeJson() {
  try {
    console.log('Lendo arquivo JSON original...');
    const jsonData = JSON.parse(fs.readFileSync(inputFilePath, 'utf8'));
    
    // Criar estrutura otimizada
    const optimizedData = {
      exams: [],
      questions: {}
    };
    
    // Processar exames
    console.log('Processando exames...');
    optimizedData.exams = jsonData.exams.map(exam => ({
      title: exam.title,
      year: exam.year,
      disciplines: exam.disciplines,
      languages: exam.languages
    }));
    
    // Processar questões
    console.log('Processando questões...');
    Object.keys(jsonData.questions).forEach(year => {
      const yearQuestions = jsonData.questions[year];
      
      // Selecionar um subconjunto de questões
      const selectedQuestions = yearQuestions
        .sort(() => 0.5 - Math.random()) // Embaralhar questões
        .slice(0, QUESTIONS_PER_YEAR); // Pegar apenas o número desejado
      
      // Otimizar cada questão
      optimizedData.questions[year] = selectedQuestions.map(question => ({
        title: question.title,
        index: question.index,
        discipline: question.discipline,
        language: question.language,
        year: question.year,
        context: question.context,
        files: question.files || [],
        correctAlternative: question.correctAlternative,
        alternativesIntroduction: question.alternativesIntroduction,
        alternatives: question.alternatives,
        lesson: truncateLesson(question.lesson)
      }));
    });
    
    // Salvar arquivo otimizado
    console.log('Salvando arquivo JSON otimizado...');
    fs.writeFileSync(outputFilePath, JSON.stringify(optimizedData));
    
    // Calcular tamanhos
    const originalSize = fs.statSync(inputFilePath).size;
    const optimizedSize = fs.statSync(outputFilePath).size;
    const reductionPercent = ((originalSize - optimizedSize) / originalSize * 100).toFixed(2);
    
    console.log(`\nOtimização concluída!`);
    console.log(`Tamanho original: ${(originalSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`Tamanho otimizado: ${(optimizedSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`Redução: ${reductionPercent}%`);
    
  } catch (error) {
    console.error('Erro ao otimizar JSON:', error);
  }
}

// Executar função principal
optimizeJson();
