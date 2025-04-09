import 'dart:convert';
import 'dart:math';
import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';
import 'package:uuid/uuid.dart';
import 'package:logger/logger.dart';

import '../models/models.dart';
import 'storage_service.dart';
import '../utils/logger_config.dart';

class DataService extends ChangeNotifier {
  // Data
  List<Exam> _exams = [];
  List<Question> _questions = [];
  List<UserAnswer> _userAnswers = [];
  List<StudySession> _studySessions = [];

  // Loading state
  bool _isLoading = true;
  String _loadingStatus = 'Carregando...';

  // Services
  late StorageService _storageService;
  final Logger _logger = LoggerConfig.getLogger();

  // Getters
  bool get isLoading => _isLoading;
  String get loadingStatus => _loadingStatus;
  List<Exam> get exams => _exams;
  List<Question> get questions => _questions;
  List<UserAnswer> get userAnswers => _userAnswers;
  List<StudySession> get studySessions => _studySessions;

  // Mock data for fallback
  final Map<String, dynamic> _mockData = {
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

  // Set the storage service
  void setStorageService(StorageService storageService) {
    _storageService = storageService;
    _loadUserData();
    // Load exam and question data
    loadLocalData();
  }

  // Load user data from storage
  void _loadUserData() {
    _userAnswers = _storageService.loadUserAnswers();
    _studySessions = _storageService.loadStudySessions();

    // Get app version for logging
    final appVersion = _storageService.getAppVersion();
    _logger.i('App version: $appVersion');
  }

  // Carrega os dados do arquivo JSON local - versão simplificada
  Future<void> loadLocalData() async {
    // Evite carregar os dados novamente se já estiverem carregados
    if (_questions.isNotEmpty && _exams.isNotEmpty) {
      _logger.i('Dados já carregados, pulando carregamento');
      return;
    }

    try {
      // Inicialize o estado de carregamento
      _isLoading = true;
      _loadingStatus = 'Carregando dados do ENEM...';
      notifyListeners();

      // Inicialize as estruturas de dados
      _exams = [];
      _questions = [];

      try {
        // Defina o caminho do arquivo JSON
        const String filePath = 'assets/json/questions.json';
        _logger.i('Carregando questões do arquivo: $filePath');

        // Atualize a mensagem de carregamento
        _loadingStatus = 'Carregando questões...';
        notifyListeners();

        // Carregue as questões do arquivo JSON
        final List<Question> loadedQuestions = await _loadQuestionData(filePath);

        // Se não houver questões, use os dados de exemplo
        if (loadedQuestions.isEmpty) {
          _logger.w('Nenhuma questão carregada, usando dados de exemplo');
          _loadMockData();
          _isLoading = false;
          _loadingStatus = '';
          notifyListeners();
          return;
        }

        // Atualize a mensagem de carregamento
        _loadingStatus = 'Organizando questões por ano...';
        notifyListeners();

        // Armazene as questões carregadas
        _questions = loadedQuestions;

        // Extraia os anos disponíveis
        final Set<int> years = _questions.map((q) => q.year).toSet();
        _logger.i('Encontrados ${years.length} anos diferentes');

        // Crie objetos de exame para cada ano
        _exams = years.map((year) => Exam(
          year: year,
          title: 'ENEM $year',
          disciplines: _mockData['exams'][0]['disciplines'].map<Discipline>((d) => Discipline.fromJson(d)).toList(),
          languages: _mockData['exams'][0]['languages'].map<Language>((l) => Language.fromJson(l)).toList(),
        )).toList()..sort((a, b) => b.year.compareTo(a.year));

        // Finalize o carregamento
        _isLoading = false;
        _loadingStatus = '';
        notifyListeners();

        _logger.i('Dados carregados com sucesso: ${_questions.length} questões em ${_exams.length} exames');
      } catch (jsonError) {
        _logger.e('Erro ao carregar dados do JSON: $jsonError');

        // Use dados de exemplo como último recurso
        _logger.w('Usando dados de exemplo como último recurso');
        _loadMockData();

        // Atualize o estado
        _isLoading = false;
        _loadingStatus = '';
        notifyListeners();
      }
    } catch (error) {
      _loadingStatus = 'Erro ao carregar dados: $error';
      _logger.e(_loadingStatus);

      // Garanta que o estado seja atualizado mesmo em caso de erro
      _isLoading = false;
      notifyListeners();
    }
  }

  // Load mock data
  void _loadMockData() {
    try {
      _loadingStatus = 'Carregando dados de exemplo...';

      // Parse exams
      final List<dynamic> examsJson = _mockData['exams'];
      _exams = examsJson.map((json) => Exam.fromJson(json)).toList();

      // Parse questions
      final List<dynamic> questionsJson = _mockData['questions'];
      _questions = questionsJson.map((json) => Question.fromJson(json)).toList();

      _loadingStatus = 'Dados de exemplo carregados com sucesso';
    } catch (e) {
      _logger.e('Error loading mock data: $e');
      _exams = [];
      _questions = [];
      _loadingStatus = 'Erro ao carregar dados de exemplo: $e';
    }
  }

  // Load question data from a JSON file - simplified version
  Future<List<Question>> _loadQuestionData(String filePath) async {
    try {
      // Load the JSON file directly from assets
      _logger.i('Carregando arquivo JSON: $filePath');
      final String jsonData = await rootBundle.loadString(filePath);
      _logger.i('Arquivo JSON carregado com sucesso');

      // Decode the JSON data
      final List<dynamic> jsonList = jsonDecode(jsonData) as List<dynamic>;
      _logger.i('JSON decodificado com sucesso: ${jsonList.length} questões encontradas');

      // Convert each JSON object to a Question
      final List<Question> questions = [];

      for (int i = 0; i < jsonList.length; i++) {
        try {
          final Map<String, dynamic> questionJson = jsonList[i] as Map<String, dynamic>;
          final Question question = Question.fromJson(questionJson);
          questions.add(question);
        } catch (e) {
          _logger.e('Erro ao processar questão $i: $e');
          // Continue processing other questions
        }
      }

      _logger.i('${questions.length} questões processadas com sucesso');
      return questions;
    } catch (e) {
      _logger.e('Erro ao carregar questões: $e');
      return [];
    }
  }

  // Get questions by year
  List<Question> getQuestionsByYear(int year) {
    return _questions.where((q) => q.year == year).toList();
  }

  // Get questions by discipline
  List<Question> getQuestionsByDiscipline(String discipline) {
    return _questions.where((q) => q.discipline == discipline).toList();
  }

  // Get disciplines with questions
  List<String> getDisciplinesWithQuestions() {
    final Set<String> disciplines = _questions.map((q) => q.discipline).toSet();

    // If we have questions but no disciplines, add default disciplines
    if (disciplines.isEmpty && _questions.isNotEmpty) {
      disciplines.add('ciencias-humanas');
      disciplines.add('ciencias-natureza');
      disciplines.add('linguagens');
      disciplines.add('matematica');
    }

    return disciplines.toList();
  }

  // Get questions by language
  List<Question> getQuestionsByLanguage(String language) {
    return _questions.where((q) => q.language == language).toList();
  }

  // Get question by ID
  Question? getQuestionById(String id) {
    if (id.isEmpty) return null;

    final parts = id.split('-');
    if (parts.length != 2) {
      _logger.w('Invalid question ID format: $id');
      return null;
    }

    final int year = int.tryParse(parts[0]) ?? 0;
    final int index = int.tryParse(parts[1]) ?? 0;

    if (year == 0 || index == 0) {
      _logger.w('Invalid question ID numbers: $id');
      return null;
    }

    return _questions.firstWhere(
      (q) => q.year == year && q.index == index,
      orElse: () => throw Exception('Question not found: $id'),
    );
  }

  // Save user answer
  void saveUserAnswer(String questionId, String selectedAlternative, bool isCorrect, [String? studySessionId]) {
    final answer = UserAnswer(
      questionId: questionId,
      selectedAlternative: selectedAlternative,
      isCorrect: isCorrect,
      timestamp: DateTime.now().millisecondsSinceEpoch,
      studySession: studySessionId,
    );

    // Update if exists, otherwise add
    final existingIndex = _userAnswers.indexWhere((a) => a.questionId == questionId);
    if (existingIndex >= 0) {
      // Preserve viewedLesson status if it exists
      final viewedLesson = _userAnswers[existingIndex].viewedLesson;
      _userAnswers[existingIndex] = answer.copyWith(viewedLesson: viewedLesson);
    } else {
      _userAnswers.add(answer);
    }

    // Update study session if provided
    if (studySessionId != null) {
      final sessionIndex = _studySessions.indexWhere((s) => s.id == studySessionId);
      if (sessionIndex >= 0) {
        _studySessions[sessionIndex].questionsAnswered++;
        if (isCorrect) {
          _studySessions[sessionIndex].correctAnswers++;
        }
      }
    }

    // Save to storage
    _storageService.saveUserAnswers(_userAnswers);
    _storageService.saveStudySessions(_studySessions);

    notifyListeners();
  }

  // Record lesson view
  void recordLessonView(String questionId, [String? studySessionId]) {
    // Find the answer for this question
    final answerIndex = _userAnswers.indexWhere((a) => a.questionId == questionId);

    if (answerIndex >= 0) {
      // Update the existing answer
      _userAnswers[answerIndex] = _userAnswers[answerIndex].copyWith(viewedLesson: true);
    } else {
      // Create a new record just for the lesson view
      _userAnswers.add(UserAnswer(
        questionId: questionId,
        selectedAlternative: '',
        isCorrect: false,
        timestamp: DateTime.now().millisecondsSinceEpoch,
        viewedLesson: true,
        studySession: studySessionId,
      ));
    }

    // Update study session if provided
    if (studySessionId != null) {
      final sessionIndex = _studySessions.indexWhere((s) => s.id == studySessionId);
      if (sessionIndex >= 0) {
        _studySessions[sessionIndex].lessonsViewed++;
      }
    }

    // Save to storage
    _storageService.saveUserAnswers(_userAnswers);
    _storageService.saveStudySessions(_studySessions);

    notifyListeners();
  }

  // Create study session
  StudySession createStudySession(List<String> disciplines, int questionCount) {
    final session = StudySession(
      id: const Uuid().v4(),
      timestamp: DateTime.now().millisecondsSinceEpoch,
      disciplines: disciplines,
      questionCount: questionCount,
    );

    _studySessions.add(session);
    _storageService.saveStudySessions(_studySessions);

    notifyListeners();
    return session;
  }

  // Get study session by ID
  StudySession? getStudySessionById(String id) {
    return _studySessions.firstWhere(
      (s) => s.id == id,
      orElse: () => throw Exception('Study session not found: $id'),
    );
  }

  // Get random questions for study
  List<Question> getRandomQuestionsForStudy(List<String> disciplines, int count, [bool excludeAnswered = false]) {
    // Get all questions for the selected disciplines
    List<Question> availableQuestions = _questions.where((q) => disciplines.contains(q.discipline)).toList();

    // Optionally exclude already answered questions
    if (excludeAnswered) {
      final answeredIds = _userAnswers.map((a) => a.questionId).toSet();
      availableQuestions = availableQuestions.where((q) => !answeredIds.contains(q.id)).toList();
    }

    // If we don't have enough questions, just return what we have
    if (availableQuestions.length <= count) {
      return availableQuestions;
    }

    // Ensure we have questions from all selected disciplines if possible
    final result = <Question>[];
    final questionsPerDiscipline = <String, List<Question>>{};

    // Group questions by discipline
    for (final question in availableQuestions) {
      if (!questionsPerDiscipline.containsKey(question.discipline)) {
        questionsPerDiscipline[question.discipline] = [];
      }
      questionsPerDiscipline[question.discipline]!.add(question);
    }

    // Shuffle each discipline's questions
    for (final discipline in questionsPerDiscipline.keys) {
      questionsPerDiscipline[discipline] = _shuffleList(questionsPerDiscipline[discipline]!);
    }

    // Calculate how many questions to take from each discipline
    final disciplinesWithQuestions = questionsPerDiscipline.keys.toList();
    final questionsPerDisciplineCount = max(1, count ~/ disciplinesWithQuestions.length);

    // Take questions from each discipline
    for (final discipline in disciplinesWithQuestions) {
      final disciplineQuestions = questionsPerDiscipline[discipline]!;
      final toTake = min(questionsPerDisciplineCount, disciplineQuestions.length);
      result.addAll(disciplineQuestions.sublist(0, toTake));
    }

    // If we still need more questions, take them from any discipline
    if (result.length < count) {
      // Flatten all remaining questions
      final remainingQuestions = _shuffleList(
        disciplinesWithQuestions.expand((discipline) {
          final taken = min(questionsPerDisciplineCount, questionsPerDiscipline[discipline]!.length);
          return questionsPerDiscipline[discipline]!.sublist(taken);
        }).toList()
      );

      // Add remaining questions up to the count
      result.addAll(remainingQuestions.sublist(0, min(remainingQuestions.length, count - result.length)));
    }

    // If we have too many questions, trim the result
    if (result.length > count) {
      return result.sublist(0, count);
    }

    return result;
  }

  // Shuffle a list
  List<T> _shuffleList<T>(List<T> list) {
    final random = Random();
    final result = List<T>.from(list);

    for (int i = result.length - 1; i > 0; i--) {
      final j = random.nextInt(i + 1);
      final temp = result[i];
      result[i] = result[j];
      result[j] = temp;
    }

    return result;
  }

  // Get user statistics
  Map<String, dynamic> getUserStatistics() {
    final total = _userAnswers.length;
    final correct = _userAnswers.where((a) => a.isCorrect).length;
    final incorrect = total - correct;
    final accuracy = total > 0 ? (correct / total) * 100 : 0;
    final lessonsViewed = _userAnswers.where((a) => a.viewedLesson).length;

    // Get statistics by discipline
    final disciplineStats = <String, Map<String, int>>{};

    for (final answer in _userAnswers) {
      try {
        final question = getQuestionById(answer.questionId);
        if (question != null) {
          final discipline = question.discipline;
          if (!disciplineStats.containsKey(discipline)) {
            disciplineStats[discipline] = {'total': 0, 'correct': 0, 'lessonsViewed': 0};
          }
          disciplineStats[discipline]!['total'] = (disciplineStats[discipline]!['total'] ?? 0) + 1;
          if (answer.isCorrect) {
            disciplineStats[discipline]!['correct'] = (disciplineStats[discipline]!['correct'] ?? 0) + 1;
          }
          if (answer.viewedLesson) {
            disciplineStats[discipline]!['lessonsViewed'] = (disciplineStats[discipline]!['lessonsViewed'] ?? 0) + 1;
          }
        }
      } catch (e) {
        // Question not found, skip it
        _logger.e('Error getting question for statistics: $e');
      }
    }

    return {
      'total': total,
      'correct': correct,
      'incorrect': incorrect,
      'accuracy': accuracy,
      'lessonsViewed': lessonsViewed,
      'disciplineStats': disciplineStats,
    };
  }
}
