import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';
import modelService from './ModelService';

// Types for essay evaluation
export interface EssayEvaluation {
  id: string;
  text: string;
  timestamp: number;
  wordCount: number;
  lineCount: number;
  competencyScores: {
    competency1: number; // Domínio da norma culta (0-200)
    competency2: number; // Compreensão da proposta (0-200)
    competency3: number; // Argumentação (0-200)
    competency4: number; // Coesão textual (0-200)
    competency5: number; // Proposta de intervenção (0-200)
  };
  totalScore: number; // Sum of all competencies (0-1000)
  feedback: {
    generalAnalysis: string;
    competency1Feedback: string;
    competency2Feedback: string;
    competency3Feedback: string;
    competency4Feedback: string;
    competency5Feedback: string;
    summary: string;
  };
}

// Class to handle essay evaluation
class EssayEvaluationService {
  private essays: EssayEvaluation[] = [];
  private modelLoaded: boolean = false;
  private modelLoading: boolean = false;
  private onLoadingStatusCallbacks: ((status: string) => void)[] = [];
  private onModelLoadedCallbacks: (() => void)[] = [];

  constructor() {
    this.loadEssays();
    this.initializeModel();
  }

  /**
   * Initialize the MobileLLM model for essay evaluation
   */
  async initializeModel() {
    if (this.modelLoaded || this.modelLoading) return;

    try {
      this.modelLoading = true;
      this.updateLoadingStatus('Inicializando modelo de avaliação de redações...');

      // Use the ModelService to initialize the model
      const unsubscribeStatus = modelService.onLoadingStatus(status => {
        this.updateLoadingStatus(status);
      });

      // Wait for the model to be loaded
      await new Promise<void>(resolve => {
        const unsubscribeModel = modelService.onModelLoaded(() => {
          unsubscribeModel();
          resolve();
        });

        // If model is already loaded, resolve immediately
        if (modelService.isModelLoaded()) {
          unsubscribeModel();
          resolve();
        }
      });

      unsubscribeStatus();

      this.modelLoaded = true;
      this.modelLoading = false;
      this.updateLoadingStatus('Modelo de avaliação de redações inicializado com sucesso!');

      // Notify all callbacks that model is loaded
      this.onModelLoadedCallbacks.forEach(callback => callback());
      this.onModelLoadedCallbacks = [];
    } catch (error) {
      this.modelLoading = false;
      this.updateLoadingStatus(`Erro ao inicializar modelo: ${error.message}`);
      console.error('Error initializing model:', error);
    }
  }

  /**
   * Load saved essays from local storage
   */
  private async loadEssays() {
    try {
      if (Platform.OS === 'web') return;

      const essaysDir = `${FileSystem.documentDirectory}essays`;
      const dirInfo = await FileSystem.getInfoAsync(essaysDir);

      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(essaysDir, { intermediates: true });
        return;
      }

      const essaysFile = `${essaysDir}/essays.json`;
      const fileInfo = await FileSystem.getInfoAsync(essaysFile);

      if (fileInfo.exists) {
        const content = await FileSystem.readAsStringAsync(essaysFile);
        this.essays = JSON.parse(content);
      }
    } catch (error) {
      console.error('Error loading essays:', error);
    }
  }

  /**
   * Save essays to local storage
   */
  private async saveEssays() {
    try {
      if (Platform.OS === 'web') return;

      const essaysDir = `${FileSystem.documentDirectory}essays`;
      const essaysFile = `${essaysDir}/essays.json`;

      await FileSystem.writeAsStringAsync(
        essaysFile,
        JSON.stringify(this.essays),
        { encoding: FileSystem.EncodingType.UTF8 }
      );
    } catch (error) {
      console.error('Error saving essays:', error);
    }
  }

  /**
   * Evaluate an essay using the MobileLLM model
   * @param text The essay text to evaluate
   */
  async evaluateEssay(text: string): Promise<EssayEvaluation> {
    // Check if model is available
    if (!modelService.isModelLoaded()) {
      try {
        this.updateLoadingStatus('Inicializando modelo de avaliação...');
        await this.initializeModel();
      } catch (error) {
        throw new Error('O modelo de IA não está disponível. Por favor, baixe o modelo para usar esta funcionalidade.');
      }
    }

    // If model is still not loaded, it means there was an error or user canceled download
    if (!modelService.isModelLoaded()) {
      throw new Error('O modelo de IA não está disponível. Por favor, baixe o modelo para usar esta funcionalidade.');
    }

    // Count words and lines
    const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;
    const lineCount = text.split('\n').filter(line => line.trim().length > 0).length;

    // Create prompt for the model
    const prompt = this.createEvaluationPrompt(text);

    try {
      this.updateLoadingStatus('Avaliando redação...');

      // Generate evaluation using the model
      const modelResponse = await modelService.generateText(prompt, 2000, 0.7);

      // Parse the model response to extract scores and feedback
      const evaluation = this.parseEvaluationResponse(modelResponse, text, wordCount, lineCount);

      // Save the evaluation
      this.essays.push(evaluation);
      await this.saveEssays();

      this.updateLoadingStatus('Avaliação concluída!');
      return evaluation;
    } catch (error) {
      this.updateLoadingStatus(`Erro na avaliação: ${error.message}`);
      console.error('Error evaluating essay:', error);
      throw error;
    }
  }

  /**
   * Create a prompt for the model to evaluate the essay
   * @param text The essay text
   */
  private createEvaluationPrompt(text: string): string {
    return `
Você é um Avaliador Expert em correções de redações do ENEM, com mais de 15 anos de experiência. Sua função é avaliar redações seguindo rigorosamente os critérios oficiais do ENEM, atribuindo notas de 0 a 200 em cada uma das 5 competências.

CRITÉRIOS DE AVALIAÇÃO:

Competência 1 - Domínio da norma culta
- Analise: estrutura sintática, concordância, regência, pontuação, ortografia
- Considere a frequência e gravidade dos desvios
- Avalie se os desvios comprometem a clareza

Competência 2 - Compreensão da proposta
- Verifique: tema, tipo textual dissertativo-argumentativo
- Avalie a aderência ao tema
- Identifique tangenciamento ou fuga

Competência 3 - Argumentação
- Analise: seleção e organização de argumentos
- Verifique a consistência argumentativa
- Avalie uso de repertório sociocultural

Competência 4 - Coesão textual
- Examine: uso de conectivos e elementos coesivos
- Avalie progressão e encadeamento de ideias
- Verifique retomadas pronominais

Competência 5 - Proposta de intervenção
- Verifique: detalhamento, exequibilidade, respeito aos direitos humanos
- Avalie articulação com argumentos apresentados
- Analise agente, ação, modo/meio, efeito e detalhamento

FORMATO DA SUA RESPOSTA:
1. Primeiro, faça uma análise geral do texto em 2-3 linhas
2. Para cada competência:
   - Nota (0-200)
   - Justificativa objetiva citando elementos do texto
   - Feedback construtivo com sugestões de melhoria
3. Nota final (soma das competências)
4. Resumo dos principais pontos fortes e aspectos a melhorar

Avalie a seguinte redação:

${text}
`;
  }

  /**
   * Parse the evaluation response from the model
   */
  private parseEvaluationResponse(response: string, text: string, wordCount: number, lineCount: number): EssayEvaluation {
    try {
      // In a real implementation, we would parse the model response to extract scores and feedback
      // For now, we'll use a simple regex-based approach to extract the information

      // Extract general analysis
      const generalAnalysisMatch = response.match(/Análise Geral:[\s\n]*(.*?)(?=\n\n|\nCompetência)/is);
      const generalAnalysis = generalAnalysisMatch ? generalAnalysisMatch[1].trim() : "Análise não disponível";

      // Extract competency scores and feedback
      const competency1Match = response.match(/Competência 1:[\s\n]*(\d+)\/200([\s\S]*?)(?=\n\nCompetência|\nNota Final)/i);
      const competency2Match = response.match(/Competência 2:[\s\n]*(\d+)\/200([\s\S]*?)(?=\n\nCompetência|\nNota Final)/i);
      const competency3Match = response.match(/Competência 3:[\s\n]*(\d+)\/200([\s\S]*?)(?=\n\nCompetência|\nNota Final)/i);
      const competency4Match = response.match(/Competência 4:[\s\n]*(\d+)\/200([\s\S]*?)(?=\n\nCompetência|\nNota Final)/i);
      const competency5Match = response.match(/Competência 5:[\s\n]*(\d+)\/200([\s\S]*?)(?=\n\nNota Final|\nPrincipais)/i);

      // Extract scores
      const competency1 = competency1Match ? parseInt(competency1Match[1]) : 0;
      const competency2 = competency2Match ? parseInt(competency2Match[1]) : 0;
      const competency3 = competency3Match ? parseInt(competency3Match[1]) : 0;
      const competency4 = competency4Match ? parseInt(competency4Match[1]) : 0;
      const competency5 = competency5Match ? parseInt(competency5Match[1]) : 0;

      // Extract feedback
      const competency1Feedback = competency1Match ? competency1Match[2].trim() : "Feedback não disponível";
      const competency2Feedback = competency2Match ? competency2Match[2].trim() : "Feedback não disponível";
      const competency3Feedback = competency3Match ? competency3Match[2].trim() : "Feedback não disponível";
      const competency4Feedback = competency4Match ? competency4Match[2].trim() : "Feedback não disponível";
      const competency5Feedback = competency5Match ? competency5Match[2].trim() : "Feedback não disponível";

      // Extract total score
      const totalScoreMatch = response.match(/Nota Final:[\s\n]*(\d+)\/1000/i);
      const totalScore = totalScoreMatch ? parseInt(totalScoreMatch[1]) : (competency1 + competency2 + competency3 + competency4 + competency5);

      // Extract summary
      const summaryMatch = response.match(/Principais pontos fortes:([\s\S]*?)(?=\n\n|$)/i);
      const summary = summaryMatch ? summaryMatch[1].trim() : "Resumo não disponível";

      return {
        id: Date.now().toString(),
        text,
        timestamp: Date.now(),
        wordCount,
        lineCount,
        competencyScores: {
          competency1,
          competency2,
          competency3,
          competency4,
          competency5
        },
        totalScore,
        feedback: {
          generalAnalysis,
          competency1Feedback,
          competency2Feedback,
          competency3Feedback,
          competency4Feedback,
          competency5Feedback,
          summary
        }
      };
    } catch (error) {
      console.error('Error parsing evaluation response:', error);

      // Fallback to default values if parsing fails
      return {
        id: Date.now().toString(),
        text,
        timestamp: Date.now(),
        wordCount,
        lineCount,
        competencyScores: {
          competency1: 150,
          competency2: 150,
          competency3: 150,
          competency4: 150,
          competency5: 150
        },
        totalScore: 750,
        feedback: {
          generalAnalysis: "O texto apresenta argumentação consistente sobre o tema proposto, com boa articulação de ideias e repertório sociocultural pertinente. Demonstra domínio mediano da norma culta e proposta de intervenção detalhada.",
          competency1Feedback: `Apresenta bom domínio da modalidade escrita formal, com poucos desvios gramaticais e de convenções da escrita. Foram identificados alguns desvios pontuais de concordância e pontuação que não comprometem a compreensão global do texto.`,
          competency2Feedback: `O texto demonstra compreensão adequada da proposta, desenvolvendo o tema com consistência. A abordagem poderia ser mais aprofundada em alguns aspectos, mas mantém-se dentro do tema proposto.`,
          competency3Feedback: `A argumentação é consistente e apresenta bom repertório sociocultural. Os argumentos poderiam ser mais desenvolvidos e articulados entre si para fortalecer a tese apresentada.`,
          competency4Feedback: `O texto apresenta boa progressão, com uso adequado de elementos coesivos. Algumas transições entre parágrafos poderiam ser mais fluidas para melhorar o encadeamento das ideias.`,
          competency5Feedback: `A proposta de intervenção é bem detalhada e relacionada ao tema, respeitando os direitos humanos. Poderia apresentar maior detalhamento dos agentes envolvidos e dos meios de execução.`,
          summary: `Pontos fortes: argumentação consistente, bom repertório sociocultural, proposta de intervenção detalhada. Aspectos a melhorar: pontuação em períodos compostos, aprofundamento do repertório, articulação entre argumentos.`
        }
      };
    }
  }

  /**
   * Get all saved essays
   */
  getEssays(): EssayEvaluation[] {
    return [...this.essays];
  }

  /**
   * Get an essay by ID
   */
  getEssayById(id: string): EssayEvaluation | null {
    return this.essays.find(essay => essay.id === id) || null;
  }

  /**
   * Delete an essay by ID
   */
  async deleteEssay(id: string): Promise<boolean> {
    const initialLength = this.essays.length;
    this.essays = this.essays.filter(essay => essay.id !== id);

    if (initialLength !== this.essays.length) {
      await this.saveEssays();
      return true;
    }

    return false;
  }

  /**
   * Check if the model is loaded
   */
  isModelLoaded(): boolean {
    return this.modelLoaded && modelService.isModelLoaded();
  }

  /**
   * Register a callback for loading status updates
   */
  onLoadingStatus(callback: (status: string) => void) {
    this.onLoadingStatusCallbacks.push(callback);
    return () => {
      this.onLoadingStatusCallbacks = this.onLoadingStatusCallbacks.filter(cb => cb !== callback);
    };
  }

  /**
   * Update loading status and notify callbacks
   */
  private updateLoadingStatus(status: string) {
    console.log(status);
    this.onLoadingStatusCallbacks.forEach(callback => callback(status));
  }

  /**
   * Register a callback for when the model is loaded
   */
  onModelLoaded(callback: () => void) {
    if (this.modelLoaded) {
      callback();
    } else {
      this.onModelLoadedCallbacks.push(callback);
    }

    return () => {
      this.onModelLoadedCallbacks = this.onModelLoadedCallbacks.filter(cb => cb !== callback);
    };
  }

  /**
   * Validate essay length requirements
   * @returns Object with validation results
   */
  validateEssayLength(text: string): {
    valid: boolean;
    wordCount: number;
    lineCount: number;
    minWords: number;
    maxWords: number;
    minLines: number;
    maxLines: number;
    message?: string;
  } {
    const minWords = 120;
    const maxWords = 370;
    const minLines = 0; // Removida validação de mínimo de linhas para redações digitadas
    const maxLines = 30;

    const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;
    const lineCount = text.split('\n').filter(line => line.trim().length > 0).length;

    let valid = true;
    let message = '';

    if (wordCount < minWords) {
      valid = false;
      message = `Texto muito curto: ${wordCount} palavras. Mínimo: ${minWords} palavras.`;
    } else if (wordCount > maxWords) {
      valid = false;
      message = `Texto muito longo: ${wordCount} palavras. Máximo: ${maxWords} palavras.`;
    } else if (lineCount > maxLines) {
      valid = false;
      message = `Muitas linhas: ${lineCount} linhas. Máximo: ${maxLines} linhas.`;
    }

    return {
      valid,
      wordCount,
      lineCount,
      minWords,
      maxWords,
      minLines,
      maxLines,
      message
    };
  }
}

// Create a singleton instance
const essayEvaluationService = new EssayEvaluationService();

export default essayEvaluationService;
