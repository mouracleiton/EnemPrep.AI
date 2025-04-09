import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:logger/logger.dart';

import '../services/data_service.dart';
import '../theme/app_theme.dart';
import '../utils/logger_config.dart';

class StudyScreen extends StatefulWidget {
  const StudyScreen({super.key});

  @override
  State<StudyScreen> createState() => _StudyScreenState();
}

class _StudyScreenState extends State<StudyScreen> {
  final List<String> _selectedDisciplines = [];
  int _questionCount = 10;
  bool _excludeAnswered = false;
  final Logger _logger = LoggerConfig.getLogger();

  @override
  Widget build(BuildContext context) {
    final dataService = Provider.of<DataService>(context);
    final availableDisciplines = dataService.getDisciplinesWithQuestions();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Estudo Personalizado'),
      ),
      body: Column(
        children: [
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildInfoCard(),
                  const SizedBox(height: 24),
                  _buildDisciplineSelector(availableDisciplines),
                  const SizedBox(height: 24),
                  _buildQuestionCountSelector(),
                  const SizedBox(height: 24),
                  _buildExcludeAnsweredToggle(),
                ],
              ),
            ),
          ),
          _buildActionBar(),
        ],
      ),
    );
  }

  Widget _buildInfoCard() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppTheme.primaryColor.withAlpha(25), // 0.1 * 255 = 25
        borderRadius: BorderRadius.circular(10),
        border: Border.all(
          color: AppTheme.primaryColor.withAlpha(76), // 0.3 * 255 = 76
        ),
      ),
      child: const Column(
        children: [
          Row(
            children: [
              Icon(Icons.info_outline, color: AppTheme.primaryColor),
              SizedBox(width: 8),
              Text(
                'Estudo Personalizado',
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
            'Selecione as disciplinas e a quantidade de questões para criar uma sessão de estudo personalizada.',
            style: TextStyle(
              fontSize: 14,
              color: AppTheme.textColor,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDisciplineSelector(List<String> availableDisciplines) {
    final disciplineLabels = {
      'ciencias-humanas': 'Ciências Humanas',
      'ciencias-natureza': 'Ciências da Natureza',
      'linguagens': 'Linguagens',
      'matematica': 'Matemática',
    };

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Disciplinas',
          style: AppTheme.subheadingStyle,
        ),
        const SizedBox(height: 8),
        const Text(
          'Selecione as disciplinas que deseja estudar:',
          style: AppTheme.bodyStyle,
        ),
        const SizedBox(height: 16),
        ...availableDisciplines.map((discipline) {
          final label = disciplineLabels[discipline] ?? discipline;
          return CheckboxListTile(
            title: Text(label),
            value: _selectedDisciplines.contains(discipline),
            onChanged: (selected) {
              setState(() {
                if (selected == true) {
                  _selectedDisciplines.add(discipline);
                } else {
                  _selectedDisciplines.remove(discipline);
                }
              });
            },
            activeColor: AppTheme.primaryColor,
            contentPadding: EdgeInsets.zero,
          );
        }),
      ],
    );
  }

  Widget _buildQuestionCountSelector() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Quantidade de Questões',
          style: AppTheme.subheadingStyle,
        ),
        const SizedBox(height: 8),
        const Text(
          'Selecione quantas questões deseja responder:',
          style: AppTheme.bodyStyle,
        ),
        const SizedBox(height: 16),
        Row(
          children: [
            Expanded(
              child: Slider(
                value: _questionCount.toDouble(),
                min: 5,
                max: 30,
                divisions: 5,
                label: _questionCount.toString(),
                onChanged: (value) {
                  setState(() {
                    _questionCount = value.round();
                  });
                },
                activeColor: AppTheme.primaryColor,
              ),
            ),
            Container(
              width: 50,
              height: 50,
              decoration: BoxDecoration(
                color: AppTheme.primaryColor,
                borderRadius: BorderRadius.circular(10),
              ),
              alignment: Alignment.center,
              child: Text(
                _questionCount.toString(),
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildExcludeAnsweredToggle() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Opções Adicionais',
          style: AppTheme.subheadingStyle,
        ),
        const SizedBox(height: 16),
        SwitchListTile(
          title: const Text('Excluir questões já respondidas'),
          subtitle: const Text(
            'Mostrar apenas questões que você ainda não respondeu',
            style: TextStyle(fontSize: 12),
          ),
          value: _excludeAnswered,
          onChanged: (value) {
            setState(() {
              _excludeAnswered = value;
            });
          },
          activeColor: AppTheme.primaryColor,
          contentPadding: EdgeInsets.zero,
        ),
      ],
    );
  }

  Widget _buildActionBar() {
    final bool canStart = _selectedDisciplines.isNotEmpty && _questionCount > 0;

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
      child: Row(
        children: [
          Expanded(
            child: ElevatedButton(
              onPressed: canStart ? _startStudySession : null,
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.secondaryColor,
                disabledBackgroundColor: Colors.grey,
                padding: const EdgeInsets.symmetric(vertical: 12),
              ),
              child: const Text(
                'Iniciar Estudo',
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

  void _startStudySession() {
    if (_selectedDisciplines.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Selecione pelo menos uma disciplina')),
      );
      return;
    }

    final dataService = Provider.of<DataService>(context, listen: false);

    // Create a new study session
    final session = dataService.createStudySession(
      _selectedDisciplines,
      _questionCount,
    );

    // Get random questions for the session
    final questions = dataService.getRandomQuestionsForStudy(
      _selectedDisciplines,
      _questionCount,
      _excludeAnswered,
    );

    if (questions.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Não há questões disponíveis para os critérios selecionados'),
        ),
      );
      return;
    }

    // Log para debug
    _logger.i('Iniciando sessão de estudo: ${session.id}');
    _logger.i('Primeira questão: ${questions.first.id}');

    // Navigate to the first question
    final firstQuestion = questions.first;

    // Usar pushNamed em vez de go para garantir que a navegação funcione corretamente
    context.go('/question/${firstQuestion.id}?studySessionId=${session.id}');
  }
}
