import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../services/data_service.dart';
import '../screens/main_screen.dart';
import '../screens/question_screen.dart';
import '../screens/lesson_screen.dart';
import '../screens/study_screen.dart';
import '../screens/study_results_screen.dart';
import '../screens/stats_screen.dart';
import '../screens/model_download_screen.dart';
import '../screens/support_screen.dart';
import '../screens/essay_screen.dart';
import '../screens/essay_input_screen.dart';
import '../screens/essay_result_screen.dart';
import '../screens/exams_list_screen.dart';
import '../screens/exam_detail_screen.dart';

class AppRouter {
  final DataService dataService;
  
  AppRouter({required this.dataService});
  
  late final router = GoRouter(
    initialLocation: '/',
    routes: [
      GoRoute(
        path: '/',
        builder: (context, state) => const MainScreen(),
      ),
      GoRoute(
        path: '/question/:questionId',
        builder: (context, state) {
          final questionId = state.pathParameters['questionId'] ?? '';
          final studySessionId = state.uri.queryParameters['studySessionId'];
          return QuestionScreen(
            questionId: questionId,
            studySessionId: studySessionId,
          );
        },
      ),
      GoRoute(
        path: '/lesson/:questionId',
        builder: (context, state) {
          final questionId = state.pathParameters['questionId'] ?? '';
          final studySessionId = state.uri.queryParameters['studySessionId'];
          return LessonScreen(
            questionId: questionId,
            studySessionId: studySessionId,
          );
        },
      ),
      GoRoute(
        path: '/study',
        builder: (context, state) => const StudyScreen(),
      ),
      GoRoute(
        path: '/study-results/:studySessionId',
        builder: (context, state) {
          final studySessionId = state.pathParameters['studySessionId'] ?? '';
          return StudyResultsScreen(studySessionId: studySessionId);
        },
      ),
      GoRoute(
        path: '/stats',
        builder: (context, state) => const StatsScreen(),
      ),
      GoRoute(
        path: '/model-download',
        builder: (context, state) => const ModelDownloadScreen(),
      ),
      GoRoute(
        path: '/support',
        builder: (context, state) => const SupportScreen(),
      ),
      GoRoute(
        path: '/essay',
        builder: (context, state) => const EssayScreen(),
      ),
      GoRoute(
        path: '/essay-input',
        builder: (context, state) => const EssayInputScreen(),
      ),
      GoRoute(
        path: '/essay-result/:evaluationId',
        builder: (context, state) {
          final evaluationId = state.pathParameters['evaluationId'] ?? '';
          return EssayResultScreen(evaluationId: evaluationId);
        },
      ),
      GoRoute(
        path: '/exams',
        builder: (context, state) => const ExamsListScreen(),
      ),
      GoRoute(
        path: '/exam/:year/:type',
        builder: (context, state) {
          final year = int.tryParse(state.pathParameters['year'] ?? '0') ?? 0;
          final type = state.pathParameters['type'] ?? '';
          return ExamDetailScreen(
            examYear: year,
            examType: type,
          );
        },
      ),
    ],
    errorBuilder: (context, state) => Scaffold(
      appBar: AppBar(
        title: const Text('Página não encontrada'),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Text(
              'Oops! Página não encontrada.',
              style: TextStyle(fontSize: 18),
            ),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: () => context.go('/'),
              child: const Text('Voltar para o início'),
            ),
          ],
        ),
      ),
    ),
  );
}
