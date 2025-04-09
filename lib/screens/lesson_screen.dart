import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../models/models.dart';
import '../services/data_service.dart';
import '../theme/app_theme.dart';
import '../widgets/markdown_body.dart';

class LessonScreen extends StatefulWidget {
  final String questionId;
  final String? studySessionId;

  const LessonScreen({
    super.key,
    required this.questionId,
    this.studySessionId,
  });

  @override
  State<LessonScreen> createState() => _LessonScreenState();
}

class _LessonScreenState extends State<LessonScreen> {
  Question? _question;

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

  @override
  Widget build(BuildContext context) {
    if (_question == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Aula')),
        body: const Center(child: CircularProgressIndicator()),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: Text('Aula - ${_question!.title}'),
      ),
      body: Column(
        children: [
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildLessonHeader(),
                  const SizedBox(height: 16),
                  _buildLessonContent(),
                ],
              ),
            ),
          ),
          _buildActionBar(),
        ],
      ),
    );
  }

  Widget _buildLessonHeader() {
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
            'Aula Explicativa',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: AppTheme.accentColor,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Questão ${_question!.index} - ENEM ${_question!.year}',
            style: const TextStyle(
              fontSize: 14,
              color: AppTheme.textColor,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            _question!.discipline,
            style: const TextStyle(
              fontSize: 14,
              color: AppTheme.textColor,
              fontStyle: FontStyle.italic,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildLessonContent() {
    if (_question?.lesson == null || _question!.lesson!.isEmpty) {
      return const Center(
        child: Padding(
          padding: EdgeInsets.all(32),
          child: Text(
            'Esta questão não possui aula disponível.',
            style: TextStyle(
              fontSize: 16,
              fontStyle: FontStyle.italic,
            ),
            textAlign: TextAlign.center,
          ),
        ),
      );
    }

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: AppTheme.cardDecoration,
      child: MarkdownBody(
        data: _question!.lesson!,
        style: const TextStyle(
          fontSize: 16,
          height: 1.5,
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
      child: Row(
        children: [
          Expanded(
            child: ElevatedButton(
              onPressed: () {
                // Return to the question screen
                final studySessionParam = widget.studySessionId != null
                    ? '?studySessionId=${widget.studySessionId!}'
                    : '';
                context.go('/question/${widget.questionId}$studySessionParam');
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.primaryColor,
                padding: const EdgeInsets.symmetric(vertical: 12),
              ),
              child: const Text(
                'Voltar para a Questão',
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
    );
  }
}
