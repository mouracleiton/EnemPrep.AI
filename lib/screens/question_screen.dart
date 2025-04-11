import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:logger/logger.dart';

import '../models/models.dart';
import '../services/services.dart';
import '../theme/app_theme.dart';
import '../widgets/question_image.dart';
import '../widgets/markdown_body.dart';
import '../utils/logger_config.dart';

class QuestionScreen extends StatefulWidget {
  final String questionId;
  final String? studySessionId;

  const QuestionScreen({
    super.key,
    required this.questionId,
    this.studySessionId,
  });

  @override
  String toString({DiagnosticLevel minLevel = DiagnosticLevel.info}) {
    return 'QuestionScreen(questionId: $questionId, studySessionId: $studySessionId)';
  }

  @override
  State<QuestionScreen> createState() => _QuestionScreenState();
}

class _QuestionScreenState extends State<QuestionScreen> {
  final Logger _logger = LoggerConfig.getLogger();
  Question? _question;
  String? _selectedAlternative;
  bool _answered = false;
  bool _isCorrect = false;

  @override
  void initState() {
    super.initState();
    _logger.i('QuestionScreen inicializada com questionId: ${widget.questionId}, studySessionId: ${widget.studySessionId}');
    _loadQuestion();
  }

  void _loadQuestion() {
    _logger.i('Carregando questão com ID: ${widget.questionId}');
    _logger.i('ID da sessão de estudo: ${widget.studySessionId}');

    // Verificar se o ID da questão está no formato correto (ano-índice)
    final parts = widget.questionId.split('-');
    if (parts.length != 2) {
      _logger.e('Formato de ID de questão inválido: ${widget.questionId}');
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Formato de ID de questão inválido')),
      );
      if (widget.studySessionId != null) {
        _tryLoadNextQuestion();
      } else {
        context.go('/');
      }
      return;
    }

    final year = int.tryParse(parts[0]);
    final index = int.tryParse(parts[1]);
    if (year == null || index == null) {
      _logger.e('Números inválidos no ID da questão: ${widget.questionId}');
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Números inválidos no ID da questão')),
      );
      if (widget.studySessionId != null) {
        _tryLoadNextQuestion();
      } else {
        context.go('/');
      }
      return;
    }

    _logger.i('ID da questão validado: ano=$year, índice=$index');

    final dataService = Provider.of<DataService>(context, listen: false);
    try {
      _logger.i('Buscando questão no DataService...');
      final question = dataService.getQuestionById(widget.questionId);

      if (question == null) {
        _logger.e('Questão não encontrada: ${widget.questionId}');

        // Verificar se há questões disponíveis
        _logger.i('Verificando total de questões disponíveis...');
        final allQuestions = dataService.getAllQuestions();
        _logger.i('Total de questões disponíveis: ${allQuestions.length}');

        if (allQuestions.isNotEmpty) {
          _logger.i('Exemplo de questão disponível: ${allQuestions.first.id} (${allQuestions.first.title})');
        }

        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Questão não encontrada')),
        );

        // Em vez de voltar para a tela inicial, vamos tentar obter outra questão da sessão
        if (widget.studySessionId != null) {
          _tryLoadNextQuestion();
        } else {
          context.go('/');
        }
        return;
      }

      _logger.i('Questão carregada com sucesso: ${question.title}');
      _logger.i('Detalhes da questão: ano=${question.year}, índice=${question.index}, disciplina=${question.discipline}');
      setState(() {
        _question = question;
      });
    } catch (e) {
      _logger.e('Erro ao carregar questão ${widget.questionId}: $e');
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Erro ao carregar questão: $e')),
      );
      // Em vez de voltar para a tela inicial, vamos tentar obter outra questão da sessão
      if (widget.studySessionId != null) {
        _tryLoadNextQuestion();
      } else {
        context.go('/');
      }
    }
  }

  void _tryLoadNextQuestion() {
    _logger.i('Tentando carregar outra questão da sessão ${widget.studySessionId}');
    final dataService = Provider.of<DataService>(context, listen: false);

    try {
      // Verificar se o ID da sessão é válido
      if (widget.studySessionId == null || widget.studySessionId!.isEmpty) {
        _logger.e('ID da sessão de estudo inválido ou vazio');
        context.go('/');
        return;
      }

      _logger.i('Buscando sessão de estudo com ID: ${widget.studySessionId}');

      // Obter a sessão de estudo
      final session = dataService.getStudySessionById(widget.studySessionId!);

      if (session == null) {
        _logger.e('Sessão de estudo não encontrada: ${widget.studySessionId}');

        // Verificar sessões disponíveis
        final allSessions = dataService.studySessions;
        _logger.i('Total de sessões disponíveis: ${allSessions.length}');

        if (allSessions.isNotEmpty) {
          _logger.i('Exemplo de sessão disponível: ${allSessions.first.id}');
        }

        context.go('/');
        return;
      }

      _logger.i('Sessão de estudo encontrada: ${session.id}');
      _logger.i('Disciplinas da sessão: ${session.disciplines}');
      _logger.i('Questões respondidas: ${session.questionsAnswered}/${session.questionCount}');

      // Obter mais questões da mesma sessão
      _logger.i('Buscando mais questões para a sessão...');
      final questions = dataService.getRandomQuestionsForStudy(
        session.disciplines,
        1, // Apenas uma questão
        true, // Excluir questões já respondidas
      );

      _logger.i('Questões encontradas: ${questions.length}');

      if (questions.isNotEmpty) {
        final nextQuestion = questions.first;
        _logger.i('Nova questão encontrada: ${nextQuestion.id}');
        _logger.i('Título da nova questão: ${nextQuestion.title}');
        _logger.i('Disciplina da nova questão: ${nextQuestion.discipline}');

        // Construir a URL de navegação
        final navigationUrl = '/question/${nextQuestion.id}?studySessionId=${widget.studySessionId}';
        _logger.i('URL de navegação: $navigationUrl');

        // Navegar para a nova questão usando push em vez de go
        context.push(navigationUrl);
      } else {
        _logger.w('Não há mais questões disponíveis para esta sessão');
        // Se não houver mais questões, ir para a tela de resultados
        context.go('/study-results/${widget.studySessionId}');
      }
    } catch (e) {
      _logger.e('Erro ao tentar carregar outra questão: $e');
      // Em caso de erro, voltar para a tela inicial
      context.go('/');
    }
  }

  void _handleSelectAlternative(String letter) {
    if (!_answered) {
      setState(() {
        _selectedAlternative = letter;
      });
    }
  }

  void _handleSubmit() {
    if (_selectedAlternative == null || _question == null) return;

    final dataService = Provider.of<DataService>(context, listen: false);
    final correct = _selectedAlternative == _question!.correctAlternative;

    setState(() {
      _isCorrect = correct;
      _answered = true;
    });

    // Save the answer
    dataService.saveUserAnswer(
      widget.questionId,
      _selectedAlternative!,
      correct,
      widget.studySessionId,
    );
  }

  void _handleViewLesson() {
    if (_question?.lesson == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Esta questão não possui aula disponível')),
      );
      return;
    }

    final dataService = Provider.of<DataService>(context, listen: false);
    dataService.recordLessonView(widget.questionId, widget.studySessionId);

    // Navigate to lesson screen
    final studySessionParam = widget.studySessionId != null
        ? '?studySessionId=${widget.studySessionId!}'
        : '';
    context.go('/lesson/${widget.questionId}$studySessionParam');
  }

  void _handleNextQuestion() {
    if (_question == null) return;

    final dataService = Provider.of<DataService>(context, listen: false);
    _logger.i('Navegando para a próxima questão');
    _logger.i('ID da questão atual: ${widget.questionId}');
    _logger.i('ID da sessão de estudo: ${widget.studySessionId}');

    // If we're in a study session, check if there are more questions
    if (widget.studySessionId != null) {
      try {
        final session = dataService.getStudySessionById(widget.studySessionId!);

        if (session != null && session.questionsAnswered < session.questionCount) {
          _logger.i('Sessão de estudo em andamento: ${session.questionsAnswered}/${session.questionCount} questões respondidas');

          // Get more questions from the same disciplines
          final questions = dataService.getRandomQuestionsForStudy(
            session.disciplines,
            1, // Just get one more question
            true, // Exclude already answered questions
          );

          _logger.i('Encontradas ${questions.length} questões para continuar a sessão');

          if (questions.isNotEmpty) {
            final nextQuestion = questions.first;
            _logger.i('Próxima questão: ${nextQuestion.id}');

            final studySessionParam = widget.studySessionId != null
                ? '?studySessionId=${widget.studySessionId!}'
                : '';
            _logger.i('Navegando para: /question/${nextQuestion.id}$studySessionParam');

            context.push('/question/${nextQuestion.id}$studySessionParam');
            return;
          } else {
            _logger.w('Não há mais questões disponíveis para esta sessão');
          }
        } else {
          _logger.i('Sessão de estudo concluída: ${session?.questionsAnswered}/${session?.questionCount} questões respondidas');
        }

        // If we've reached the end of the study session or no more questions,
        // navigate to the study results screen
        context.go('/study-results/${widget.studySessionId}');
        return;
      } catch (e) {
        _logger.e('Error navigating to next question: $e');
        // Fall back to default behavior
      }
    }

    // Default behavior for non-study session questions
    try {
      final questions = dataService.getQuestionsByDiscipline(_question!.discipline);
      final currentIndex = questions.indexWhere(
        (q) => q.year == _question!.year && q.index == _question!.index,
      );

      if (currentIndex >= 0 && currentIndex < questions.length - 1) {
        final nextQuestion = questions[currentIndex + 1];
        context.push('/question/${nextQuestion.id}');
      } else {
        // If no next question, go back
        context.go('/');
      }
    } catch (e) {
      _logger.e('Error navigating to next question: $e');
      context.go('/');
    }
  }

  @override
  Widget build(BuildContext context) {
    _logger.i('Construindo tela de questão. Question: ${_question?.id}');

    if (_question == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Questão')),
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const CircularProgressIndicator(),
              const SizedBox(height: 16),
              Text('Carregando questão ${widget.questionId}...'),
              if (widget.studySessionId != null)
                Text('Sessão de estudo: ${widget.studySessionId}'),
            ],
          ),
        ),
      );
    }

    return Scaffold(
      appBar: AppBar(title: Text(_question!.title)),
      body: Column(
        children: [
          Expanded(
            child: SingleChildScrollView(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  _buildQuestionHeader(),
                  _buildQuestionContext(),
                  _buildAlternatives(),
                ],
              ),
            ),
          ),
          _buildActionBar(),
        ],
      ),
    );
  }

  Widget _buildQuestionHeader() {
    if (_question == null) {
      return Container(
        padding: const EdgeInsets.all(16),
        color: AppTheme.primaryColor,
        child: const Center(
          child: Text(
            'Carregando questão...',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
        ),
      );
    }

    return Container(
      padding: const EdgeInsets.all(16),
      color: AppTheme.primaryColor,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            _question?.title ?? 'Questão',
            style: const TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
          const SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'ENEM ${_question?.year ?? ''}',
                style: const TextStyle(
                  fontSize: 14,
                  color: Colors.white,
                  fontWeight: FontWeight.w300,
                ),
              ),
              Text(
                _question?.discipline ?? '',
                style: const TextStyle(
                  fontSize: 14,
                  color: Colors.white,
                  fontWeight: FontWeight.w300,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildQuestionContext() {
    if (_question == null) {
      return Container(
        margin: const EdgeInsets.all(16),
        padding: const EdgeInsets.all(16),
        decoration: AppTheme.cardDecoration,
        child: const Center(
          child: Text('Carregando contexto da questão...'),
        ),
      );
    }

    return Container(
      margin: const EdgeInsets.all(16),
      padding: const EdgeInsets.all(16),
      decoration: AppTheme.cardDecoration,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Render markdown context
          MarkdownBody(data: _question?.context ?? ''),

          // Display question images
          if (_question?.files.isNotEmpty == true) ...[
            const SizedBox(height: 16),
            ...(_question?.files ?? []).map((file) => Padding(
              padding: const EdgeInsets.only(bottom: 16),
              child: QuestionImage(
                filename: file,
                width: double.infinity,
                height: 200,
              ),
            )),
          ],
        ],
      ),
    );
  }

  Widget _buildAlternatives() {
    if (_question == null) {
      return const Padding(
        padding: EdgeInsets.all(16),
        child: Center(
          child: Text('Carregando alternativas...'),
        ),
      );
    }

    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            _question?.alternativesIntroduction ?? 'Selecione a alternativa correta:',
            style: AppTheme.subheadingStyle,
          ),
          const SizedBox(height: 16),
          ...(_question?.alternatives ?? []).map((alternative) => _buildAlternativeItem(alternative)),
        ],
      ),
    );
  }

  Widget _buildAlternativeItem(Alternative alternative) {
    final bool isSelected = _selectedAlternative == alternative.letter;
    final bool isCorrect = alternative.letter == _question!.correctAlternative;
    final bool isIncorrectSelection = _answered && isSelected && !isCorrect;

    Color backgroundColor = Colors.white;
    Color borderColor = Colors.transparent;

    if (_answered) {
      if (isCorrect) {
        backgroundColor = Colors.green.shade50;
        borderColor = Colors.green;
      } else if (isIncorrectSelection) {
        backgroundColor = Colors.red.shade50;
        borderColor = Colors.red;
      }
    } else if (isSelected) {
      backgroundColor = Colors.blue.shade50;
      borderColor = Colors.blue;
    }

    return GestureDetector(
      onTap: () => _handleSelectAlternative(alternative.letter),
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: backgroundColor,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: borderColor, width: borderColor != Colors.transparent ? 1 : 0),
          boxShadow: const [
            BoxShadow(
              color: Color.fromRGBO(0, 0, 0, 0.1),
              blurRadius: 4,
              offset: Offset(0, 2),
            ),
          ],
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Alternative letter
            Container(
              width: 30,
              height: 30,
              decoration: BoxDecoration(
                color: Colors.grey.shade200,
                shape: BoxShape.circle,
              ),
              alignment: Alignment.center,
              child: Text(
                alternative.letter,
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
            const SizedBox(width: 12),

            // Alternative content
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    alternative.text,
                    style: AppTheme.bodyStyle,
                  ),
                  if (alternative.file != null) ...[
                    const SizedBox(height: 8),
                    QuestionImage(
                      filename: alternative.file!,
                      width: double.infinity,
                      height: 150,
                    ),
                  ],
                ],
              ),
            ),

            // Correct/incorrect indicator
            if (_answered) ...[
              const SizedBox(width: 8),
              if (isCorrect)
                const Icon(Icons.check_circle, color: Colors.green, size: 24)
              else if (isIncorrectSelection)
                const Icon(Icons.cancel, color: Colors.red, size: 24),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildActionBar() {
    if (_question == null) {
      return Container(
        padding: const EdgeInsets.all(16),
        decoration: const BoxDecoration(
          color: Colors.white,
          boxShadow: [
            BoxShadow(
              color: Color.fromRGBO(0, 0, 0, 0.1),
              blurRadius: 4,
              offset: Offset(0, -2),
            ),
          ],
        ),
        child: const Center(
          child: Text('Carregando...'),
        ),
      );
    }

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: const BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Color.fromRGBO(0, 0, 0, 0.1),
            blurRadius: 4,
            offset: Offset(0, -2),
          ),
        ],
      ),
      child: !_answered
          ? ElevatedButton(
              onPressed: _selectedAlternative != null ? _handleSubmit : null,
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.primaryColor,
                disabledBackgroundColor: Colors.grey,
                padding: const EdgeInsets.symmetric(vertical: 12),
              ),
              child: const Text(
                'Responder',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
            )
          : Column(
              children: [
                Text(
                  _isCorrect ? 'Resposta Correta!' : 'Resposta Incorreta',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: _isCorrect ? Colors.green : Colors.red,
                  ),
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(
                      child: ElevatedButton(
                        onPressed: _handleViewLesson,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppTheme.accentColor,
                          padding: const EdgeInsets.symmetric(vertical: 12),
                        ),
                        child: const Text(
                          'Ver Aula',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: ElevatedButton(
                        onPressed: _handleNextQuestion,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppTheme.primaryColor,
                          padding: const EdgeInsets.symmetric(vertical: 12),
                        ),
                        child: const Text(
                          'Próxima Questão',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
    );
  }
}
