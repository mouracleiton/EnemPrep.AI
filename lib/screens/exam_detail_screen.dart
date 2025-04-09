import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../models/models.dart';
import '../services/data_service.dart';
import '../theme/app_theme.dart';

class ExamDetailScreen extends StatelessWidget {
  final int examYear;
  final String examType;

  const ExamDetailScreen({
    super.key,
    required this.examYear,
    required this.examType,
  });

  @override
  Widget build(BuildContext context) {
    final dataService = Provider.of<DataService>(context);
    
    // Get questions for this exam and type
    final List<Question> questions = _getQuestions(dataService);
    
    // Get the exam title
    final String examTitle = _getExamTitle();
    
    return Scaffold(
      appBar: AppBar(
        title: Text(examTitle),
      ),
      body: questions.isEmpty
          ? _buildEmptyState()
          : _buildQuestionsList(context, questions),
    );
  }

  List<Question> _getQuestions(DataService dataService) {
    List<Question> questions = [];
    
    if (examType == 'ingles' || examType == 'espanhol') {
      // For languages, filter by year and language
      questions = dataService.getQuestionsByYear(examYear)
          .where((q) => q.language == examType)
          .toList();
    } else {
      // For disciplines, filter by year and discipline
      questions = dataService.getQuestionsByYear(examYear)
          .where((q) => q.discipline == examType)
          .toList();
    }
    
    // Sort by index
    questions.sort((a, b) => a.index.compareTo(b.index));
    
    return questions;
  }

  String _getExamTitle() {
    final typeLabels = {
      'ciencias-humanas': 'Ciências Humanas',
      'ciencias-natureza': 'Ciências da Natureza',
      'linguagens': 'Linguagens',
      'matematica': 'Matemática',
      'ingles': 'Inglês',
      'espanhol': 'Espanhol',
    };
    
    final typeLabel = typeLabels[examType] ?? examType;
    return 'ENEM $examYear - $typeLabel';
  }

  Widget _buildEmptyState() {
    return const Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.question_mark,
            size: 64,
            color: Colors.grey,
          ),
          SizedBox(height: 16),
          Text(
            'Nenhuma questão disponível',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: AppTheme.textColor,
            ),
          ),
          SizedBox(height: 8),
          Text(
            'As questões serão adicionadas em breve',
            style: TextStyle(
              fontSize: 14,
              color: AppTheme.textLightColor,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildQuestionsList(BuildContext context, List<Question> questions) {
    return Column(
      children: [
        _buildExamHeader(questions.length),
        Expanded(
          child: ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: questions.length,
            itemBuilder: (context, index) => _buildQuestionItem(
              context,
              questions[index],
              index + 1,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildExamHeader(int questionCount) {
    return Container(
      padding: const EdgeInsets.all(16),
      color: AppTheme.primaryColor,
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                _getExamTitle(),
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                '$questionCount questões',
                style: const TextStyle(
                  fontSize: 14,
                  color: Colors.white,
                  fontWeight: FontWeight.w300,
                ),
              ),
            ],
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(20),
            ),
            child: Text(
              'ENEM $examYear',
              style: const TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.bold,
                color: AppTheme.primaryColor,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildQuestionItem(BuildContext context, Question question, int displayIndex) {
    final dataService = Provider.of<DataService>(context);
    final userAnswers = dataService.userAnswers;
    
    // Check if the user has answered this question
    final userAnswer = userAnswers.firstWhere(
      (a) => a.questionId == question.id,
      orElse: () => UserAnswer(
        questionId: '',
        selectedAlternative: '',
        isCorrect: false,
        timestamp: 0,
      ),
    );
    
    final hasAnswered = userAnswer.questionId.isNotEmpty;
    final isCorrect = hasAnswered && userAnswer.isCorrect;
    
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(10),
        side: BorderSide(
          color: hasAnswered
              ? (isCorrect ? Colors.green : Colors.red)
              : Colors.transparent,
          width: hasAnswered ? 1 : 0,
        ),
      ),
      child: InkWell(
        onTap: () => context.go('/question/${question.id}'),
        borderRadius: BorderRadius.circular(10),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              Container(
                width: 40,
                height: 40,
                decoration: const BoxDecoration(
                  color: AppTheme.primaryColor,
                  shape: BoxShape.circle,
                ),
                alignment: Alignment.center,
                child: Text(
                  displayIndex.toString(),
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      question.title,
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: AppTheme.textColor,
                      ),
                    ),
                    if (hasAnswered) ...[
                      const SizedBox(height: 8),
                      Row(
                        children: [
                          Icon(
                            isCorrect ? Icons.check_circle : Icons.cancel,
                            color: isCorrect ? Colors.green : Colors.red,
                            size: 16,
                          ),
                          const SizedBox(width: 4),
                          Text(
                            isCorrect ? 'Resposta correta' : 'Resposta incorreta',
                            style: TextStyle(
                              fontSize: 12,
                              color: isCorrect ? Colors.green : Colors.red,
                            ),
                          ),
                          if (userAnswer.viewedLesson) ...[
                            const SizedBox(width: 8),
                            const Icon(
                              Icons.school,
                              color: AppTheme.accentColor,
                              size: 16,
                            ),
                            const SizedBox(width: 4),
                            const Text(
                              'Aula visualizada',
                              style: TextStyle(
                                fontSize: 12,
                                color: AppTheme.accentColor,
                              ),
                            ),
                          ],
                        ],
                      ),
                    ],
                  ],
                ),
              ),
              const Icon(
                Icons.chevron_right,
                color: AppTheme.primaryColor,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
