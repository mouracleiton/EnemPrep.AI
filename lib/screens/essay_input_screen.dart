import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../services/essay_evaluation_service.dart';

import '../theme/app_theme.dart';

class EssayInputScreen extends StatefulWidget {
  const EssayInputScreen({super.key});

  @override
  State<EssayInputScreen> createState() => _EssayInputScreenState();
}

class _EssayInputScreenState extends State<EssayInputScreen> {
  final TextEditingController _titleController = TextEditingController();
  final TextEditingController _essayController = TextEditingController();
  final _formKey = GlobalKey<FormState>();
  bool _isSubmitting = false;

  @override
  void dispose() {
    _titleController.dispose();
    _essayController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Digitar Redação'),
      ),
      body: Column(
        children: [
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildInfoCard(),
                    const SizedBox(height: 24),
                    _buildTitleField(),
                    const SizedBox(height: 24),
                    _buildEssayField(),
                  ],
                ),
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
        color: AppTheme.accentColor.withOpacity(0.1),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: AppTheme.accentColor.withOpacity(0.3)),
      ),
      child: const Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Instruções',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: AppTheme.accentColor,
            ),
          ),
          SizedBox(height: 8),
          Text(
            'Digite o título da proposta e o texto da sua redação nos campos abaixo. Sua redação será avaliada com base nos critérios do ENEM.',
            style: TextStyle(
              fontSize: 14,
              color: AppTheme.textColor,
            ),
          ),
          SizedBox(height: 8),
          Text(
            'Lembre-se: sua redação deve ter entre 7 e 30 linhas para ser avaliada adequadamente.',
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.bold,
              color: AppTheme.textColor,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTitleField() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Título da Proposta',
          style: AppTheme.subheadingStyle,
        ),
        const SizedBox(height: 8),
        TextFormField(
          controller: _titleController,
          decoration: InputDecoration(
            hintText: 'Ex: Os desafios da educação no Brasil',
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
            ),
            filled: true,
            fillColor: Colors.white,
          ),
          validator: (value) {
            if (value == null || value.isEmpty) {
              return 'Por favor, digite o título da proposta';
            }
            return null;
          },
        ),
      ],
    );
  }

  Widget _buildEssayField() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Texto da Redação',
          style: AppTheme.subheadingStyle,
        ),
        const SizedBox(height: 8),
        Container(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(10),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.1),
                blurRadius: 4,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: TextFormField(
            controller: _essayController,
            decoration: InputDecoration(
              hintText: 'Digite sua redação aqui...',
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(10),
              ),
              filled: true,
              fillColor: Colors.white,
              contentPadding: const EdgeInsets.all(16),
            ),
            maxLines: 20,
            minLines: 10,
            validator: (value) {
              if (value == null || value.isEmpty) {
                return 'Por favor, digite o texto da sua redação';
              }

              // Count lines
              final lines = value.split('\n');
              if (lines.length < 7) {
                return 'Sua redação deve ter pelo menos 7 linhas';
              }
              if (lines.length > 30) {
                return 'Sua redação deve ter no máximo 30 linhas';
              }

              return null;
            },
          ),
        ),
        const SizedBox(height: 8),
        Text(
          'Linhas: ${_countLines(_essayController.text)}',
          style: const TextStyle(
            fontSize: 14,
            color: AppTheme.textLightColor,
          ),
        ),
      ],
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
              onPressed: _isSubmitting ? null : _submitEssay,
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.accentColor,
                disabledBackgroundColor: Colors.grey,
                padding: const EdgeInsets.symmetric(vertical: 12),
              ),
              child: _isSubmitting
                  ? const Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(
                            color: Colors.white,
                            strokeWidth: 2,
                          ),
                        ),
                        SizedBox(width: 8),
                        Text(
                          'Enviando...',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ),
                      ],
                    )
                  : const Text(
                      'Enviar para Avaliação',
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

  int _countLines(String text) {
    if (text.isEmpty) return 0;
    return text.split('\n').length;
  }

  void _submitEssay() async {
    if (_formKey.currentState!.validate()) {
      setState(() {
        _isSubmitting = true;
      });

      try {
        // Get the essay evaluation service
        final essayEvaluationService = Provider.of<EssayEvaluationService>(context, listen: false);

        // Validate essay length
        final validation = essayEvaluationService.validateEssayLength(_essayController.text);

        if (!validation['valid']) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(validation['message'] ?? 'Sua redação não atende aos requisitos de tamanho.')),
          );
          setState(() {
            _isSubmitting = false;
          });
          return;
        }

        // Evaluate the essay
        final evaluation = await essayEvaluationService.evaluateEssay(
          _titleController.text,
          _essayController.text,
        );

        if (!mounted) return;

        // Navigate to the result screen
        context.go('/essay-result/${evaluation.id}');
      } catch (e) {
        if (!mounted) return;

        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Erro ao avaliar redação: $e')),
        );

        setState(() {
          _isSubmitting = false;
        });
      }
    }
  }
}
