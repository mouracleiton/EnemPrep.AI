// We'll fetch the data from a URL instead of importing it locally

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
}

class DataService {
  private data: any = null;
  private userAnswers: UserAnswer[] = [];
  private isLoading: boolean = false;
  private dataUrl: string = 'https://raw.githubusercontent.com/mouracleiton/enem_data/refs/heads/main/enem_data_with_lessons.json'; // URL fornecida para download dos dados
  private onDataLoadedCallbacks: (() => void)[] = [];
  private onLoadingStatusCallbacks: ((status: string) => void)[] = [];

  constructor() {
    this.loadUserAnswers();
    this.fetchData();
  }

  /**
   * Fetch the ENEM data from the remote URL
   */
  async fetchData() {
    if (this.isLoading) return;

    this.isLoading = true;
    let retryCount = 0;
    const maxRetries = 3;

    const tryFetch = async () => {
      try {
        const statusMsg = `Tentando baixar dados do ENEM (tentativa ${retryCount + 1}/${maxRetries})...`;
        console.log(statusMsg);
        this.updateLoadingStatus(statusMsg);

        const response = await fetch(this.dataUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
          },
          timeout: 10000 // 10 segundos de timeout
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (!data || !data.exams) {
          throw new Error('Dados inválidos: formato inesperado');
        }

        this.data = data;

        // Notify all callbacks that data is loaded
        this.onDataLoadedCallbacks.forEach(callback => callback());
        this.onDataLoadedCallbacks = [];

        const successMsg = 'Dados do ENEM carregados com sucesso!';
        console.log(successMsg);
        this.updateLoadingStatus(successMsg);
        return true;
      } catch (error) {
        const errorMsg = `Erro ao baixar dados do ENEM (tentativa ${retryCount + 1}/${maxRetries}): ${error.message}`;
        console.error(errorMsg);
        this.updateLoadingStatus(errorMsg);

        if (retryCount < maxRetries - 1) {
          retryCount++;
          // Espera exponencial entre tentativas (2s, 4s, 8s...)
          const delay = Math.pow(2, retryCount) * 1000;
          const retryMsg = `Tentando novamente em ${delay/1000} segundos...`;
          console.log(retryMsg);
          this.updateLoadingStatus(retryMsg);

          return new Promise(resolve => {
            setTimeout(async () => {
              const result = await tryFetch();
              resolve(result);
            }, delay);
          });
        }

        return false;
      }
    };

    try {
      await tryFetch();
    } finally {
      this.isLoading = false;
    }
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
      callback('Iniciando download dos dados...');
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
      // Use AsyncStorage to load user answers
      const storage = await import('../utils/storage').then(m => m.default);
      const savedAnswers = await storage.getData('userAnswers');
      if (savedAnswers) {
        this.userAnswers = savedAnswers;
      }
    } catch (error) {
      console.error('Error loading user answers:', error);
    }
  }

  private async saveUserAnswers() {
    try {
      // Use AsyncStorage to save user answers
      const storage = await import('../utils/storage').then(m => m.default);
      await storage.storeData('userAnswers', this.userAnswers);
    } catch (error) {
      console.error('Error saving user answers:', error);
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
      return this.data.questions;
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

  saveUserAnswer(questionId: string, selectedAlternative: string, isCorrect: boolean) {
    const answer: UserAnswer = {
      questionId,
      selectedAlternative,
      isCorrect,
      timestamp: Date.now(),
    };

    // Update if exists, otherwise add
    const existingIndex = this.userAnswers.findIndex(a => a.questionId === questionId);
    if (existingIndex >= 0) {
      this.userAnswers[existingIndex] = answer;
    } else {
      this.userAnswers.push(answer);
    }

    this.saveUserAnswers();
  }

  getUserAnswers(): UserAnswer[] {
    return this.userAnswers;
  }

  getUserStatistics() {
    const total = this.userAnswers.length;
    const correct = this.userAnswers.filter(a => a.isCorrect).length;
    const incorrect = total - correct;
    const accuracy = total > 0 ? (correct / total) * 100 : 0;

    // Get statistics by discipline
    const disciplineStats: Record<string, { total: number; correct: number }> = {};

    this.userAnswers.forEach(answer => {
      const question = this.getQuestionById(answer.questionId);
      if (question) {
        const discipline = question.discipline;
        if (!disciplineStats[discipline]) {
          disciplineStats[discipline] = { total: 0, correct: 0 };
        }
        disciplineStats[discipline].total += 1;
        if (answer.isCorrect) {
          disciplineStats[discipline].correct += 1;
        }
      }
    });

    return {
      total,
      correct,
      incorrect,
      accuracy,
      disciplineStats
    };
  }
}

export default new DataService();
