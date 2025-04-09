import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:url_launcher/url_launcher.dart';

import '../navigation/navigator_key.dart';

import '../theme/app_theme.dart';

class SupportScreen extends StatelessWidget {
  const SupportScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Apoie o Desenvolvedor'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildDeveloperCard(),
            const SizedBox(height: 24),
            _buildSupportOptions(),
            const SizedBox(height: 24),
            _buildAboutApp(),
          ],
        ),
      ),
    );
  }

  Widget _buildDeveloperCard() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppTheme.primaryColor.withOpacity(0.1),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: AppTheme.primaryColor.withOpacity(0.3)),
      ),
      child: const Column(
        children: [
          CircleAvatar(
            radius: 40,
            backgroundColor: AppTheme.primaryColor,
            child: Icon(
              Icons.person,
              size: 40,
              color: Colors.white,
            ),
          ),
          SizedBox(height: 16),
          Text(
            'Desenvolvido por',
            style: TextStyle(
              fontSize: 14,
              color: AppTheme.textColor,
            ),
          ),
          SizedBox(height: 4),
          Text(
            'Desenvolvedor ENEM Prep.AI',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: AppTheme.primaryColor,
            ),
          ),
          SizedBox(height: 8),
          Text(
            'Este aplicativo foi desenvolvido para ajudar estudantes a se prepararem para o ENEM de forma gratuita e eficiente.',
            style: TextStyle(
              fontSize: 14,
              color: AppTheme.textColor,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  Widget _buildSupportOptions() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: AppTheme.cardDecoration,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Formas de Apoio',
            style: AppTheme.subheadingStyle,
          ),
          const SizedBox(height: 16),
          _buildSupportOption(
            'PIX',
            'Faça uma doação via PIX para ajudar a manter o aplicativo.',
            Icons.attach_money,
            () => _showPixDialog(),
          ),
          const SizedBox(height: 16),
          _buildSupportOption(
            'Avalie o App',
            'Deixe uma avaliação positiva na loja de aplicativos.',
            Icons.star,
            () => _launchAppStore(),
          ),
          const SizedBox(height: 16),
          _buildSupportOption(
            'Compartilhe',
            'Indique o aplicativo para seus amigos e colegas.',
            Icons.share,
            () => _shareApp(),
          ),
          const SizedBox(height: 16),
          _buildSupportOption(
            'Feedback',
            'Envie sugestões e reporte problemas para melhorarmos o app.',
            Icons.feedback,
            () => _sendFeedback(),
          ),
        ],
      ),
    );
  }

  Widget _buildSupportOption(
    String title,
    String description,
    IconData icon,
    VoidCallback onTap,
  ) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(10),
      child: Padding(
        padding: const EdgeInsets.all(8),
        child: Row(
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
            const Icon(
              Icons.chevron_right,
              color: AppTheme.primaryColor,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAboutApp() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: AppTheme.cardDecoration,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Sobre o Aplicativo',
            style: AppTheme.subheadingStyle,
          ),
          const SizedBox(height: 16),
          _buildInfoRow('Versão', '0.0.4'),
          _buildInfoRow('Questões', '1000+'),
          _buildInfoRow('Atualizações', 'Mensais'),
          _buildInfoRow('Licença', 'Uso Pessoal'),
          const SizedBox(height: 16),
          const Text(
            'Este aplicativo utiliza dados públicos do ENEM e tecnologia de IA para gerar aulas explicativas. Todo o conteúdo é disponibilizado para fins educacionais.',
            style: TextStyle(
              fontSize: 14,
              color: AppTheme.textLightColor,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: const TextStyle(
              fontSize: 14,
              color: AppTheme.textColor,
            ),
          ),
          Text(
            value,
            style: const TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.bold,
              color: AppTheme.textColor,
            ),
          ),
        ],
      ),
    );
  }

  void _showPixDialog() {
    // This is a mock implementation
    const pixKey = 'exemplo@email.com';

    showDialog(
      context: navigatorKey.currentContext!,
      builder: (context) => AlertDialog(
        title: const Text('Doação via PIX'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text(
              'Utilize a chave PIX abaixo para fazer uma doação:',
              style: TextStyle(fontSize: 14),
            ),
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.grey[200],
                borderRadius: BorderRadius.circular(8),
              ),
              child: Row(
                children: [
                  const Expanded(
                    child: Text(
                      pixKey,
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.copy),
                    onPressed: () {
                      Clipboard.setData(const ClipboardData(text: pixKey));
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Chave PIX copiada!')),
                      );
                    },
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            const Text(
              'Qualquer valor é bem-vindo e ajuda a manter o aplicativo gratuito para todos.',
              style: TextStyle(fontSize: 14),
              textAlign: TextAlign.center,
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Fechar'),
          ),
        ],
      ),
    );
  }

  void _launchAppStore() {
    // This is a mock implementation
    final uri = Uri.parse('https://play.google.com/store/apps/details?id=com.enemprepai.app');
    _launchURL(uri);
  }

  void _shareApp() {
    // This is a mock implementation
    const text = 'Estou usando o ENEM Prep.AI para estudar para o ENEM! Baixe também: https://play.google.com/store/apps/details?id=com.enemprepai.app';
    final uri = Uri.parse('https://api.whatsapp.com/send?text=${Uri.encodeComponent(text)}');
    _launchURL(uri);
  }

  void _sendFeedback() {
    // This is a mock implementation
    final uri = Uri.parse('mailto:contato@enemprepai.com?subject=Feedback%20do%20App');
    _launchURL(uri);
  }

  Future<void> _launchURL(Uri uri) async {
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    } else {
      throw 'Could not launch $uri';
    }
  }
}


