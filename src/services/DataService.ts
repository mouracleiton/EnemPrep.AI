// We'll load the data from local assets instead of downloading it
import enemData from '../../assets/enem_data_with_lessons.json';
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
          const fileUri = FileSystem.documentDirectory + 'enem_data_with_lessons.json';
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
          const assetUri = FileSystem.bundleDirectory + 'assets/enem_data_with_lessons.json';
          const assetExists = await FileSystem.getInfoAsync(assetUri);

          if (assetExists.exists) {
            // Copy to document directory for future use
            const fileUri = FileSystem.documentDirectory + 'enem_data_with_lessons.json';
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
        this.data = JSON.parse(JSON.stringify(enemData));
        if (this.data && this.data.exams) {
          console.log('Dados hardcoded carregados com sucesso!');
          dataLoaded = true;
        }
      }

      if (!this.data || !this.data.exams) {
        throw new Error('Dados inválidos: formato inesperado');
      }

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
    if (!this.data || !this.data.questions) return;

    // Log some statistics about images
    let totalImages = 0;
    let uniqueImages = new Set();

    // Update image paths in questions
    this.data.questions.forEach((question: Question) => {
      // Count images in question files
      if (question.files && question.files.length > 0) {
        totalImages += question.files.length;
        question.files.forEach(file => {
          if (file) {
            const filename = file.split('/').pop();
            if (filename) uniqueImages.add(filename);
          }
        });
      }

      // Count images in alternatives
      if (question.alternatives && question.alternatives.length > 0) {
        question.alternatives.forEach(alt => {
          if (alt.file) {
            totalImages++;
            const filename = alt.file.split('/').pop();
            if (filename) uniqueImages.add(filename);
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
    if (!this.data) return [];
    return this.data.exams || [];
  }

  getQuestionsByYear(year: number): Question[] {
    if (!this.data) return [];

    const questions: Question[] = [];

    // Find all questions for the specified year
    if (this.data.exams) {
      this.data.exams.forEach((exam: Exam) => {
        if (exam.year === year) {
          // Extract questions for this exam year
          const examQuestions = this.getAllQuestions().filter(
            (question: Question) => question.year === year
          );
          questions.push(...examQuestions);
        }
      });
    }

    return questions;
  }

  getQuestionsByDiscipline(discipline: string): Question[] {
    if (!this.data) return [];

    return this.getAllQuestions().filter(
      (question: Question) => question.discipline === discipline
    );
  }

  getQuestionsByLanguage(language: string): Question[] {
    if (!this.data) return [];

    return this.getAllQuestions().filter(
      (question: Question) => question.language === language
    );
  }

  getAllQuestions(): Question[] {
    if (!this.data) return [];

    // Extract all questions from the data
    if (this.data.questions) {
      // Check if questions is an object with years as keys
      if (typeof this.data.questions === 'object' && !Array.isArray(this.data.questions)) {
        // Flatten the questions from all years into a single array
        return Object.values(this.data.questions).flat() as Question[];
      }
      // If it's already an array, return it directly
      if (Array.isArray(this.data.questions)) {
        return this.data.questions;
      }
    }

    return [];
  }

  getQuestionById(id: string): Question | undefined {
    if (!this.data) return undefined;

    const [year, index] = id.split('-').map(Number);
    return this.getAllQuestions().find(
      (question: Question) => question.year === year && question.index === index
    );
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

    // Get all questions for the selected disciplines
    let availableQuestions = this.getAllQuestions().filter(q => disciplines.includes(q.discipline));

    // Optionally exclude already answered questions
    if (excludeAnswered) {
      const answeredIds = new Set(this.userAnswers.map(a => a.questionId));
      availableQuestions = availableQuestions.filter(q => !answeredIds.has(`${q.year}-${q.index}`));
    }

    // If we don't have enough questions, just return what we have
    if (availableQuestions.length <= count) {
      return availableQuestions;
    }

    // Shuffle the questions and take the requested count
    return this.shuffleArray(availableQuestions).slice(0, count);
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
