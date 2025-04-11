import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import 'package:enemprep_flutter/services/data_service.dart';
import 'package:enemprep_flutter/services/storage_service.dart';
import 'package:enemprep_flutter/services/essay_evaluation_service.dart';
import 'package:enemprep_flutter/utils/logger_config.dart';
import 'package:enemprep_flutter/app.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Initialize logger
  final logger = LoggerConfig.getLogger();
  logger.i('Starting ENEM Prep.AI application');

  // Initialize services
  final dataService = DataService();
  final storageService = StorageService();
  final essayEvaluationService = EssayEvaluationService();

  // Initialize storage service
  await storageService.init();
  logger.i('Storage service initialized');

  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider<DataService>.value(value: dataService),
        Provider<StorageService>.value(value: storageService),
        ChangeNotifierProvider<EssayEvaluationService>.value(value: essayEvaluationService),
      ],
      child: const EnemPrepApp(),
    ),
  );
}
