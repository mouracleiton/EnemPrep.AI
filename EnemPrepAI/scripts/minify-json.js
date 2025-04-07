const fs = require('fs');
const path = require('path');

// Caminho para o arquivo JSON grande
const jsonFilePath = path.join(__dirname, '../assets/enem_data_with_lessons.json');
const outputFilePath = path.join(__dirname, '../assets/enem_data_with_lessons.min.json');

console.log(`Lendo arquivo: ${jsonFilePath}`);
const jsonData = fs.readFileSync(jsonFilePath, 'utf8');
console.log(`Tamanho original: ${(jsonData.length / 1024 / 1024).toFixed(2)} MB`);

// Parsear o JSON
const data = JSON.parse(jsonData);

// Minimizar o JSON (remover espaços em branco)
const minifiedJson = JSON.stringify(data);
console.log(`Tamanho após minimização: ${(minifiedJson.length / 1024 / 1024).toFixed(2)} MB`);

// Salvar o JSON minimizado
fs.writeFileSync(outputFilePath, minifiedJson);
console.log(`Arquivo minimizado salvo em: ${outputFilePath}`);

// Criar uma versão reduzida com apenas os dados essenciais
// Aqui você pode personalizar quais dados manter
const reducedData = {
  exams: data.exams.map(exam => ({
    title: exam.title,
    year: exam.year,
    disciplines: exam.disciplines,
    // Manter apenas os primeiros 10 questions de cada disciplina para teste
    questions: exam.questions ? exam.questions.slice(0, 10) : []
  }))
};

const reducedJson = JSON.stringify(reducedData);
const reducedFilePath = path.join(__dirname, '../assets/enem_data_reduced.json');
fs.writeFileSync(reducedFilePath, reducedJson);
console.log(`Versão reduzida salva em: ${reducedFilePath}`);
console.log(`Tamanho da versão reduzida: ${(reducedJson.length / 1024 / 1024).toFixed(2)} MB`);
