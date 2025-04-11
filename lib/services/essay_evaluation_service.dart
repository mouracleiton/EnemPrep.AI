import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:logger/logger.dart';
import 'package:uuid/uuid.dart';

import '../models/essay_evaluation.dart';
import '../utils/logger_config.dart';
import 'storage_service.dart';

class EssayEvaluationService extends ChangeNotifier {
  final List<EssayEvaluation> _essays = [];
  bool _modelLoaded = false;
  bool _modelLoading = false;
  String _loadingStatus = '';
  final Logger _logger = LoggerConfig.getLogger();

  // Services
  late StorageService _storageService;

  // Getters
  bool get isModelLoaded => _modelLoaded;
  bool get isModelLoading => _modelLoading;
  String get loadingStatus => _loadingStatus;
  List<EssayEvaluation> get essays => _essays;

  // Set storage service
  void setStorageService(StorageService storageService) {
    _storageService = storageService;
    _loadEssays();
  }

  // Load essays from storage
  Future<void> _loadEssays() async {
    try {
      final essaysJson = _storageService.getEssays();
      if (essaysJson != null && essaysJson.isNotEmpty) {
        final List<dynamic> essaysList = jsonDecode(essaysJson);
        _essays.clear();
        _essays.addAll(
          essaysList.map((json) => EssayEvaluation.fromJson(json)).toList(),
        );
        _logger.i('Loaded ${_essays.length} essays from storage');
      }
    } catch (e) {
      _logger.e('Error loading essays: $e');
    }
  }

  // Save essays to storage
  Future<void> _saveEssays() async {
    try {
      final essaysJson = jsonEncode(_essays.map((e) => e.toJson()).toList());
      await _storageService.saveEssays(essaysJson);
      _logger.i('Saved ${_essays.length} essays to storage');
    } catch (e) {
      _logger.e('Error saving essays: $e');
    }
  }

  // Initialize the model
  Future<void> initializeModel() async {
    if (_modelLoaded || _modelLoading) return;

    try {
      _modelLoading = true;
      _updateLoadingStatus('Inicializando modelo de avaliação de redações...');

      // In a real implementation, we would initialize the model here
      // For now, we'll just simulate it with a delay
      await Future.delayed(const Duration(seconds: 2));

      _modelLoaded = true;
      _modelLoading = false;
      _updateLoadingStatus('Modelo de avaliação inicializado com sucesso!');
      notifyListeners();
    } catch (e) {
      _modelLoading = false;
      _updateLoadingStatus('Erro ao inicializar modelo: $e');
      _logger.e('Error initializing model: $e');
      notifyListeners();
      rethrow;
    }
  }

  // Evaluate an essay
  Future<EssayEvaluation> evaluateEssay(String title, String text) async {
    // Check if model is available
    if (!_modelLoaded) {
      try {
        _updateLoadingStatus('Inicializando modelo de avaliação...');
        await initializeModel();
      } catch (e) {
        throw Exception('O modelo de IA não está disponível. Por favor, baixe o modelo para usar esta funcionalidade.');
      }
    }

    // If model is still not loaded, it means there was an error
    if (!_modelLoaded) {
      throw Exception('O modelo de IA não está disponível. Por favor, baixe o modelo para usar esta funcionalidade.');
    }

    // Count words and lines
    final wordCount = text.split(RegExp(r'\s+')).where((word) => word.isNotEmpty).length;
    final lineCount = text.split('\n').where((line) => line.trim().isNotEmpty).length;

    try {
      _updateLoadingStatus('Avaliando redação...');

      // In a real implementation, we would use the model to evaluate the essay
      // For now, we'll just create a mock evaluation
      final evaluation = _createMockEvaluation(title, text, wordCount, lineCount);

      // Save the evaluation
      _essays.add(evaluation);
      await _saveEssays();

      _updateLoadingStatus('Avaliação concluída!');
      notifyListeners();
      return evaluation;
    } catch (e) {
      _updateLoadingStatus('Erro na avaliação: $e');
      _logger.e('Error evaluating essay: $e');
      notifyListeners();
      rethrow;
    }
  }

  // Create a mock evaluation (for demonstration purposes)
  EssayEvaluation _createMockEvaluation(String title, String text, int wordCount, int lineCount) {
    // Generate random scores between 100 and 200
    final competency1 = 120 + (DateTime.now().millisecondsSinceEpoch % 80);
    final competency2 = 130 + (DateTime.now().millisecondsSinceEpoch % 70);
    final competency3 = 140 + (DateTime.now().millisecondsSinceEpoch % 60);
    final competency4 = 150 + (DateTime.now().millisecondsSinceEpoch % 50);
    final competency5 = 160 + (DateTime.now().millisecondsSinceEpoch % 40);

    final totalScore = competency1 + competency2 + competency3 + competency4 + competency5;

    return EssayEvaluation(
      id: const Uuid().v4(),
      text: text,
      title: title,
      timestamp: DateTime.now().millisecondsSinceEpoch,
      wordCount: wordCount,
      lineCount: lineCount,
      competencyScores: CompetencyScores(
        competency1: competency1,
        competency2: competency2,
        competency3: competency3,
        competency4: competency4,
        competency5: competency5,
      ),
      totalScore: totalScore,
      feedback: EssayFeedback(
        generalAnalysis: 'A redação apresenta boa estrutura argumentativa e domínio da norma culta, com alguns desvios pontuais. O tema foi compreendido e desenvolvido de forma adequada, com argumentos consistentes e boa articulação entre as ideias.',
        competency1Feedback: 'Demonstra bom domínio da norma culta, com poucos desvios gramaticais e de convenções da escrita.',
        competency2Feedback: 'Compreende bem a proposta e desenvolve o tema com consistência, apresentando bom repertório sociocultural.',
        competency3Feedback: 'Apresenta argumentação consistente, com bom desenvolvimento e conclusão coerente com a tese.',
        competency4Feedback: 'Articula bem as partes do texto, com algumas falhas pontuais na utilização de recursos coesivos.',
        competency5Feedback: 'Elabora proposta de intervenção relacionada ao tema, com consideração dos aspectos envolvidos.',
        summary: 'Pontos fortes: argumentação consistente, bom repertório sociocultural, proposta de intervenção detalhada. Aspectos a melhorar: pontuação em períodos compostos, aprofundamento do repertório, articulação entre argumentos.',
      ),
    );
  }

  // Get an essay by ID
  EssayEvaluation? getEssayById(String id) {
    try {
      return _essays.firstWhere((essay) => essay.id == id);
    } catch (e) {
      _logger.w('Essay not found: $id');
      return null;
    }
  }

  // Delete an essay by ID
  Future<bool> deleteEssay(String id) async {
    final initialLength = _essays.length;
    _essays.removeWhere((essay) => essay.id == id);

    if (initialLength != _essays.length) {
      await _saveEssays();
      notifyListeners();
      return true;
    }

    return false;
  }

  // Validate essay length
  Map<String, dynamic> validateEssayLength(String text) {
    const minWords = 120;
    const maxWords = 370;
    const minLines = 7;
    const maxLines = 30;

    final wordCount = text.split(RegExp(r'\s+')).where((word) => word.isNotEmpty).length;
    final lineCount = text.split('\n').where((line) => line.trim().isNotEmpty).length;

    bool valid = true;
    String? message;

    if (wordCount < minWords) {
      valid = false;
      message = 'Texto muito curto: $wordCount palavras. Mínimo: $minWords palavras.';
    } else if (wordCount > maxWords) {
      valid = false;
      message = 'Texto muito longo: $wordCount palavras. Máximo: $maxWords palavras.';
    } else if (lineCount < minLines) {
      valid = false;
      message = 'Poucas linhas: $lineCount linhas. Mínimo: $minLines linhas.';
    } else if (lineCount > maxLines) {
      valid = false;
      message = 'Muitas linhas: $lineCount linhas. Máximo: $maxLines linhas.';
    }

    return {
      'valid': valid,
      'wordCount': wordCount,
      'lineCount': lineCount,
      'minWords': minWords,
      'maxWords': maxWords,
      'minLines': minLines,
      'maxLines': maxLines,
      'message': message,
    };
  }

  // Update loading status
  void _updateLoadingStatus(String status) {
    _loadingStatus = status;
    _logger.i(status);
    notifyListeners();
  }
}
