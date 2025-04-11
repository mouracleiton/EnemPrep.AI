import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../theme/app_theme.dart';

class BottomNavBar extends StatelessWidget {
  final int currentIndex;

  const BottomNavBar({
    super.key,
    required this.currentIndex,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
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
      child: BottomNavigationBar(
        currentIndex: currentIndex,
        type: BottomNavigationBarType.fixed,
        backgroundColor: Colors.white,
        selectedItemColor: AppTheme.primaryColor,
        unselectedItemColor: Colors.grey,
        selectedLabelStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
        unselectedLabelStyle: const TextStyle(fontSize: 12),
        onTap: (index) => _onItemTapped(context, index),
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.home),
            label: 'Início',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.school),
            label: 'Estudar',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.bar_chart),
            label: 'Estatísticas',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.edit_document),
            label: 'Redação',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.download),
            label: 'Modelo IA',
          ),
        ],
      ),
    );
  }

  void _onItemTapped(BuildContext context, int index) {
    final String route;
    
    // Evitar recarregar a página atual
    if (index == currentIndex) return;
    
    switch (index) {
      case 0:
        route = '/';
        break;
      case 1:
        route = '/study';
        break;
      case 2:
        route = '/stats';
        break;
      case 3:
        route = '/essay';
        break;
      case 4:
        route = '/model-download';
        break;
      default:
        route = '/';
    }
    
    context.go(route);
  }
}
