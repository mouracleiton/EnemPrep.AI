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
    _loadQuestion();
  }

  void _loadQuestion() {
    final dataService = Provider.of<DataService>(context, listen: false);
    try {
      final question = dataService.getQuestionById(widget.questionId);
      setState(() {
        _question = question;
      });
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Erro ao carregar questão: $e')),
      );
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
    final params = widget.studySessionId != null
        ? {'studySessionId': widget.studySessionId!}
        : <String, String>{};
    context.go('/lesson/${widget.questionId}', extra: params);
  }

  void _handleNextQuestion() {
    if (_question == null) return;

    final dataService = Provider.of<DataService>(context, listen: false);

    // If we're in a study session, check if there are more questions
    if (widget.studySessionId != null) {
      try {
        final session = dataService.getStudySessionById(widget.studySessionId!);

        if (session != null && session.questionsAnswered < session.questionCount) {
          // Get more questions from the same disciplines
          final questions = dataService.getRandomQuestionsForStudy(
            session.disciplines,
            1, // Just get one more question
            true, // Exclude already answered questions
          );

          if (questions.isNotEmpty) {
            final nextQuestion = questions.first;
            final params = widget.studySessionId != null
                ? {'studySessionId': widget.studySessionId!}
                : <String, String>{};
            context.go('/question/${nextQuestion.id}', extra: params);
            return;
          }
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
        context.go('/question/${nextQuestion.id}');
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
    if (_question == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Questão')),
        body: const Center(child: CircularProgressIndicator()),
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
    return Container(
      padding: const EdgeInsets.all(16),
      color: AppTheme.primaryColor,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            _question!.title,
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
                'ENEM ${_question!.year}',
                style: const TextStyle(
                  fontSize: 14,
                  color: Colors.white,
                  fontWeight: FontWeight.w300,
                ),
              ),
              Text(
                _question!.discipline,
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
    return Container(
      margin: const EdgeInsets.all(16),
      padding: const EdgeInsets.all(16),
      decoration: AppTheme.cardDecoration,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Render markdown context
          MarkdownBody(data: _question!.context),

          // Display question images
          if (_question!.files.isNotEmpty) ...[
            const SizedBox(height: 16),
            ..._question!.files.map((file) => Padding(
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
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            _question!.alternativesIntroduction,
            style: AppTheme.subheadingStyle,
          ),
          const SizedBox(height: 16),
          ..._question!.alternatives.map((alternative) => _buildAlternativeItem(alternative)),
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
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.1),
              blurRadius: 4,
              offset: const Offset(0, 2),
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
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 4,
            offset: const Offset(0, -2),
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
