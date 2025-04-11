import 'package:flutter/material.dart';

import '../theme/app_theme.dart';
import '../widgets/widgets.dart';

class ModelDownloadScreen extends StatefulWidget {
  const ModelDownloadScreen({super.key});

  @override
  State<ModelDownloadScreen> createState() => _ModelDownloadScreenState();
}

class _ModelDownloadScreenState extends State<ModelDownloadScreen> {
  bool _isDownloading = false;
  double _downloadProgress = 0.0;
  String _statusMessage = 'Aguardando download...';

  @override
  Widget build(BuildContext context) {
    return BaseScreenLayout(
      title: 'Download do Modelo de IA',
      currentNavIndex: 4,
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildInfoCard(),
            const SizedBox(height: 24),
            _buildDownloadSection(),
            const SizedBox(height: 24),
            _buildFeaturesList(),
          ],
        ),
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
                'Modelo de IA',
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
            'Para utilizar recursos avançados de IA, como avaliação de redações e geração de aulas personalizadas, é necessário baixar o modelo de IA.',
            style: TextStyle(
              fontSize: 14,
              color: AppTheme.textColor,
            ),
          ),
          SizedBox(height: 8),
          Text(
            'O download requer aproximadamente 200MB de espaço e uma conexão Wi-Fi.',
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

  Widget _buildDownloadSection() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: AppTheme.cardDecoration,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Download do Modelo',
            style: AppTheme.subheadingStyle,
          ),
          const SizedBox(height: 16),
          if (_isDownloading) ...[
            LinearProgressIndicator(
              value: _downloadProgress,
              backgroundColor: Colors.grey[200],
              color: AppTheme.primaryColor,
              minHeight: 10,
            ),
            const SizedBox(height: 16),
            Text(
              _statusMessage,
              style: const TextStyle(
                fontSize: 14,
                color: AppTheme.textColor,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 16),
            Center(
              child: ElevatedButton(
                onPressed: _cancelDownload,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.errorColor,
                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                ),
                child: const Text(
                  'Cancelar Download',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
              ),
            ),
          ] else ...[
            Center(
              child: ElevatedButton(
                onPressed: _startDownload,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.primaryColor,
                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                ),
                child: const Text(
                  'Iniciar Download',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildFeaturesList() {
    final features = [
      {
        'title': 'Avaliação de Redações',
        'description': 'Receba feedback detalhado sobre suas redações do ENEM.',
        'icon': Icons.edit_document,
      },
      {
        'title': 'Aulas Personalizadas',
        'description': 'Gere aulas explicativas para questões sem explicação.',
        'icon': Icons.school,
      },
      {
        'title': 'Assistente de Estudos',
        'description': 'Tire dúvidas e receba orientações personalizadas.',
        'icon': Icons.chat,
      },
    ];

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: AppTheme.cardDecoration,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Recursos Disponíveis com o Modelo',
            style: AppTheme.subheadingStyle,
          ),
          const SizedBox(height: 16),
          ...features.map((feature) => _buildFeatureItem(
            feature['title'] as String,
            feature['description'] as String,
            feature['icon'] as IconData,
          )),
        ],
      ),
    );
  }

  Widget _buildFeatureItem(String title, String description, IconData icon) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: AppTheme.primaryColor.withOpacity(0.1),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(icon, color: AppTheme.primaryColor, size: 24),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: AppTheme.textColor,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  description,
                  style: const TextStyle(
                    fontSize: 14,
                    color: AppTheme.textLightColor,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  void _startDownload() {
    // This is a mock implementation
    setState(() {
      _isDownloading = true;
      _downloadProgress = 0.0;
      _statusMessage = 'Iniciando download...';
    });

    // Simulate download progress
    Future.delayed(const Duration(seconds: 1), () {
      if (!mounted) return;

      setState(() {
        _downloadProgress = 0.1;
        _statusMessage = 'Baixando modelo (10%)...';
      });

      // Show a message that this is just a demo
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Esta é uma demonstração. O download não está realmente ocorrendo.'),
          duration: Duration(seconds: 5),
        ),
      );

      // Cancel the download after a few seconds
      Future.delayed(const Duration(seconds: 5), () {
        if (!mounted) return;
        _cancelDownload();
      });
    });
  }

  void _cancelDownload() {
    setState(() {
      _isDownloading = false;
      _downloadProgress = 0.0;
      _statusMessage = 'Download cancelado';
    });

    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Download cancelado'),
      ),
    );
  }
}
