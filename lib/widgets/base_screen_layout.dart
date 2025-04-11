import 'package:flutter/material.dart';
import '../widgets/bottom_nav_bar.dart';

class BaseScreenLayout extends StatelessWidget {
  final String title;
  final Widget body;
  final int currentNavIndex;
  final List<Widget>? actions;
  final Widget? floatingActionButton;
  final bool showBottomNav;

  const BaseScreenLayout({
    super.key,
    required this.title,
    required this.body,
    required this.currentNavIndex,
    this.actions,
    this.floatingActionButton,
    this.showBottomNav = true,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(title),
        actions: actions,
      ),
      body: body,
      bottomNavigationBar: showBottomNav 
          ? BottomNavBar(currentIndex: currentNavIndex)
          : null,
      floatingActionButton: floatingActionButton,
    );
  }
}
