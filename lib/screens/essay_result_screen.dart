import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';

import '../models/essay_evaluation.dart';
import '../services/essay_evaluation_service.dart';

import '../theme/app_theme.dart';

class EssayResultScreen extends StatelessWidget {
  final String evaluationId;

  const EssayResultScreen({
    super.key,
    required this.evaluationId,
  });

  @override
  Widget build(BuildContext context) {
    // Get the essay evaluation service
    final essayEvaluationService = Provider.of<EssayEvaluationService>(context);

    // Get the evaluation by ID
    final evaluation = essayEvaluationService.getEssayById(evaluationId);

    // If evaluation is not found, show error
    if (evaluation == null) {
      return Scaffold(
        appBar: AppBar(
          title: const Text('Resultado da Avaliação'),
        ),
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.error_outline, size: 64, color: Colors.red),
              const SizedBox(height: 16),
              const Text(
                'Avaliação não encontrada',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: () => context.go('/essay'),
                child: const Text('Voltar para Redações'),
              ),
            ],
          ),
        ),
      );
    }

    // Convert evaluation to the format expected by the UI
    final evaluationData = _convertEvaluationToData(evaluation);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Resultado da Avaliação'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildEvaluationHeader(evaluationData),
            const SizedBox(height: 24),
            _buildScoreCard(evaluationData),
            const SizedBox(height: 24),
            _buildCompetenceBreakdown(evaluationData),
            const SizedBox(height: 24),
            _buildFeedbackCard(evaluationData),
            const SizedBox(height: 24),
            _buildEssayText(evaluationData),
            const SizedBox(height: 32),
            _buildActionButtons(context),
          ],
        ),
      ),
    );
  }

  Widget _buildEvaluationHeader(Map<String, dynamic> data) {
    final date = DateTime.fromMillisecondsSinceEpoch(data['timestamp']);
    final dateFormat = DateFormat('dd/MM/yyyy HH:mm');

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppTheme.accentColor.withOpacity(0.1),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: AppTheme.accentColor.withOpacity(0.3)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Avaliação de Redação',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: AppTheme.accentColor,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Tema: ${data['title']}',
            style: const TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.bold,
              color: AppTheme.textColor,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            'Data: ${dateFormat.format(date)}',
            style: const TextStyle(
              fontSize: 14,
              color: AppTheme.textColor,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            'ID: $evaluationId',
            style: const TextStyle(
              fontSize: 12,
              color: AppTheme.textLightColor,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildScoreCard(Map<String, dynamic> data) {
    final totalScore = data['totalScore'];
    final scoreColor = _getScoreColor(totalScore);

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: AppTheme.cardDecoration,
      child: Column(
        children: [
          const Text(
            'Nota Final',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: AppTheme.textColor,
            ),
          ),
          const SizedBox(height: 16),
          Container(
            width: 100,
            height: 100,
            decoration: BoxDecoration(
              color: scoreColor.withOpacity(0.1),
              shape: BoxShape.circle,
              border: Border.all(color: scoreColor, width: 4),
            ),
            alignment: Alignment.center,
            child: Text(
              totalScore.toString(),
              style: TextStyle(
                fontSize: 36,
                fontWeight: FontWeight.bold,
                color: scoreColor,
              ),
            ),
          ),
          const SizedBox(height: 16),
          Text(
            _getScoreDescription(totalScore),
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: scoreColor,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  Widget _buildCompetenceBreakdown(Map<String, dynamic> data) {
    final competences = data['competences'] as List<dynamic>;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: AppTheme.cardDecoration,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Competências',
            style: AppTheme.subheadingStyle,
          ),
          const SizedBox(height: 16),
          ...competences.map((competence) => _buildCompetenceItem(competence)),
        ],
      ),
    );
  }

  Widget _buildCompetenceItem(Map<String, dynamic> competence) {
    final score = competence['score'] as int;
    final maxScore = competence['maxScore'] as int;
    final percentage = score / maxScore;

    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Text(
                  competence['name'],
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.bold,
                    color: AppTheme.textColor,
                  ),
                ),
              ),
              Text(
                '$score/$maxScore',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                  color: _getScoreColor(score * 2),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          ClipRRect(
            borderRadius: BorderRadius.circular(4),
            child: LinearProgressIndicator(
              value: percentage,
              backgroundColor: Colors.grey[200],
              color: _getScoreColor(score * 2),
              minHeight: 8,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            competence['description'],
            style: const TextStyle(
              fontSize: 12,
              color: AppTheme.textLightColor,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFeedbackCard(Map<String, dynamic> data) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: AppTheme.cardDecoration,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Feedback Geral',
            style: AppTheme.subheadingStyle,
          ),
          const SizedBox(height: 16),
          Text(
            data['feedback'],
            style: const TextStyle(
              fontSize: 14,
              color: AppTheme.textColor,
            ),
          ),
          const SizedBox(height: 16),
          const Text(
            'Sugestões de Melhoria',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: AppTheme.textColor,
            ),
          ),
          const SizedBox(height: 8),
          ...(data['suggestions'] as List<dynamic>).map((suggestion) => Padding(
            padding: const EdgeInsets.only(bottom: 8),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Icon(
                  Icons.arrow_right,
                  color: AppTheme.primaryColor,
                  size: 20,
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    suggestion,
                    style: const TextStyle(
                      fontSize: 14,
                      color: AppTheme.textColor,
                    ),
                  ),
                ),
              ],
            ),
          )),
        ],
      ),
    );
  }

  Widget _buildEssayText(Map<String, dynamic> data) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: AppTheme.cardDecoration,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Texto da Redação',
            style: AppTheme.subheadingStyle,
          ),
          const SizedBox(height: 16),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.grey[100],
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: Colors.grey[300]!),
            ),
            child: Text(
              data['essayText'],
              style: const TextStyle(
                fontSize: 14,
                color: AppTheme.textColor,
                height: 1.5,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildActionButtons(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: ElevatedButton(
            onPressed: () => context.go('/essay-input'),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppTheme.accentColor,
              padding: const EdgeInsets.symmetric(vertical: 12),
            ),
            child: const Text(
              'Nova Redação',
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

  Color _getScoreColor(int score) {
    if (score >= 800) {
      return Colors.green;
    } else if (score >= 600) {
      return Colors.blue;
    } else if (score >= 400) {
      return Colors.amber;
    } else if (score >= 200) {
      return Colors.orange;
    } else {
      return Colors.red;
    }
  }

  String _getScoreDescription(int score) {
    if (score >= 800) {
      return 'Excelente!';
    } else if (score >= 600) {
      return 'Muito Bom!';
    } else if (score >= 400) {
      return 'Bom';
    } else if (score >= 200) {
      return 'Regular';
    } else {
      return 'Precisa Melhorar';
    }
  }

  // Convert EssayEvaluation to the format expected by the UI
  Map<String, dynamic> _convertEvaluationToData(EssayEvaluation evaluation) {
    return {
      'title': evaluation.title,
      'timestamp': evaluation.timestamp,
      'totalScore': evaluation.totalScore,
      'competences': [
        {
          'name': 'Competência 1',
          'description': 'Domínio da norma culta',
          'score': evaluation.competencyScores.competency1,
          'maxScore': 200,
        },
        {
          'name': 'Competência 2',
          'description': 'Compreensão da proposta e aplicação de conceitos',
          'score': evaluation.competencyScores.competency2,
          'maxScore': 200,
        },
        {
          'name': 'Competência 3',
          'description': 'Capacidade de argumentação',
          'score': evaluation.competencyScores.competency3,
          'maxScore': 200,
        },
        {
          'name': 'Competência 4',
          'description': 'Coesão textual',
          'score': evaluation.competencyScores.competency4,
          'maxScore': 200,
        },
        {
          'name': 'Competência 5',
          'description': 'Proposta de intervenção',
          'score': evaluation.competencyScores.competency5,
          'maxScore': 200,
        },
      ],
      'feedback': evaluation.feedback.generalAnalysis,
      'suggestions': [
        evaluation.feedback.competency1Feedback,
        evaluation.feedback.competency2Feedback,
        evaluation.feedback.competency3Feedback,
        evaluation.feedback.competency4Feedback,
        evaluation.feedback.competency5Feedback,
      ],
      'essayText': evaluation.text,
    };
  }
}
