import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../models/models.dart';
import '../services/data_service.dart';
import '../theme/app_theme.dart';

class ExamsListScreen extends StatelessWidget {
  const ExamsListScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final dataService = Provider.of<DataService>(context);
    final exams = dataService.exams;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Provas Disponíveis'),
      ),
      body: exams.isEmpty
          ? _buildEmptyState()
          : _buildExamsList(context, exams),
    );
  }

  Widget _buildEmptyState() {
    return const Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.description_outlined,
            size: 64,
            color: Colors.grey,
          ),
          SizedBox(height: 16),
          Text(
            'Nenhuma prova disponível',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: AppTheme.textColor,
            ),
          ),
          SizedBox(height: 8),
          Text(
            'As provas serão adicionadas em breve',
            style: TextStyle(
              fontSize: 14,
              color: AppTheme.textLightColor,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildExamsList(BuildContext context, List<Exam> exams) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildInfoCard(),
          const SizedBox(height: 24),
          ...exams.map((exam) => _buildExamCard(context, exam)),
        ],
      ),
    );
  }

  Widget _buildInfoCard() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppTheme.primaryColor.withOpacity(0.1),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: AppTheme.primaryColor.withOpacity(0.3)),
      ),
      child: const Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.info_outline, color: AppTheme.primaryColor),
              SizedBox(width: 8),
              Text(
                'Provas do ENEM',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: AppTheme.primaryColor,
                ),
              ),
            ],
          ),
          SizedBox(height: 8),
          Text(
            'Acesse as provas oficiais do ENEM organizadas por ano e disciplina. Todas as questões possuem aulas explicativas.',
            style: TextStyle(
              fontSize: 14,
              color: AppTheme.textColor,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildExamCard(BuildContext context, Exam exam) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: AppTheme.cardDecoration,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            decoration: const BoxDecoration(
              color: AppTheme.primaryColor,
              borderRadius: BorderRadius.only(
                topLeft: Radius.circular(10),
                topRight: Radius.circular(10),
              ),
            ),
            child: Row(
              children: [
                const Icon(
                  Icons.description,
                  color: Colors.white,
                  size: 24,
                ),
                const SizedBox(width: 8),
                Text(
                  exam.title,
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Disciplinas',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: AppTheme.textColor,
                  ),
                ),
                const SizedBox(height: 8),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: exam.disciplines.map((discipline) => _buildDisciplineChip(
                    context,
                    discipline,
                    exam.year,
                  )).toList(),
                ),
                if (exam.languages.isNotEmpty) ...[
                  const SizedBox(height: 16),
                  const Text(
                    'Línguas Estrangeiras',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: AppTheme.textColor,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: exam.languages.map((language) => _buildLanguageChip(
                      context,
                      language,
                      exam.year,
                    )).toList(),
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDisciplineChip(BuildContext context, Discipline discipline, int year) {
    return ActionChip(
      label: Text(discipline.label),
      backgroundColor: AppTheme.secondaryColor.withOpacity(0.1),
      side: BorderSide(color: AppTheme.secondaryColor.withOpacity(0.3)),
      labelStyle: const TextStyle(
        color: AppTheme.secondaryColor,
        fontWeight: FontWeight.bold,
      ),
      onPressed: () => context.go('/exam/$year/${discipline.value}'),
    );
  }

  Widget _buildLanguageChip(BuildContext context, Language language, int year) {
    return ActionChip(
      label: Text(language.label),
      backgroundColor: AppTheme.accentColor.withOpacity(0.1),
      side: BorderSide(color: AppTheme.accentColor.withOpacity(0.3)),
      labelStyle: const TextStyle(
        color: AppTheme.accentColor,
        fontWeight: FontWeight.bold,
      ),
      onPressed: () => context.go('/exam/$year/${language.value}'),
    );
  }
}
