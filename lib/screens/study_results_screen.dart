import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import 'package:fl_chart/fl_chart.dart';

import '../models/models.dart';
import '../services/data_service.dart';
import '../theme/app_theme.dart';

class StudyResultsScreen extends StatelessWidget {
  final String studySessionId;

  const StudyResultsScreen({
    super.key,
    required this.studySessionId,
  });

  @override
  Widget build(BuildContext context) {
    final dataService = Provider.of<DataService>(context);

    try {
      final session = dataService.getStudySessionById(studySessionId);

      if (session == null) {
        return Scaffold(
          appBar: AppBar(title: const Text('Resultados do Estudo')),
          body: const Center(
            child: Text('Sessão de estudo não encontrada'),
          ),
        );
      }

      return Scaffold(
        appBar: AppBar(
          title: const Text('Resultados do Estudo'),
        ),
        body: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildSessionHeader(session),
              const SizedBox(height: 24),
              _buildPerformanceChart(session),
              const SizedBox(height: 24),
              _buildStatisticsCards(session),
              const SizedBox(height: 24),
              _buildDisciplineBreakdown(session, dataService),
              const SizedBox(height: 32),
              _buildActionButtons(context),
            ],
          ),
        ),
      );
    } catch (e) {
      return Scaffold(
        appBar: AppBar(title: const Text('Resultados do Estudo')),
        body: Center(
          child: Text('Erro ao carregar resultados: $e'),
        ),
      );
    }
  }

  Widget _buildSessionHeader(StudySession session) {
    final date = DateTime.fromMillisecondsSinceEpoch(session.timestamp);
    final dateFormat = DateFormat('dd/MM/yyyy HH:mm');

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppTheme.primaryColor.withAlpha(25), // 0.1 * 255 = 25
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: AppTheme.primaryColor.withAlpha(76)), // 0.3 * 255 = 76
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Sessão de Estudo Concluída',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: AppTheme.primaryColor,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Data: ${dateFormat.format(date)}',
            style: const TextStyle(
              fontSize: 14,
              color: AppTheme.textColor,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            'Disciplinas: ${_formatDisciplines(session.disciplines)}',
            style: const TextStyle(
              fontSize: 14,
              color: AppTheme.textColor,
            ),
          ),
        ],
      ),
    );
  }

  String _formatDisciplines(List<String> disciplines) {
    final disciplineLabels = {
      'ciencias-humanas': 'Ciências Humanas',
      'ciencias-natureza': 'Ciências da Natureza',
      'linguagens': 'Linguagens',
      'matematica': 'Matemática',
    };

    return disciplines
        .map((d) => disciplineLabels[d] ?? d)
        .join(', ');
  }

  Widget _buildPerformanceChart(StudySession session) {
    final correctPercentage = session.accuracyPercentage;
    final incorrectPercentage = 100 - correctPercentage;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: AppTheme.cardDecoration,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Desempenho',
            style: AppTheme.subheadingStyle,
          ),
          const SizedBox(height: 16),
          SizedBox(
            height: 200,
            child: PieChart(
              PieChartData(
                sections: [
                  PieChartSectionData(
                    value: correctPercentage,
                    title: '${correctPercentage.toStringAsFixed(1)}%',
                    color: AppTheme.secondaryColor,
                    radius: 80,
                    titleStyle: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                  PieChartSectionData(
                    value: incorrectPercentage,
                    title: '${incorrectPercentage.toStringAsFixed(1)}%',
                    color: AppTheme.errorColor,
                    radius: 70,
                    titleStyle: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                ],
                sectionsSpace: 2,
                centerSpaceRadius: 40,
                startDegreeOffset: 180,
              ),
            ),
          ),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              _buildLegendItem('Corretas', AppTheme.secondaryColor),
              const SizedBox(width: 24),
              _buildLegendItem('Incorretas', AppTheme.errorColor),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildLegendItem(String label, Color color) {
    return Row(
      children: [
        Container(
          width: 16,
          height: 16,
          decoration: BoxDecoration(
            color: color,
            shape: BoxShape.circle,
          ),
        ),
        const SizedBox(width: 8),
        Text(
          label,
          style: const TextStyle(
            fontSize: 14,
            color: AppTheme.textColor,
          ),
        ),
      ],
    );
  }

  Widget _buildStatisticsCards(StudySession session) {
    return Row(
      children: [
        Expanded(
          child: _buildStatCard(
            'Questões',
            '${session.questionsAnswered}/${session.questionCount}',
            Icons.question_answer,
            AppTheme.primaryColor,
          ),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: _buildStatCard(
            'Acertos',
            '${session.correctAnswers}',
            Icons.check_circle,
            AppTheme.secondaryColor,
          ),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: _buildStatCard(
            'Aulas',
            '${session.lessonsViewed}',
            Icons.school,
            AppTheme.accentColor,
          ),
        ),
      ],
    );
  }

  Widget _buildStatCard(String title, String value, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: AppTheme.cardDecoration,
      child: Column(
        children: [
          Icon(icon, color: color, size: 24),
          const SizedBox(height: 8),
          Text(
            title,
            style: const TextStyle(
              fontSize: 14,
              color: AppTheme.textColor,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            value,
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: color,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDisciplineBreakdown(StudySession session, DataService dataService) {
    // Obter todas as respostas desta sessão de estudo
    final sessionAnswers = dataService.userAnswers
        .where((answer) => answer.studySession == session.id)
        .toList();

    // Agrupar respostas por disciplina
    final Map<String, List<UserAnswer>> answersByDiscipline = {};

    for (final answer in sessionAnswers) {
      try {
        final question = dataService.getQuestionById(answer.questionId);
        if (question != null) {
          final discipline = question.discipline;
          if (!answersByDiscipline.containsKey(discipline)) {
            answersByDiscipline[discipline] = [];
          }
          answersByDiscipline[discipline]!.add(answer);
        }
      } catch (e) {
        // Ignorar questões que não podem ser encontradas
      }
    }

    // Se não houver dados para mostrar, exibir uma mensagem
    if (answersByDiscipline.isEmpty) {
      return Container(
        padding: const EdgeInsets.all(16),
        decoration: AppTheme.cardDecoration,
        child: const Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Detalhamento por Disciplina',
              style: AppTheme.subheadingStyle,
            ),
            SizedBox(height: 16),
            Center(
              child: Text(
                'Nenhuma questão respondida nesta sessão.',
                style: TextStyle(
                  fontSize: 14,
                  fontStyle: FontStyle.italic,
                  color: AppTheme.textLightColor,
                ),
                textAlign: TextAlign.center,
              ),
            ),
          ],
        ),
      );
    }

    // Criar widgets para cada disciplina
    final disciplineWidgets = <Widget>[];
    final disciplineLabels = {
      'ciencias-humanas': 'Ciências Humanas',
      'ciencias-natureza': 'Ciências da Natureza',
      'linguagens': 'Linguagens',
      'matematica': 'Matemática',
    };

    answersByDiscipline.forEach((discipline, answers) {
      final correctCount = answers.where((a) => a.isCorrect).length;
      final totalCount = answers.length;
      final accuracy = totalCount > 0 ? (correctCount / totalCount * 100) : 0;

      disciplineWidgets.add(
        Padding(
          padding: const EdgeInsets.only(bottom: 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                disciplineLabels[discipline] ?? discipline,
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: AppTheme.textColor,
                ),
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  Expanded(
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(4),
                      child: LinearProgressIndicator(
                        value: accuracy / 100,
                        backgroundColor: Colors.grey[200],
                        color: accuracy >= 70
                            ? AppTheme.secondaryColor
                            : (accuracy >= 40 ? AppTheme.accentColor : AppTheme.errorColor),
                        minHeight: 10,
                      ),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Text(
                    '${accuracy.toStringAsFixed(0)}%',
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.bold,
                      color: AppTheme.textColor,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 4),
              Text(
                '$correctCount de $totalCount questões corretas',
                style: const TextStyle(
                  fontSize: 12,
                  color: AppTheme.textLightColor,
                ),
              ),
            ],
          ),
        ),
      );
    });

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: AppTheme.cardDecoration,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Detalhamento por Disciplina',
            style: AppTheme.subheadingStyle,
          ),
          const SizedBox(height: 16),
          ...disciplineWidgets,
        ],
      ),
    );
  }

  Widget _buildActionButtons(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: ElevatedButton(
            onPressed: () => context.go('/study'),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppTheme.secondaryColor,
              padding: const EdgeInsets.symmetric(vertical: 12),
            ),
            child: const Text(
              'Nova Sessão de Estudo',
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
            onPressed: () => context.go('/'),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppTheme.primaryColor,
              padding: const EdgeInsets.symmetric(vertical: 12),
            ),
            child: const Text(
              'Voltar ao Início',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: Colors.white,
              ),
            ),
          ),
        ),
      ],
    );
  }
}
