import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import 'navigation/app_router.dart';
import 'services/services.dart';
import 'theme/app_theme.dart';

class EnemPrepApp extends StatelessWidget {
  const EnemPrepApp({super.key});

  @override
  Widget build(BuildContext context) {
    final dataService = Provider.of<DataService>(context);
    final storageService = Provider.of<StorageService>(context);

    // Set the storage service for the data service
    dataService.setStorageService(storageService);

    final appRouter = AppRouter(dataService: dataService);

    return MaterialApp.router(
      title: 'ENEM Prep.AI',
      theme: AppTheme.lightTheme,
      routerConfig: appRouter.router,
      debugShowCheckedModeBanner: false,
    );
  }
}
