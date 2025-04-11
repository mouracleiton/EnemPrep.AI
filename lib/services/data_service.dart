import 'dart:convert';
import 'dart:math';
import 'dart:io';
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
  bool _dataLoaded = false;

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
        "title": "Questão 1 - Ciências Humanas",
        "index": 1,
        "discipline": "ciencias-humanas",
        "language": null,
        "year": 2023,
        "context": "Considere a seguinte situação-problema relacionada à história do Brasil: A Lei de Terras de 1850 estabeleceu que a aquisição de terras públicas só poderia ocorrer mediante compra, e não mais por meio de posse ou doação. Essa lei foi promulgada no mesmo ano da Lei Eusébio de Queiroz, que proibiu o tráfico de escravos para o Brasil.",
        "files": [],
        "correctAlternative": "A",
        "alternativesIntroduction": "Assinale a alternativa que explica corretamente a relação entre essas duas leis:",
        "alternatives": [
          {
            "letter": "A",
            "text": "A Lei de Terras dificultava o acesso à propriedade por parte dos escravos libertos, garantindo a disponibilidade de mão de obra para as grandes propriedades.",
            "file": null,
            "isCorrect": true
          },
          {
            "letter": "B",
            "text": "A Lei de Terras facilitava a aquisição de terras pelos escravos libertos, como forma de compensação pelo fim do tráfico negreiro.",
            "file": null,
            "isCorrect": false
          },
          {
            "letter": "C",
            "text": "As duas leis não possuem relação entre si, sendo apenas coincidência terem sido promulgadas no mesmo ano.",
            "file": null,
            "isCorrect": false
          },
          {
            "letter": "D",
            "text": "A Lei de Terras foi criada para incentivar a imigração europeia, sem qualquer relação com a questão da escravidão.",
            "file": null,
            "isCorrect": false
          },
          {
            "letter": "E",
            "text": "A Lei de Terras estabelecia cotas de terras a serem distribuídas gratuitamente aos escravos libertos.",
            "file": null,
            "isCorrect": false
          }
        ],
        "lesson": "A Lei de Terras de 1850 e a Lei Eusébio de Queiroz estão intimamente relacionadas ao processo de transição do trabalho escravo para o trabalho livre no Brasil. Ao estabelecer a compra como única forma de aquisição de terras, a Lei de Terras criava uma barreira para que os escravos libertos e imigrantes pobres pudessem se tornar proprietários, garantindo assim a disponibilidade de mão de obra para as grandes fazendas. Essa medida foi uma estratégia das elites agrárias para manter o controle sobre a terra e o trabalho em um contexto de crise do sistema escravista."
      },
      {
        "title": "Questão 2 - Ciências da Natureza",
        "index": 2,
        "discipline": "ciencias-natureza",
        "language": null,
        "year": 2023,
        "context": "Em um experimento de laboratório, um estudante observou que, ao adicionar uma solução de hidróxido de sódio (NaOH) a uma solução contendo íons de ferro (Fe3+), formou-se um precipitado de cor marrom-avermelhada. Esse precipitado é o hidróxido de ferro III [Fe(OH)3].",
        "files": [],
        "correctAlternative": "D",
        "alternativesIntroduction": "A equação química balanceada que representa corretamente essa reação é:",
        "alternatives": [
          {
            "letter": "A",
            "text": "Fe3+ + OH- → Fe(OH)3",
            "file": null,
            "isCorrect": false
          },
          {
            "letter": "B",
            "text": "Fe3+ + 3OH- → Fe(OH)3",
            "file": null,
            "isCorrect": false
          },
          {
            "letter": "C",
            "text": "Fe3+ + NaOH → Fe(OH)3 + Na3+",
            "file": null,
            "isCorrect": false
          },
          {
            "letter": "D",
            "text": "Fe3+ + 3NaOH → Fe(OH)3 + 3Na+",
            "file": null,
            "isCorrect": true
          },
          {
            "letter": "E",
            "text": "3Fe + NaOH → Fe(OH)3 + 3Na",
            "file": null,
            "isCorrect": false
          }
        ],
        "lesson": "Nesta reação química, ocorre a formação de um precipitado de hidróxido de ferro III a partir da reação entre íons Fe3+ e hidróxido de sódio (NaOH). Para balancear corretamente a equação, é necessário considerar que cada íon Fe3+ reage com três moléculas de NaOH para formar uma molécula de Fe(OH)3 e três íons Na+. O balanceamento correto é essencial para garantir a conservação da massa e da carga elétrica na reação química."
      },
      {
        "title": "Questão 3 - Linguagens",
        "index": 3,
        "discipline": "linguagens",
        "language": null,
        "year": 2023,
        "context": "Leia o seguinte trecho do poema 'Vou-me embora pra Pasárgada', de Manuel Bandeira:\n\nVou-me embora pra Pasárgada\nLá sou amigo do rei\nLá tenho a mulher que eu quero\nNa cama que escolherei\nVou-me embora pra Pasárgada\n\nVou-me embora pra Pasárgada\nAqui eu não sou feliz\nLá a existência é uma aventura\nDe tal modo inconsequente\nQue Joana a Louca de Espanha\nRainha e falsa demente\nVem a ser contraparente\nDa nora que nunca tive",
        "files": [],
        "correctAlternative": "B",
        "alternativesIntroduction": "Sobre o poema de Manuel Bandeira, é correto afirmar que:",
        "alternatives": [
          {
            "letter": "A",
            "text": "Representa uma crítica direta ao regime político da época, usando Pasárgada como metáfora para um país democrático.",
            "file": null,
            "isCorrect": false
          },
          {
            "letter": "B",
            "text": "Expressa o desejo de evasão da realidade para um lugar idealizado, onde o eu-lírico poderia realizar seus desejos e fantasias.",
            "file": null,
            "isCorrect": true
          },
          {
            "letter": "C",
            "text": "Descreve uma viagem real que o poeta fez à antiga cidade de Pasárgada, na Pérsia.",
            "file": null,
            "isCorrect": false
          },
          {
            "letter": "D",
            "text": "Representa uma homenagem à cultura persa e sua influência na literatura brasileira modernista.",
            "file": null,
            "isCorrect": false
          },
          {
            "letter": "E",
            "text": "É um manifesto político que defende a monarquia como forma ideal de governo, simbolizada pela amizade com o rei.",
            "file": null,
            "isCorrect": false
          }
        ],
        "lesson": "O poema 'Vou-me embora pra Pasárgada', de Manuel Bandeira, é uma das obras mais emblemáticas do Modernismo brasileiro. Nele, o poeta cria um lugar imaginário e utópico chamado Pasárgada (inspirado na antiga capital do império persa), para onde deseja fugir da realidade opressora. Pasárgada representa um refúgio idealizado onde todos os desejos e fantasias do eu-lírico poderiam ser realizados, em contraste com sua vida real marcada por limitações e frustrações. O poema expressa o tema da evasão, muito comum na obra de Bandeira, que sofria de tuberculose e via na literatura uma forma de transcender suas limitações físicas e sociais."
      },
      {
        "title": "Questão 4 - Matemática",
        "index": 4,
        "discipline": "matematica",
        "language": null,
        "year": 2023,
        "context": "Um reservatório de água em formato de um prisma reto retangular possui dimensões internas de 4 metros de comprimento, 3 metros de largura e 2 metros de altura. O reservatório está inicialmente vazio e começa a ser preenchido por uma torneira que despeja água a uma vazão constante de 360 litros por hora.",
        "files": [],
        "correctAlternative": "C",
        "alternativesIntroduction": "Quanto tempo, em horas, será necessário para encher completamente o reservatório?",
        "alternatives": [
          {
            "letter": "A",
            "text": "6 horas",
            "file": null,
            "isCorrect": false
          },
          {
            "letter": "B",
            "text": "24 horas",
            "file": null,
            "isCorrect": false
          },
          {
            "letter": "C",
            "text": "66,7 horas",
            "file": null,
            "isCorrect": true
          },
          {
            "letter": "D",
            "text": "72 horas",
            "file": null,
            "isCorrect": false
          },
          {
            "letter": "E",
            "text": "120 horas",
            "file": null,
            "isCorrect": false
          }
        ],
        "lesson": "Para resolver este problema, precisamos calcular o volume do reservatório e depois determinar quanto tempo será necessário para preencher esse volume com a vazão dada.\n\nVolume do reservatório = comprimento × largura × altura\nVolume = 4 m × 3 m × 2 m = 24 m³\n\nComo 1 m³ = 1.000 litros, o volume em litros é:\nVolume = 24 × 1.000 = 24.000 litros\n\nAgora, calculamos o tempo necessário:\nTempo = Volume ÷ Vazão\nTempo = 24.000 litros ÷ 360 litros/hora = 66,67 horas\n\nPortanto, serão necessárias aproximadamente 66,7 horas para encher completamente o reservatório."
      },
      {
        "title": "Questão 5 - Ciências Humanas",
        "index": 5,
        "discipline": "ciencias-humanas",
        "language": null,
        "year": 2023,
        "context": "A Revolução Industrial, iniciada na Inglaterra no século XVIII, provocou profundas transformações nas relações de trabalho e na organização social. O processo de industrialização foi marcado pela substituição do trabalho artesanal pelo assalariado e pelo uso de máquinas.",
        "files": [],
        "correctAlternative": "E",
        "alternativesIntroduction": "Entre as consequências sociais da Revolução Industrial, pode-se destacar:",
        "alternatives": [
          {
            "letter": "A",
            "text": "A valorização do trabalho artesanal e das corporações de ofício medievais.",
            "file": null,
            "isCorrect": false
          },
          {
            "letter": "B",
            "text": "A redução da jornada de trabalho e a melhoria imediata das condições de vida dos trabalhadores.",
            "file": null,
            "isCorrect": false
          },
          {
            "letter": "C",
            "text": "O fortalecimento da aristocracia rural como principal classe detentora do poder econômico.",
            "file": null,
            "isCorrect": false
          },
          {
            "letter": "D",
            "text": "A diminuição da população urbana e o retorno dos trabalhadores ao campo.",
            "file": null,
            "isCorrect": false
          },
          {
            "letter": "E",
            "text": "O crescimento desordenado das cidades e a formação de bairros operários com condições precárias de moradia.",
            "file": null,
            "isCorrect": true
          }
        ],
        "lesson": "A Revolução Industrial provocou um intenso êxodo rural, com grandes massas de camponeses migrando para as cidades em busca de trabalho nas fábricas. Esse processo resultou em um crescimento urbano acelerado e desordenado, sem planejamento adequado de infraestrutura. Os bairros operários que se formaram ao redor das fábricas eram caracterizados por condições precárias de moradia, com habitações superlotadas, falta de saneamento básico e altos índices de doenças. As jornadas de trabalho eram extenuantes, chegando a 14-16 horas diárias, com baixos salários e condições insalubres nas fábricas. Essas condições levaram ao surgimento dos primeiros movimentos operários organizados e às primeiras teorias socialistas que criticavam o sistema capitalista industrial."
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
    if (_dataLoaded) {
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
        const String assetFilePath = 'assets/json/questions.json';
        const String absoluteFilePath = '/Users/cleitonmouraloura/Documents/Projetos ENEM/EnemPrep.AI/assets/json/questions.json';

        _logger.i('Tentando carregar questões do arquivo absoluto: $absoluteFilePath');

        // Atualize a mensagem de carregamento
        _loadingStatus = 'Carregando questões...';
        notifyListeners();

        // Primeiro tente carregar do caminho absoluto
        List<Question> loadedQuestions = await _loadQuestionDataFromFile(absoluteFilePath);

        // Se falhar, tente carregar do asset
        if (loadedQuestions.isEmpty) {
          _logger.i('Falha ao carregar do caminho absoluto, tentando carregar do asset: $assetFilePath');
          loadedQuestions = await _loadQuestionData(assetFilePath);
        }

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

        // Get unique disciplines and languages from questions
        final Set<Discipline> disciplines = _questions.map((q) => Discipline(label: q.discipline, value: q.discipline)).toSet();
        final Set<Language> languages = _questions.where((q) => q.language != null).map((q) => Language(label: q.language!, value: q.language!)).toSet();

        // Create exam objects for each year
        _exams = years.map((year) => Exam(
          year: year,
          title: 'ENEM $year',
          disciplines: disciplines.toList(),
          languages: languages.toList(),
        )).toList()..sort((a, b) => b.year.compareTo(a.year));

        // Finalize o carregamento
        _isLoading = false;
        _loadingStatus = '';
        _dataLoaded = true;
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

  // Load question data from a JSON file in assets - simplified version
  Future<List<Question>> _loadQuestionData(String filePath) async {
    try {
      // Load the JSON file directly from assets
      _logger.i('Carregando arquivo JSON do asset: $filePath');
      final String jsonData = await rootBundle.loadString(filePath);
      _logger.i('Arquivo JSON carregado com sucesso');

      return _processJsonData(jsonData);
    } catch (e) {
      _logger.e('Erro ao carregar questões do asset: $e');
      return [];
    }
  }

  // Load question data from a file in the file system
  Future<List<Question>> _loadQuestionDataFromFile(String filePath) async {
    try {
      // Load the JSON file from the file system
      _logger.i('Carregando arquivo JSON do sistema de arquivos: $filePath');
      final file = File(filePath);

      // Check if file exists
      if (!await file.exists()) {
        _logger.e('Arquivo não encontrado: $filePath');
        return [];
      }

      final String jsonData = await file.readAsString();
      _logger.i('Arquivo JSON carregado com sucesso');

      return _processJsonData(jsonData);
    } catch (e) {
      _logger.e('Erro ao carregar questões do arquivo: $e');
      return [];
    }
  }

  // Process JSON data and convert to Question objects
  List<Question> _processJsonData(String jsonData) {
    try {
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
      _logger.e('Erro ao processar dados JSON: $e');
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

  // Get all questions
  List<Question> getAllQuestions() {
    return List<Question>.from(_questions);
  }

  // Get question by ID
  Question? getQuestionById(String id) {
    if (id.isEmpty) {
      _logger.w('Empty question ID');
      return null;
    }

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

    try {
      return _questions.firstWhere(
        (q) => q.year == year && q.index == index,
      );
    } catch (e) {
      _logger.w('Question not found: $id');
      return null;
    }
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
    try {
      return _studySessions.firstWhere(
        (s) => s.id == id,
      );
    } catch (e) {
      _logger.w('Study session not found: $id');
      return null;
    }
  }

  // Get random questions for study
  List<Question> getRandomQuestionsForStudy(List<String> disciplines, int count, [bool excludeAnswered = false]) {
    _logger.i('Buscando $count questões para as disciplinas: $disciplines');
    _logger.i('Total de questões disponíveis: ${_questions.length}');

    // Get all questions for the selected disciplines
    List<Question> availableQuestions = _questions.where((q) => disciplines.contains(q.discipline)).toList();
    _logger.i('Questões filtradas por disciplina: ${availableQuestions.length}');

    // Optionally exclude already answered questions
    if (excludeAnswered) {
      final answeredIds = _userAnswers.map((a) => a.questionId).toSet();
      _logger.i('Questões já respondidas: ${answeredIds.length}');
      availableQuestions = availableQuestions.where((q) => !answeredIds.contains(q.id)).toList();
      _logger.i('Questões após excluir respondidas: ${availableQuestions.length}');
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
      final trimmedResult = result.sublist(0, count);
      _logger.i('Retornando ${trimmedResult.length} questões (limitado ao máximo solicitado)');
      return trimmedResult;
    }

    _logger.i('Retornando ${result.length} questões');
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
