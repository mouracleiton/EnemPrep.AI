import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:path_provider/path_provider.dart';
import 'dart:io';
import 'package:logger/logger.dart';

import '../models/models.dart';

class StorageService {
  late SharedPreferences _prefs;
  late Directory _appDocDir;
  late Directory _cacheDir;

  // Keys for SharedPreferences
  static const String _userAnswersKey = 'user_answers';
  static const String _studySessionsKey = 'study_sessions';
  static const String _essaysKey = 'essays';
  static const String _appVersionKey = 'app_version';

  // Initialize the service
  Future<void> init() async {
    _prefs = await SharedPreferences.getInstance();
    _appDocDir = await getApplicationDocumentsDirectory();
    _cacheDir = await getTemporaryDirectory();

    // Create necessary directories
    await _createDirectories();
  }

  // Create necessary directories
  Future<void> _createDirectories() async {
    final assetsDir = Directory('${_appDocDir.path}/assets');
    final imagesDir = Directory('${_appDocDir.path}/assets/images');
    final jsonDir = Directory('${_appDocDir.path}/assets/json');
    final cacheImagesDir = Directory('${_cacheDir.path}/images');

    if (!await assetsDir.exists()) {
      await assetsDir.create();
    }

    if (!await imagesDir.exists()) {
      await imagesDir.create();
    }

    if (!await jsonDir.exists()) {
      await jsonDir.create();
    }

    if (!await cacheImagesDir.exists()) {
      await cacheImagesDir.create();
    }
  }

  // Get the app version
  String getAppVersion() {
    return _prefs.getString(_appVersionKey) ?? '0.0.1';
  }

  // Set the app version
  Future<void> setAppVersion(String version) async {
    await _prefs.setString(_appVersionKey, version);
  }

  // Load user answers from storage
  List<UserAnswer> loadUserAnswers() {
    final String? data = _prefs.getString(_userAnswersKey);
    if (data == null) return [];

    try {
      final List<dynamic> jsonList = jsonDecode(data);
      return jsonList.map((json) => UserAnswer.fromJson(json)).toList();
    } catch (e) {
      Logger().e('Error loading user answers: $e');
      return [];
    }
  }

  // Save user answers to storage
  Future<void> saveUserAnswers(List<UserAnswer> answers) async {
    final List<Map<String, dynamic>> jsonList =
        answers.map((answer) => answer.toJson()).toList();
    await _prefs.setString(_userAnswersKey, jsonEncode(jsonList));
  }

  // Load study sessions from storage
  List<StudySession> loadStudySessions() {
    final String? data = _prefs.getString(_studySessionsKey);
    if (data == null) return [];

    try {
      final List<dynamic> jsonList = jsonDecode(data);
      return jsonList.map((json) => StudySession.fromJson(json)).toList();
    } catch (e) {
      Logger().e('Error loading study sessions: $e');
      return [];
    }
  }

  // Save study sessions to storage
  Future<void> saveStudySessions(List<StudySession> sessions) async {
    final List<Map<String, dynamic>> jsonList =
        sessions.map((session) => session.toJson()).toList();
    await _prefs.setString(_studySessionsKey, jsonEncode(jsonList));
  }

  // Get essays from storage
  String? getEssays() {
    return _prefs.getString(_essaysKey);
  }

  // Save essays to storage
  Future<void> saveEssays(String essaysJson) async {
    await _prefs.setString(_essaysKey, essaysJson);
  }

  // Get the path to the assets directory
  String get assetsPath => '${_appDocDir.path}/assets';

  // Get the path to the images directory
  String get imagesPath => '${_appDocDir.path}/assets/images';

  // Get the path to the json directory
  String get jsonPath => '${_appDocDir.path}/assets/json';

  // Get the path to the cache directory
  String get cachePath => _cacheDir.path;

  // Get the path to the cache images directory
  String get cacheImagesPath => '${_cacheDir.path}/images';

  // Save a file to the assets directory
  Future<File> saveAssetFile(String filename, List<int> bytes) async {
    final file = File('$assetsPath/$filename');
    return await file.writeAsBytes(bytes);
  }

  // Save a file to the images directory
  Future<File> saveImageFile(String filename, List<int> bytes) async {
    final file = File('$imagesPath/$filename');
    return await file.writeAsBytes(bytes);
  }

  // Save a file to the json directory
  Future<File> saveJsonFile(String filename, String content) async {
    final file = File('$jsonPath/$filename');
    return await file.writeAsString(content);
  }

  // Check if a file exists in the assets directory
  Future<bool> assetFileExists(String filename) async {
    final file = File('$assetsPath/$filename');
    return await file.exists();
  }

  // Check if a file exists in the images directory
  Future<bool> imageFileExists(String filename) async {
    final file = File('$imagesPath/$filename');
    return await file.exists();
  }

  // Check if a file exists in the json directory
  Future<bool> jsonFileExists(String filename) async {
    final file = File('$jsonPath/$filename');
    return await file.exists();
  }

  // Read a file from the assets directory
  Future<List<int>> readAssetFile(String filename) async {
    final file = File('$assetsPath/$filename');
    return await file.readAsBytes();
  }

  // Read a file from the images directory
  Future<List<int>> readImageFile(String filename) async {
    final file = File('$imagesPath/$filename');
    return await file.readAsBytes();
  }

  // Read a file from the json directory
  Future<String> readJsonFile(String filename) async {
    final file = File('$jsonPath/$filename');
    return await file.readAsString();
  }

  // Clear all cached data
  Future<void> clearCache() async {
    final cacheDir = Directory(cachePath);
    if (await cacheDir.exists()) {
      await cacheDir.delete(recursive: true);
      await cacheDir.create();
    }

    final cacheImagesDir = Directory(cacheImagesPath);
    if (!await cacheImagesDir.exists()) {
      await cacheImagesDir.create();
    }
  }
}
