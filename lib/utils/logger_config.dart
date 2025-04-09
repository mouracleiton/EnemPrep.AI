import 'package:logger/logger.dart';

/// Singleton logger configuration for the application
/// Provides consistent logging across the app
class LoggerConfig {
  static final LoggerConfig _instance = LoggerConfig._internal();
  late Logger _logger;

  /// Factory constructor to return the singleton instance
  factory LoggerConfig() {
    return _instance;
  }

  /// Private constructor for singleton pattern
  LoggerConfig._internal() {
    _logger = Logger(
      printer: PrettyPrinter(
        methodCount: 2,
        errorMethodCount: 8,
        lineLength: 120,
        colors: true,
        printEmojis: true,
        dateTimeFormat: DateTimeFormat.onlyTimeAndSinceStart,
      ),
      // Set to false in production to disable trace and debug logs
      level: Level.trace,
    );
  }

  /// Get the logger instance
  Logger get logger => _logger;

  /// Static method to get the logger directly
  static Logger getLogger() {
    return _instance._logger;
  }
}
