import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:intl/intl.dart';

import '../services/data_service.dart';
import '../theme/app_theme.dart';

class StatsScreen extends StatelessWidget {
  const StatsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final dataService = Provider.of<DataService>(context);
    final stats = dataService.getUserStatistics();
    
    return Scaffold(
      appBar: AppBar(
        title: const Text('Estatísticas'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildOverviewCard(stats),
            const SizedBox(height: 24),
            _buildPerformanceChart(stats),
            const SizedBox(height: 24),
            _buildDisciplineBreakdown(stats),
            const SizedBox(height: 24),
            _buildStudySessionsList(dataService),
          ],
        ),
      ),
    );
  }

  Widget _buildOverviewCard(Map<String, dynamic> stats) {
    final total = stats['total'] as int;
    final correct = stats['correct'] as int;
    final lessonsViewed = stats['lessonsViewed'] as int;
    
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: AppTheme.cardDecoration,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Visão Geral',
            style: AppTheme.subheadingStyle,
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: _buildStatItem(
                  'Questões Respondidas',
                  '$total',
                  Icons.question_answer,
                  AppTheme.primaryColor,
                ),
              ),
              Expanded(
                child: _buildStatItem(
                  'Respostas Corretas',
                  '$correct',
                  Icons.check_circle,
                  AppTheme.secondaryColor,
                ),
              ),
              Expanded(
                child: _buildStatItem(
                  'Aulas Visualizadas',
                  '$lessonsViewed',
                  Icons.school,
                  AppTheme.accentColor,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildStatItem(String label, String value, IconData icon, Color color) {
    return Column(
      children: [
        Icon(icon, color: color, size: 24),
        const SizedBox(height: 8),
        Text(
          value,
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
            color: color,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          label,
          style: const TextStyle(
            fontSize: 12,
            color: AppTheme.textColor,
          ),
          textAlign: TextAlign.center,
        ),
      ],
    );
  }

  Widget _buildPerformanceChart(Map<String, dynamic> stats) {
    final total = stats['total'] as int;
    final correct = stats['correct'] as int;
    final incorrect = stats['incorrect'] as int;
    
    // Calculate percentages
    final correctPercentage = total > 0 ? (correct / total) * 100 : 0.0;
    final incorrectPercentage = total > 0 ? (incorrect / total) * 100 : 0.0;
    
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
          if (total > 0) ...[
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
          ] else ...[
            const SizedBox(height: 40),
            const Center(
              child: Text(
                'Você ainda não respondeu nenhuma questão.',
                style: TextStyle(
                  fontSize: 16,
                  fontStyle: FontStyle.italic,
                  color: AppTheme.textLightColor,
                ),
                textAlign: TextAlign.center,
              ),
            ),
            const SizedBox(height: 40),
          ],
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

  Widget _buildDisciplineBreakdown(Map<String, dynamic> stats) {
    final disciplineStats = stats['disciplineStats'] as Map<String, dynamic>?;
    
    if (disciplineStats == null || disciplineStats.isEmpty) {
      return Container(
        padding: const EdgeInsets.all(16),
        decoration: AppTheme.cardDecoration,
        child: const Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Desempenho por Disciplina',
              style: AppTheme.subheadingStyle,
            ),
            SizedBox(height: 16),
            Center(
              child: Text(
                'Você ainda não respondeu questões de nenhuma disciplina.',
                style: TextStyle(
                  fontSize: 16,
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
    
    final disciplineLabels = {
      'ciencias-humanas': 'Ciências Humanas',
      'ciencias-natureza': 'Ciências da Natureza',
      'linguagens': 'Linguagens',
      'matematica': 'Matemática',
    };
    
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: AppTheme.cardDecoration,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Desempenho por Disciplina',
            style: AppTheme.subheadingStyle,
          ),
          const SizedBox(height: 16),
          ...disciplineStats.entries.map((entry) {
            final discipline = entry.key;
            final stats = entry.value as Map<String, dynamic>;
            final total = stats['total'] as int;
            final correct = stats['correct'] as int;
            final accuracy = total > 0 ? (correct / total) * 100 : 0.0;
            
            return Padding(
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
                        flex: 3,
                        child: ClipRRect(
                          borderRadius: BorderRadius.circular(4),
                          child: LinearProgressIndicator(
                            value: accuracy / 100,
                            backgroundColor: Colors.grey[200],
                            color: _getAccuracyColor(accuracy),
                            minHeight: 10,
                          ),
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        flex: 1,
                        child: Text(
                          '${accuracy.toStringAsFixed(1)}%',
                          style: TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.bold,
                            color: _getAccuracyColor(accuracy),
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    '$correct corretas de $total questões',
                    style: const TextStyle(
                      fontSize: 12,
                      color: AppTheme.textLightColor,
                    ),
                  ),
                ],
              ),
            );
          }),
        ],
      ),
    );
  }

  Color _getAccuracyColor(double accuracy) {
    if (accuracy >= 80) {
      return Colors.green;
    } else if (accuracy >= 60) {
      return Colors.amber;
    } else if (accuracy >= 40) {
      return Colors.orange;
    } else {
      return Colors.red;
    }
  }

  Widget _buildStudySessionsList(DataService dataService) {
    final sessions = dataService.studySessions;
    
    if (sessions.isEmpty) {
      return Container(
        padding: const EdgeInsets.all(16),
        decoration: AppTheme.cardDecoration,
        child: const Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Sessões de Estudo',
              style: AppTheme.subheadingStyle,
            ),
            SizedBox(height: 16),
            Center(
              child: Text(
                'Você ainda não realizou nenhuma sessão de estudo.',
                style: TextStyle(
                  fontSize: 16,
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
    
    final dateFormat = DateFormat('dd/MM/yyyy HH:mm');
    
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: AppTheme.cardDecoration,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Sessões de Estudo',
            style: AppTheme.subheadingStyle,
          ),
          const SizedBox(height: 16),
          ...sessions.map((session) {
            final date = DateTime.fromMillisecondsSinceEpoch(session.timestamp);
            final accuracy = session.accuracyPercentage;
            
            return Container(
              margin: const EdgeInsets.only(bottom: 12),
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.grey[100],
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: Colors.grey[300]!),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        dateFormat.format(date),
                        style: const TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                          color: AppTheme.textColor,
                        ),
                      ),
                      Text(
                        '${accuracy.toStringAsFixed(1)}% de acertos',
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                          color: _getAccuracyColor(accuracy),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Disciplinas: ${_formatDisciplines(session.disciplines)}',
                    style: const TextStyle(
                      fontSize: 12,
                      color: AppTheme.textLightColor,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Questões: ${session.questionsAnswered}/${session.questionCount} • Aulas: ${session.lessonsViewed}',
                    style: const TextStyle(
                      fontSize: 12,
                      color: AppTheme.textLightColor,
                    ),
                  ),
                ],
              ),
            );
          }),
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
}
