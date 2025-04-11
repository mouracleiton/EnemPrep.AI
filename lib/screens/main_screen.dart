import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../services/data_service.dart';
import '../theme/app_theme.dart';
import '../widgets/widgets.dart';

class MainScreen extends StatelessWidget {
  const MainScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final dataService = Provider.of<DataService>(context);

    // Show loading screen if data is still loading
    if (dataService.isLoading) {
      return Scaffold(
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const CircularProgressIndicator(),
              const SizedBox(height: 20),
              Text(
                dataService.loadingStatus,
                style: AppTheme.bodyStyle,
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      );
    }

    return BaseScreenLayout(
      title: 'Início',
      currentNavIndex: 0,
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.only(bottom: 80),
          children: [
            _buildHeader(),
            _buildInfoCard(),
            _buildMainButtons(context),
            _buildExamsButton(context),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => context.go('/support'),
        backgroundColor: AppTheme.errorColor,
        child: const Icon(Icons.favorite, color: Colors.white),
      ),
    );
  }

  Widget _buildHeader() {
    return Container(
      padding: const EdgeInsets.all(20),
      color: AppTheme.primaryColor,
      child: const Column(
        children: [
          Text(
            'ENEM Prep AI',
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
          SizedBox(height: 8),
          Text(
            'Prepare-se para o ENEM com questões e aulas explicativas',
            style: TextStyle(
              fontSize: 16,
              color: Colors.white,
              fontWeight: FontWeight.w300,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  Widget _buildInfoCard() {
    return Container(
      margin: const EdgeInsets.all(16),
      padding: const EdgeInsets.all(16),
      decoration: AppTheme.cardDecoration,
      child: const Text(
        'Este aplicativo contém questões do ENEM com aulas explicativas geradas por IA. '
        'Os dados estão disponíveis offline, sem necessidade de conexão com a internet.',
        style: AppTheme.bodyStyle,
        textAlign: TextAlign.center,
      ),
    );
  }

  Widget _buildMainButtons(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          _buildFeatureButton(
            context,
            title: 'Estudo Personalizado',
            subtitle: 'Escolha disciplinas e quantidade de questões',
            color: AppTheme.secondaryColor,
            icon: Icons.school,
            onTap: () => context.go('/study'),
          ),
          const SizedBox(height: 12),
          _buildFeatureButton(
            context,
            title: 'Estatísticas',
            subtitle: 'Acompanhe seu desempenho e progresso',
            color: AppTheme.primaryColor,
            icon: Icons.bar_chart,
            onTap: () => context.go('/stats'),
          ),
          const SizedBox(height: 12),
          _buildFeatureButton(
            context,
            title: 'Redação ENEM',
            subtitle: 'Escreva ou escaneie sua redação para avaliação',
            color: AppTheme.accentColor,
            icon: Icons.edit_document,
            onTap: () => context.go('/essay'),
          ),
          const SizedBox(height: 12),
          _buildFeatureButton(
            context,
            title: 'Modelo de IA',
            subtitle: 'Baixe o modelo para usar recursos de IA',
            color: Colors.grey.shade700,
            icon: Icons.download,
            onTap: () => context.go('/model-download'),
            showAlert: true,
          ),
        ],
      ),
    );
  }

  Widget _buildFeatureButton(
    BuildContext context, {
    required String title,
    required String subtitle,
    required Color color,
    required IconData icon,
    required VoidCallback onTap,
    bool showAlert = false,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(10),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: color,
          borderRadius: BorderRadius.circular(10),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.1),
              blurRadius: 4,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Row(
          children: [
            Icon(icon, color: Colors.white, size: 28),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    subtitle,
                    style: const TextStyle(
                      fontSize: 14,
                      color: Colors.white,
                      fontWeight: FontWeight.w300,
                    ),
                  ),
                ],
              ),
            ),
            if (showAlert)
              Container(
                padding: const EdgeInsets.all(8),
                decoration: const BoxDecoration(
                  color: Colors.red,
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.priority_high,
                  color: Colors.white,
                  size: 16,
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildExamsButton(BuildContext context) {
    return Container(
      margin: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppTheme.primaryColor,
        borderRadius: BorderRadius.circular(10),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 4,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: InkWell(
        onTap: () => context.go('/exams'),
        borderRadius: BorderRadius.circular(10),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              const Icon(
                Icons.description,
                color: Colors.white,
                size: 24,
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Provas Disponíveis',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Acesse todas as provas oficiais do ENEM',
                      style: TextStyle(
                        fontSize: 14,
                        color: Colors.white.withOpacity(0.9),
                      ),
                    ),
                  ],
                ),
              ),
              const Icon(
                Icons.chevron_right,
                color: Colors.white,
                size: 24,
              ),
            ],
          ),
        ),
      ),
    );
  }


}
