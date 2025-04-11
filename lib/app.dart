import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import 'navigation/app_router.dart';
import 'services/services.dart';
import 'theme/app_theme.dart';

class EnemPrepApp extends StatefulWidget {
  const EnemPrepApp({super.key});

  @override
  State<EnemPrepApp> createState() => _EnemPrepAppState();
}

class _EnemPrepAppState extends State<EnemPrepApp> {
  @override
  void initState() {
    super.initState();
    final dataService = Provider.of<DataService>(context, listen: false);
    final storageService = Provider.of<StorageService>(context, listen: false);
    final essayEvaluationService = Provider.of<EssayEvaluationService>(context, listen: false);

    // Set the storage service for the data service
    dataService.setStorageService(storageService);

    // Set the storage service for the essay evaluation service
    essayEvaluationService.setStorageService(storageService);
  }

  @override
  Widget build(BuildContext context) {
    final dataService = Provider.of<DataService>(context);
    final appRouter = AppRouter(dataService: dataService);

    return MaterialApp.router(
      title: 'ENEM Prep.AI',
      theme: AppTheme.lightTheme,
      routerConfig: appRouter.router,
      debugShowCheckedModeBanner: false,
    );
  }
}
