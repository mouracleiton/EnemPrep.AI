import 'dart:convert';
import 'package:logger/logger.dart';

// Create a logger for this class
final _logger = Logger();

class Question {
  final String title;
  final int index;
  final String discipline;
  final String? language;
  final int year;
  final String context;
  final List<String> files;
  final String correctAlternative;
  final String alternativesIntroduction;
  final List<Alternative> alternatives;
  final String? lesson;

  Question({
    required this.title,
    required this.index,
    required this.discipline,
    this.language,
    required this.year,
    required this.context,
    required this.files,
    required this.correctAlternative,
    required this.alternativesIntroduction,
    required this.alternatives,
    this.lesson,
  });

  // Generate a unique ID for the question
  // Handle the case where index or year might be invalid
  String get id {
    // Default to 0 if index or year is missing or invalid
    final safeYear = year > 0 ? year : 0;
    final safeIndex = index > 0 ? index : 0;
    return '$safeYear-$safeIndex';
  }

  // Check if an alternative is correct
  bool isAlternativeCorrect(String letter) {
    return letter == correctAlternative;
  }

  // Factory method to create a Question from JSON
  factory Question.fromJson(Map<String, dynamic> json) {
    // Parse alternatives from JSON string
    List<Alternative> parseAlternatives(dynamic alternativesData) {
      if (alternativesData == null) return [];

      try {
        // No arquivo JSON, alternatives é sempre uma string JSON
        if (alternativesData is String) {
          final List<dynamic> parsedData = jsonDecode(alternativesData) as List<dynamic>;
          return parsedData
              .map((alt) => Alternative.fromJson(alt as Map<String, dynamic>))
              .toList();
        }

        // Se já for uma lista, converta diretamente
        if (alternativesData is List) {
          return alternativesData
              .map((alt) => Alternative.fromJson(alt as Map<String, dynamic>))
              .toList();
        }
      } catch (e) {
        _logger.w('Erro ao processar alternativas: $e');
      }

      return [];
    }

    // Parse files from JSON string
    List<String> parseFiles(dynamic filesData) {
      if (filesData == null) return [];

      try {
        // No arquivo JSON, files é sempre uma string JSON representando uma lista vazia
        if (filesData is String) {
          // Se for "[]", retorne uma lista vazia
          if (filesData.trim() == "[]" || filesData.isEmpty) {
            return [];
          }

          final List<dynamic> parsedData = jsonDecode(filesData) as List<dynamic>;
          return parsedData.map((file) => file.toString()).toList();
        }

        // Se já for uma lista, converta diretamente
        if (filesData is List) {
          return filesData.map((file) => file.toString()).toList();
        }
      } catch (e) {
        _logger.w('Erro ao processar arquivos: $e');
      }

      return [];
    }

    // Sanitize text fields to handle potential encoding issues
    String sanitizeText(String? text) {
      if (text == null) return '';
      // Replace any problematic characters or sequences
      return text.replaceAll(RegExp(r'[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]'), '');
    }

    return Question(
      title: sanitizeText(json['title']),
      index: json['index'] ?? 0,
      discipline: sanitizeText(json['discipline']),
      language: json['language'] != null ? sanitizeText(json['language']) : null,
      year: json['year'] ?? 0,
      context: sanitizeText(json['context']),
      files: parseFiles(json['files']),
      correctAlternative: sanitizeText(json['correctAlternative']),
      alternativesIntroduction: sanitizeText(json['alternativesIntroduction'] ?? 'Assinale a alternativa correta:'),
      alternatives: parseAlternatives(json['alternatives']),
      lesson: json['lesson'] != null ? sanitizeText(json['lesson']) : null,
    );
  }

  // Convert Question to JSON
  Map<String, dynamic> toJson() {
    return {
      'title': title,
      'index': index,
      'discipline': discipline,
      'language': language,
      'year': year,
      'context': context,
      'files': files,
      'correctAlternative': correctAlternative,
      'alternativesIntroduction': alternativesIntroduction,
      'alternatives': alternatives.map((alt) => alt.toJson()).toList(),
      'lesson': lesson,
    };
  }
}

class Alternative {
  final String letter;
  final String text;
  final String? file;
  final bool isCorrect;

  Alternative({
    required this.letter,
    required this.text,
    this.file,
    required this.isCorrect,
  });

  // Factory method to create an Alternative from JSON
  factory Alternative.fromJson(Map<String, dynamic> json) {
    // Sanitize text fields to handle potential encoding issues
    String sanitizeText(String? text) {
      if (text == null) return '';
      // Replace any problematic characters or sequences
      return text.replaceAll(RegExp(r'[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]'), '');
    }

    // Trate os campos de texto para evitar problemas de codificação
    final String letter = sanitizeText(json['letter']);
    final String text = sanitizeText(json['text']);
    final String? file = json['file'] != null ? sanitizeText(json['file']) : null;

    // Determine se a alternativa é correta
    bool isCorrect = false;
    if (json['isCorrect'] is bool) {
      isCorrect = json['isCorrect'];
    } else if (json['isCorrect'] is String) {
      isCorrect = json['isCorrect'].toString().toLowerCase() == 'true';
    }

    return Alternative(
      letter: letter,
      text: text,
      file: file,
      isCorrect: isCorrect,
    );
  }

  // Convert Alternative to JSON
  Map<String, dynamic> toJson() {
    return {
      'letter': letter,
      'text': text,
      'file': file,
      'isCorrect': isCorrect,
    };
  }
}
