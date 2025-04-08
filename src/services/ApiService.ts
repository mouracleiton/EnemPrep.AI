import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

// Define the base URL for the API
const API_BASE_URL = 'http://localhost:3000/v1';

// Define types for the API responses
export interface Exam {
  title: string;
  year: number;
  disciplines: { label: string; value: string }[];
  languages: { label: string; value: string }[];
}

export interface ExamDetail extends Exam {
  questions: Question[];
}

export interface Question {
  title: string;
  index: number;
  discipline: string | null;
  language: string | null;
}

export interface QuestionDetail extends Question {
  year: number;
  context: string | null;
  files: string[];
  correctAlternative: 'A' | 'B' | 'C' | 'D' | 'E';
  alternativesIntroduction: string | null;
  alternatives: {
    letter: 'A' | 'B' | 'C' | 'D' | 'E';
    text: string | null;
    file: string | null;
    isCorrect: boolean;
  }[];
  lesson?: string; // This is added by our app, not from the API
}

export interface QuestionsResponse {
  metadata: {
    limit: number;
    offset: number;
    total: number;
    hasMore: boolean;
  };
  questions: QuestionDetail[];
}

class ApiService {
  private isApiAvailable: boolean = false;
  private cachedExams: Exam[] | null = null;
  private cachedQuestions: { [key: string]: QuestionDetail } = {};
  private imageCache: { [url: string]: string } = {};

  constructor() {
    this.checkApiAvailability();
  }

  /**
   * Check if the API is available
   */
  private async checkApiAvailability(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/exams`);
      this.isApiAvailable = response.ok;
      return this.isApiAvailable;
    } catch (error) {
      console.error('API is not available:', error);
      this.isApiAvailable = false;
      return false;
    }
  }

  /**
   * Get all exams
   */
  async getExams(): Promise<Exam[]> {
    if (this.cachedExams) {
      return this.cachedExams;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/exams`);
      if (!response.ok) {
        throw new Error(`Failed to fetch exams: ${response.statusText}`);
      }
      
      const exams = await response.json();
      this.cachedExams = exams;
      return exams;
    } catch (error) {
      console.error('Error fetching exams:', error);
      throw error;
    }
  }

  /**
   * Get exam details by year
   */
  async getExamDetails(year: number): Promise<ExamDetail> {
    try {
      const response = await fetch(`${API_BASE_URL}/exams/${year}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch exam details: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching exam details for year ${year}:`, error);
      throw error;
    }
  }

  /**
   * Get questions for a specific exam
   */
  async getQuestions(year: number, options: { limit?: number; offset?: number; language?: string } = {}): Promise<QuestionsResponse> {
    const { limit = 10, offset = 0, language } = options;
    
    try {
      let url = `${API_BASE_URL}/exams/${year}/questions?limit=${limit}&offset=${offset}`;
      if (language) {
        url += `&language=${language}`;
      }
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch questions: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching questions for year ${year}:`, error);
      throw error;
    }
  }

  /**
   * Get question details
   */
  async getQuestionDetails(year: number, index: number, language?: string): Promise<QuestionDetail> {
    const cacheKey = `${year}-${index}-${language || 'default'}`;
    
    if (this.cachedQuestions[cacheKey]) {
      return this.cachedQuestions[cacheKey];
    }
    
    try {
      let url = `${API_BASE_URL}/exams/${year}/questions/${index}`;
      if (language) {
        url += `?language=${language}`;
      }
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch question details: ${response.statusText}`);
      }
      
      const questionDetail = await response.json();
      
      // Cache the question
      this.cachedQuestions[cacheKey] = questionDetail;
      
      return questionDetail;
    } catch (error) {
      console.error(`Error fetching question details for year ${year}, index ${index}:`, error);
      throw error;
    }
  }

  /**
   * Download an image from the API and cache it locally
   */
  async downloadImage(url: string): Promise<string> {
    // If the image is already cached, return the local path
    if (this.imageCache[url]) {
      return this.imageCache[url];
    }
    
    try {
      // Extract the filename from the URL
      const filename = url.split('/').pop() || 'unknown.png';
      
      // Create a local path for the image
      const localPath = `${FileSystem.documentDirectory}images/${filename}`;
      
      // Create the images directory if it doesn't exist
      const dirInfo = await FileSystem.getInfoAsync(`${FileSystem.documentDirectory}images`);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(`${FileSystem.documentDirectory}images`, { intermediates: true });
      }
      
      // Check if the file already exists
      const fileInfo = await FileSystem.getInfoAsync(localPath);
      if (!fileInfo.exists) {
        // Download the image
        await FileSystem.downloadAsync(url, localPath);
      }
      
      // Cache the local path
      this.imageCache[url] = localPath;
      
      return localPath;
    } catch (error) {
      console.error(`Error downloading image from ${url}:`, error);
      throw error;
    }
  }

  /**
   * Process question content to replace remote image URLs with local paths
   */
  async processQuestionContent(question: QuestionDetail): Promise<QuestionDetail> {
    const processedQuestion = { ...question };
    
    // Process context (which may contain image URLs in Markdown format)
    if (processedQuestion.context) {
      // Find all image URLs in the context
      const imageUrlRegex = /!\[.*?\]\((https:\/\/enem\.dev\/.*?)\)/g;
      let match;
      const imageUrls: string[] = [];
      
      while ((match = imageUrlRegex.exec(processedQuestion.context)) !== null) {
        imageUrls.push(match[1]);
      }
      
      // Download and replace each image URL
      for (const url of imageUrls) {
        try {
          const localPath = await this.downloadImage(url);
          processedQuestion.context = processedQuestion.context!.replace(url, localPath);
        } catch (error) {
          console.error(`Error processing image in context: ${url}`, error);
        }
      }
    }
    
    // Process files array
    if (processedQuestion.files && processedQuestion.files.length > 0) {
      const processedFiles: string[] = [];
      
      for (const url of processedQuestion.files) {
        if (url.startsWith('https://enem.dev/')) {
          try {
            const localPath = await this.downloadImage(url);
            processedFiles.push(localPath);
          } catch (error) {
            console.error(`Error processing file: ${url}`, error);
            processedFiles.push(url); // Keep the original URL if download fails
          }
        } else {
          processedFiles.push(url);
        }
      }
      
      processedQuestion.files = processedFiles;
    }
    
    // Process alternatives
    if (processedQuestion.alternatives && processedQuestion.alternatives.length > 0) {
      for (const alternative of processedQuestion.alternatives) {
        if (alternative.file && alternative.file.startsWith('https://enem.dev/')) {
          try {
            alternative.file = await this.downloadImage(alternative.file);
          } catch (error) {
            console.error(`Error processing alternative file: ${alternative.file}`, error);
          }
        }
      }
    }
    
    return processedQuestion;
  }

  /**
   * Check if the API is available
   */
  isAvailable(): boolean {
    return this.isApiAvailable;
  }
}

export default new ApiService();
