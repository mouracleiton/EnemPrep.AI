// We'll load the data from local assets instead of downloading it
// Create a mock data structure to use when the JSON file is not available
const mockEnemData = {
  "exams": [
    {
      "title": "ENEM 2023",
      "year": 2023,
      "disciplines": [
        {
          "label": "Ciências Humanas e suas Tecnologias",
          "value": "ciencias-humanas"
        },
        {
          "label": "Ciências da Natureza e suas Tecnologias",
          "value": "ciencias-natureza"
        },
        {
          "label": "Linguagens, Códigos e suas Tecnologias",
          "value": "linguagens"
        },
        {
          "label": "Matemática e suas Tecnologias",
          "value": "matematica"
        }
      ],
      "languages": [
        {
          "label": "Inglês",
          "value": "ingles"
        },
        {
          "label": "Espanhol",
          "value": "espanhol"
        }
      ]
    }
  ],
  "questions": [
    {
      "title": "Questão 1",
      "index": 1,
      "discipline": "ciencias-humanas",
      "language": null,
      "year": 2023,
      "context": "Considere a seguinte situação-problema...",
      "files": [],
      "correctAlternative": "A",
      "alternativesIntroduction": "Assinale a alternativa correta:",
      "alternatives": [
        {
          "letter": "A",
          "text": "Alternativa correta",
          "file": null,
          "isCorrect": true
        },
        {
          "letter": "B",
          "text": "Alternativa incorreta 1",
          "file": null,
          "isCorrect": false
        }
      ],
      "lesson": "Lição sobre o tema da questão 1"
    }
  ]
};

// Try to import the JSON file, but use mock data if it fails
let enemData;
try {
  enemData = require('../../assets/enem_data.json');
} catch (e) {
  console.warn('Failed to load JSON file, using mock data');
  enemData = mockEnemData;
}
import imageUtils from '../utils/imageUtils';
import * as FileSystem from 'expo-file-system';

export interface Exam {
  title: string;
  year: number;
  disciplines: Discipline[];
  languages: Language[];
}

export interface Discipline {
  label: string;
  value: string;
}

export interface Language {
  label: string;
  value: string;
}

export interface Alternative {
  letter: string;
  text: string;
  file: string | null;
  isCorrect: boolean;
}

export interface Question {
  title: string;
  index: number;
  discipline: string;
  language: string | null;
  year: number;
  context: string;
  files: string[];
  correctAlternative: string;
  alternativesIntroduction: string;
  alternatives: Alternative[];
  lesson?: string;
}

export interface UserAnswer {
  questionId: string;
  selectedAlternative: string;
  isCorrect: boolean;
  timestamp: number;
  viewedLesson?: boolean;
  studySession?: string;
}

export interface StudySession {
  id: string;
  timestamp: number;
  disciplines: string[];
  questionCount: number;
  questionsAnswered: number;
  correctAnswers: number;
  lessonsViewed: number;
}

class DataService {
  private data: any = null;
  private userAnswers: UserAnswer[] = [];
  private studySessions: StudySession[] = [];
  private isLoading: boolean = false;
  private onDataLoadedCallbacks: (() => void)[] = [];
  private onLoadingStatusCallbacks: ((status: string) => void)[] = [];

  constructor() {
    this.loadUserAnswers();
    this.loadStudySessions();
    this.loadLocalData();
  }

  /**
   * Load the ENEM data from local assets
   */
  async loadLocalData() {
    try {
      this.isLoading = true;
      const statusMsg = 'Carregando dados do ENEM...';
      console.log(statusMsg);
      this.updateLoadingStatus(statusMsg);

      // Try multiple approaches to load the data
      let dataLoaded = false;

      // Approach 1: Try to load data from the imported JSON file (works in development)
      if (!dataLoaded) {
        try {
          console.log('Tentando carregar dados do arquivo importado...');
          this.data = JSON.parse(JSON.stringify(enemData));
          if (this.data && this.data.exams) {
            console.log('Dados carregados com sucesso do arquivo importado!');
            dataLoaded = true;
          }
        } catch (importError) {
          console.warn('Erro ao carregar do arquivo importado:', importError);
        }
      }

      // Approach 2: Try to load from document directory
      if (!dataLoaded) {
        try {
          console.log('Tentando carregar dados do diretório de documentos...');
          const fileUri = FileSystem.documentDirectory + 'enem_data.json';
          const fileExists = await FileSystem.getInfoAsync(fileUri);

          if (fileExists.exists) {
            const fileContent = await FileSystem.readAsStringAsync(fileUri);
            this.data = JSON.parse(fileContent);
            if (this.data && this.data.exams) {
              console.log('Dados carregados com sucesso do diretório de documentos!');
              dataLoaded = true;
            }
          }
        } catch (docError) {
          console.warn('Erro ao carregar do diretório de documentos:', docError);
        }
      }

      // Approach 3: Try to load from bundle directory
      if (!dataLoaded) {
        try {
          console.log('Tentando carregar dados do diretório do bundle...');
          const assetUri = FileSystem.bundleDirectory + 'assets/enem_data.json';
          const assetExists = await FileSystem.getInfoAsync(assetUri);

          if (assetExists.exists) {
            // Copy to document directory for future use
            const fileUri = FileSystem.documentDirectory + 'enem_data.json';
            await FileSystem.copyAsync({
              from: assetUri,
              to: fileUri
            });
            const fileContent = await FileSystem.readAsStringAsync(fileUri);
            this.data = JSON.parse(fileContent);
            if (this.data && this.data.exams) {
              console.log('Dados carregados com sucesso do diretório do bundle!');
              dataLoaded = true;
            }
          }
        } catch (bundleError) {
          console.warn('Erro ao carregar do diretório do bundle:', bundleError);
        }
      }

      // Final fallback to hardcoded data
      if (!dataLoaded) {
        console.log('Usando dados hardcoded como último recurso...');
        try {
          this.data = JSON.parse(JSON.stringify(enemData));

          // Ensure the data has the expected structure
          if (!this.data) this.data = {};
          if (!this.data.exams) this.data.exams = [];
          if (!this.data.questions) this.data.questions = [];

          console.log('Dados hardcoded carregados com sucesso!');
          dataLoaded = true;
        } catch (e) {
          console.error('Erro ao carregar dados hardcoded:', e);
          // Initialize with empty data as a last resort
          this.data = { exams: [], questions: [] };
        }
      }

      // Ensure we have at least an empty data structure
      if (!this.data) this.data = {};
      if (!this.data.exams) this.data.exams = [];
      if (!this.data.questions) this.data.questions = [];

      // Update image paths to use local assets
      this.updateImagePaths();

      // Notify all callbacks that data is loaded
      this.onDataLoadedCallbacks.forEach(callback => callback());
      this.onDataLoadedCallbacks = [];

      const successMsg = 'Dados do ENEM carregados com sucesso!';
      console.log(successMsg);
      this.updateLoadingStatus(successMsg);
    } catch (error) {
      const errorMsg = `Erro ao carregar dados do ENEM: ${error.message}`;
      console.error(errorMsg);
      this.updateLoadingStatus(errorMsg);
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Update image paths to use local assets
   */
  private updateImagePaths() {
    if (!this.data) {
      this.data = {};
    }

    // Initialize questions array if it doesn't exist
    if (!this.data.questions) {
      console.warn('Questions array is undefined, initializing empty array');
      this.data.questions = [];
      return;
    }

    // If questions is not an array, convert it to an array
    if (!Array.isArray(this.data.questions)) {
      // Log the type and structure of questions for debugging
      console.log('Questions type:', typeof this.data.questions);
      if (typeof this.data.questions === 'object') {
        console.log('Questions keys:', Object.keys(this.data.questions));
      }

      // Try to convert to array if it's an object
      if (typeof this.data.questions === 'object') {
        try {
          this.data.questions = Object.values(this.data.questions).flat();
        } catch (e) {
          console.error('Error flattening questions object:', e);
          this.data.questions = [];
        }
      } else {
        // If it's not an object, initialize as empty array
        this.data.questions = [];
      }
    }

    // Log some statistics about images
    let totalImages = 0;
    let uniqueImages = new Set();

    // Update image paths in questions
    this.data.questions.forEach((question: Question) => {
      // Process and count images in question files
      if (question.files && question.files.length > 0) {
        totalImages += question.files.length;

        // Process each file path
        for (let i = 0; i < question.files.length; i++) {
          const file = question.files[i];
          if (file) {
            // Check if the file is a URL from enem.dev
            if (file.includes('enem.dev')) {
              // Extract just the filename from the URL
              const urlParts = file.split('/');
              const filename = urlParts[urlParts.length - 1];
              if (filename) {
                uniqueImages.add(filename);
                // Replace the URL with just the filename
                question.files[i] = filename;
                console.log(`Converted enem.dev URL to filename in question files: ${file} -> ${filename}`);
              }
            } else {
              const filename = file.split('/').pop();
              if (filename) uniqueImages.add(filename);
            }
          }
        }
      }

      // Process and count images in alternatives
      if (question.alternatives && question.alternatives.length > 0) {
        question.alternatives.forEach((alt, index) => {
          if (alt.file) {
            totalImages++;

            // Check if the file is a URL from enem.dev
            if (alt.file.includes('enem.dev')) {
              // Extract just the filename from the URL
              const urlParts = alt.file.split('/');
              const filename = urlParts[urlParts.length - 1];
              if (filename) {
                uniqueImages.add(filename);
                // Replace the URL with just the filename
                question.alternatives[index].file = filename;
                console.log(`Converted enem.dev URL to filename in alternative: ${alt.file} -> ${filename}`);
              }
            } else {
              const filename = alt.file.split('/').pop();
              if (filename) uniqueImages.add(filename);
            }
          }
        });
      }
    });

    console.log(`Total images in questions: ${totalImages}`);
    console.log(`Unique images: ${uniqueImages.size}`);
  }

  /**
   * Register a callback to be called when data is loaded
   */
  onDataLoaded(callback: () => void) {
    if (this.data) {
      // Data is already loaded, call immediately
      callback();
    } else {
      // Data is not loaded yet, register callback
      this.onDataLoadedCallbacks.push(callback);
    }
  }

  /**
   * Register a callback to be called when loading status changes
   */
  onLoadingStatus(callback: (status: string) => void) {
    this.onLoadingStatusCallbacks.push(callback);
    // Immediately call with current status if loading
    if (this.isLoading) {
      callback('Carregando dados do ENEM...');
    }
  }

  /**
   * Update loading status and notify callbacks
   */
  private updateLoadingStatus(status: string) {
    this.onLoadingStatusCallbacks.forEach(callback => callback(status));
  }

  /**
   * Check if data is loaded
   */
  isDataLoaded(): boolean {
    return this.data !== null;
  }

  private async loadUserAnswers() {
    try {
      // For web, we'll use localStorage if available
      if (typeof localStorage !== 'undefined') {
        const savedAnswers = localStorage.getItem('userAnswers');
        if (savedAnswers) {
          this.userAnswers = JSON.parse(savedAnswers);
        }
      }
    } catch (error) {
      console.error('Error loading user answers:', error);
    }
  }

  private async saveUserAnswers() {
    try {
      // For web, we'll use localStorage if available
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('userAnswers', JSON.stringify(this.userAnswers));
      }
    } catch (error) {
      console.error('Error saving user answers:', error);
    }
  }

  private async loadStudySessions() {
    try {
      // For web, we'll use localStorage if available
      if (typeof localStorage !== 'undefined') {
        const savedSessions = localStorage.getItem('studySessions');
        if (savedSessions) {
          this.studySessions = JSON.parse(savedSessions);
        }
      }
    } catch (error) {
      console.error('Error loading study sessions:', error);
    }
  }

  private async saveStudySessions() {
    try {
      // For web, we'll use localStorage if available
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('studySessions', JSON.stringify(this.studySessions));
      }
    } catch (error) {
      console.error('Error saving study sessions:', error);
    }
  }

  getExams(): Exam[] {
    try {
      if (!this.data) {
        console.warn('Data is undefined in getExams');
        return [];
      }

      if (!this.data.exams) {
        console.warn('Exams array is undefined in getExams');
        this.data.exams = [];
        return [];
      }

      if (!Array.isArray(this.data.exams)) {
        console.warn('Exams is not an array in getExams, converting to array');
        try {
          // Try to convert to array if it's an object
          if (typeof this.data.exams === 'object') {
            this.data.exams = Object.values(this.data.exams);
          } else {
            // If conversion fails, initialize as empty array
            this.data.exams = [];
          }
        } catch (e) {
          console.error('Error converting exams to array:', e);
          this.data.exams = [];
        }
      }

      return this.data.exams;
    } catch (e) {
      console.error('Error in getExams:', e);
      return [];
    }
  }

  getQuestionsByYear(year: number): Question[] {
    try {
      if (!this.data) return [];

      const questions: Question[] = [];

      // Find all questions for the specified year
      if (!this.data.exams || !Array.isArray(this.data.exams)) {
        console.warn('Exams array is undefined or not an array in getQuestionsByYear');
        return [];
      }

      // Get all questions first
      const allQuestions = this.getAllQuestions();
      if (!allQuestions || allQuestions.length === 0) {
        return [];
      }

      // Filter questions by year
      return allQuestions.filter(question => question.year === year);
    } catch (e) {
      console.error('Error in getQuestionsByYear:', e);
      return [];
    }
  }

  getQuestionsByDiscipline(discipline: string): Question[] {
    try {
      if (!this.data) return [];

      const allQuestions = this.getAllQuestions();
      if (!allQuestions || allQuestions.length === 0) {
        return [];
      }

      return allQuestions.filter(
        (question: Question) => question.discipline === discipline
      );
    } catch (e) {
      console.error('Error in getQuestionsByDiscipline:', e);
      return [];
    }
  }

  getDisciplinesWithQuestions(): string[] {
    try {
      if (!this.data) return [];

      const allQuestions = this.getAllQuestions();
      if (!allQuestions || allQuestions.length === 0) {
        return [];
      }

      // Get unique disciplines that have questions
      const disciplinesWithQuestions = new Set<string>();
      allQuestions.forEach(question => {
        if (question.discipline) {
          disciplinesWithQuestions.add(question.discipline);
        }
      });

      return Array.from(disciplinesWithQuestions);
    } catch (e) {
      console.error('Error in getDisciplinesWithQuestions:', e);
      return [];
    }
  }

  getQuestionsByLanguage(language: string): Question[] {
    try {
      if (!this.data) return [];

      const allQuestions = this.getAllQuestions();
      if (!allQuestions || allQuestions.length === 0) {
        return [];
      }

      return allQuestions.filter(
        (question: Question) => question.language === language
      );
    } catch (e) {
      console.error('Error in getQuestionsByLanguage:', e);
      return [];
    }
  }

  getAllQuestions(): Question[] {
    try {
      if (!this.data) return [];

      // Ensure questions exists
      if (!this.data.questions) {
        console.warn('Questions array is undefined in getAllQuestions');
        this.data.questions = [];
        return [];
      }

      // Extract all questions from the data
      // Check if questions is an object with years as keys
      if (typeof this.data.questions === 'object' && !Array.isArray(this.data.questions)) {
        try {
          // Flatten the questions from all years into a single array
          return Object.values(this.data.questions).flat() as Question[];
        } catch (e) {
          console.error('Error flattening questions object:', e);
          return [];
        }
      }

      // If it's already an array, return it directly
      if (Array.isArray(this.data.questions)) {
        return this.data.questions;
      }

      // If we get here, questions is neither an object nor an array
      console.warn('Questions is neither an object nor an array, returning empty array');
      return [];
    } catch (e) {
      console.error('Error in getAllQuestions:', e);
      return [];
    }
  }

  getQuestionById(id: string): Question | undefined {
    try {
      if (!this.data) return undefined;
      if (!id) return undefined;

      const parts = id.split('-');
      if (parts.length !== 2) {
        console.warn(`Invalid question ID format: ${id}`);
        return undefined;
      }

      const [year, index] = parts.map(Number);
      if (isNaN(year) || isNaN(index)) {
        console.warn(`Invalid question ID numbers: ${id}`);
        return undefined;
      }

      const allQuestions = this.getAllQuestions();
      if (!allQuestions || allQuestions.length === 0) {
        return undefined;
      }

      return allQuestions.find(
        (question: Question) => question.year === year && question.index === index
      );
    } catch (e) {
      console.error('Error in getQuestionById:', e);
      return undefined;
    }
  }

  saveUserAnswer(questionId: string, selectedAlternative: string, isCorrect: boolean, studySessionId?: string) {
    const answer: UserAnswer = {
      questionId,
      selectedAlternative,
      isCorrect,
      timestamp: Date.now(),
    };

    if (studySessionId) {
      answer.studySession = studySessionId;

      // Update study session statistics
      const sessionIndex = this.studySessions.findIndex(s => s.id === studySessionId);
      if (sessionIndex >= 0) {
        this.studySessions[sessionIndex].questionsAnswered++;
        if (isCorrect) {
          this.studySessions[sessionIndex].correctAnswers++;
        }
        this.saveStudySessions();
      }
    }

    // Update if exists, otherwise add
    const existingIndex = this.userAnswers.findIndex(a => a.questionId === questionId);
    if (existingIndex >= 0) {
      // Preserve viewedLesson status if it exists
      if (this.userAnswers[existingIndex].viewedLesson) {
        answer.viewedLesson = this.userAnswers[existingIndex].viewedLesson;
      }
      this.userAnswers[existingIndex] = answer;
    } else {
      this.userAnswers.push(answer);
    }

    this.saveUserAnswers();
  }

  getUserAnswers(): UserAnswer[] {
    return this.userAnswers;
  }

  recordLessonView(questionId: string, studySessionId?: string) {
    // Find the answer for this question
    const answerIndex = this.userAnswers.findIndex(a => a.questionId === questionId);

    if (answerIndex >= 0) {
      // Update the existing answer
      this.userAnswers[answerIndex].viewedLesson = true;
      this.saveUserAnswers();
    } else {
      // Create a new record just for the lesson view
      const answer: UserAnswer = {
        questionId,
        selectedAlternative: '',
        isCorrect: false,
        timestamp: Date.now(),
        viewedLesson: true
      };

      if (studySessionId) {
        answer.studySession = studySessionId;
      }

      this.userAnswers.push(answer);
      this.saveUserAnswers();
    }

    // Update study session if provided
    if (studySessionId) {
      const sessionIndex = this.studySessions.findIndex(s => s.id === studySessionId);
      if (sessionIndex >= 0) {
        this.studySessions[sessionIndex].lessonsViewed++;
        this.saveStudySessions();
      }
    }
  }

  createStudySession(disciplines: string[], questionCount: number): StudySession {
    const session: StudySession = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      disciplines,
      questionCount,
      questionsAnswered: 0,
      correctAnswers: 0,
      lessonsViewed: 0
    };

    this.studySessions.push(session);
    this.saveStudySessions();

    return session;
  }

  getStudySessions(): StudySession[] {
    return this.studySessions;
  }

  getStudySessionById(id: string): StudySession | undefined {
    return this.studySessions.find(s => s.id === id);
  }

  getRandomQuestionsForStudy(disciplines: string[], count: number, excludeAnswered: boolean = false): Question[] {
    if (!this.data) return [];

    // Get all questions
    const allQuestions = this.getAllQuestions();

    // Log the total number of questions and their disciplines
    console.log(`Total questions: ${allQuestions.length}`);
    const disciplineCounts: {[key: string]: number} = {};
    allQuestions.forEach(q => {
      disciplineCounts[q.discipline] = (disciplineCounts[q.discipline] || 0) + 1;
    });
    console.log('Questions per discipline:', disciplineCounts);

    // Get all questions for the selected disciplines
    let availableQuestions = allQuestions.filter(q => disciplines.includes(q.discipline));

    // Log the available questions for the selected disciplines
    console.log(`Available questions for selected disciplines: ${availableQuestions.length}`);
    const selectedDisciplineCounts: {[key: string]: number} = {};
    availableQuestions.forEach(q => {
      selectedDisciplineCounts[q.discipline] = (selectedDisciplineCounts[q.discipline] || 0) + 1;
    });
    console.log('Selected questions per discipline:', selectedDisciplineCounts);

    // Optionally exclude already answered questions
    if (excludeAnswered) {
      const answeredIds = new Set(this.userAnswers.map(a => a.questionId));
      availableQuestions = availableQuestions.filter(q => !answeredIds.has(`${q.year}-${q.index}`));
    }

    // If we don't have enough questions, just return what we have
    if (availableQuestions.length <= count) {
      return availableQuestions;
    }

    // Ensure we have questions from all selected disciplines if possible
    const result: Question[] = [];
    const questionsPerDiscipline: {[key: string]: Question[]} = {};

    // Group questions by discipline
    availableQuestions.forEach(q => {
      if (!questionsPerDiscipline[q.discipline]) {
        questionsPerDiscipline[q.discipline] = [];
      }
      questionsPerDiscipline[q.discipline].push(q);
    });

    // Shuffle each discipline's questions
    Object.keys(questionsPerDiscipline).forEach(discipline => {
      questionsPerDiscipline[discipline] = this.shuffleArray(questionsPerDiscipline[discipline]);
    });

    // Calculate how many questions to take from each discipline
    const disciplinesWithQuestions = Object.keys(questionsPerDiscipline);
    const questionsPerDisciplineCount = Math.max(1, Math.floor(count / disciplinesWithQuestions.length));

    // Take questions from each discipline
    disciplinesWithQuestions.forEach(discipline => {
      const disciplineQuestions = questionsPerDiscipline[discipline];
      const toTake = Math.min(questionsPerDisciplineCount, disciplineQuestions.length);
      result.push(...disciplineQuestions.slice(0, toTake));
    });

    // If we still need more questions, take them from any discipline
    if (result.length < count) {
      // Flatten all remaining questions
      const remainingQuestions = this.shuffleArray(
        disciplinesWithQuestions.flatMap(discipline => {
          const taken = Math.min(questionsPerDisciplineCount, questionsPerDiscipline[discipline].length);
          return questionsPerDiscipline[discipline].slice(taken);
        })
      );

      // Add remaining questions up to the count
      result.push(...remainingQuestions.slice(0, count - result.length));
    }

    // If we have too many questions, trim the result
    if (result.length > count) {
      return result.slice(0, count);
    }

    return result;
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  getUserStatistics() {
    const total = this.userAnswers.length;
    const correct = this.userAnswers.filter(a => a.isCorrect).length;
    const incorrect = total - correct;
    const accuracy = total > 0 ? (correct / total) * 100 : 0;
    const lessonsViewed = this.userAnswers.filter(a => a.viewedLesson).length;

    // Get statistics by discipline
    const disciplineStats: Record<string, { total: number; correct: number; lessonsViewed: number }> = {};

    this.userAnswers.forEach(answer => {
      const question = this.getQuestionById(answer.questionId);
      if (question) {
        const discipline = question.discipline;
        if (!disciplineStats[discipline]) {
          disciplineStats[discipline] = { total: 0, correct: 0, lessonsViewed: 0 };
        }
        disciplineStats[discipline].total += 1;
        if (answer.isCorrect) {
          disciplineStats[discipline].correct += 1;
        }
        if (answer.viewedLesson) {
          disciplineStats[discipline].lessonsViewed += 1;
        }
      }
    });

    return {
      total,
      correct,
      incorrect,
      accuracy,
      lessonsViewed,
      disciplineStats
    };
  }
}

export default new DataService();
