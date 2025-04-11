import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';

import '../models/essay_evaluation.dart';
import '../services/essay_evaluation_service.dart';
import '../theme/app_theme.dart';

class EssayHistoryScreen extends StatelessWidget {
  const EssayHistoryScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final essayEvaluationService = Provider.of<EssayEvaluationService>(context);
    final essays = essayEvaluationService.essays;
    
    return Scaffold(
      appBar: AppBar(
        title: const Text('Histórico de Redações'),
      ),
      body: essays.isEmpty
          ? _buildEmptyState(context)
          : _buildEssaysList(context, essays),
    );
  }

  Widget _buildEmptyState(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.history, size: 64, color: Colors.grey),
          const SizedBox(height: 16),
          const Text(
            'Nenhuma redação encontrada',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 8),
          const Text(
            'Escreva sua primeira redação para começar',
            style: TextStyle(fontSize: 14, color: Colors.grey),
          ),
          const SizedBox(height: 24),
          ElevatedButton(
            onPressed: () => context.go('/essay-input'),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppTheme.accentColor,
            ),
            child: const Text('Escrever Redação'),
          ),
        ],
      ),
    );
  }

  Widget _buildEssaysList(BuildContext context, List<EssayEvaluation> essays) {
    final dateFormat = DateFormat('dd/MM/yyyy HH:mm');
    
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: essays.length,
      itemBuilder: (context, index) {
        final essay = essays[index];
        final date = DateTime.fromMillisecondsSinceEpoch(essay.timestamp);
        
        return Card(
          margin: const EdgeInsets.only(bottom: 16),
          elevation: 2,
          child: InkWell(
            onTap: () => context.go('/essay-result/${essay.id}'),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Text(
                          essay.title,
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 4,
                        ),
                        decoration: BoxDecoration(
                          color: _getScoreColor(essay.totalScore),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Text(
                          essay.totalScore.toString(),
                          style: const TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text(
                    dateFormat.format(date),
                    style: const TextStyle(
                      fontSize: 12,
                      color: Colors.grey,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    essay.text,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(fontSize: 14),
                  ),
                  const SizedBox(height: 8),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.end,
                    children: [
                      TextButton(
                        onPressed: () => context.go('/essay-result/${essay.id}'),
                        child: const Text('Ver Avaliação'),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  Color _getScoreColor(int score) {
    if (score >= 800) return Colors.green;
    if (score >= 600) return Colors.lightGreen;
    if (score >= 400) return Colors.orange;
    if (score >= 200) return Colors.deepOrange;
    return Colors.red;
  }
}
