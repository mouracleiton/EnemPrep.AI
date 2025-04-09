class Exam {
  final String title;
  final int year;
  final List<Discipline> disciplines;
  final List<Language> languages;

  Exam({
    required this.title,
    required this.year,
    required this.disciplines,
    required this.languages,
  });

  // Factory method to create an Exam from JSON
  factory Exam.fromJson(Map<String, dynamic> json) {
    return Exam(
      title: json['title'] ?? '',
      year: json['year'] ?? 0,
      disciplines: (json['disciplines'] as List<dynamic>?)
          ?.map((disc) => Discipline.fromJson(disc))
          .toList() ?? [],
      languages: (json['languages'] as List<dynamic>?)
          ?.map((lang) => Language.fromJson(lang))
          .toList() ?? [],
    );
  }

  // Convert Exam to JSON
  Map<String, dynamic> toJson() {
    return {
      'title': title,
      'year': year,
      'disciplines': disciplines.map((disc) => disc.toJson()).toList(),
      'languages': languages.map((lang) => lang.toJson()).toList(),
    };
  }
}

class Discipline {
  final String label;
  final String value;

  Discipline({
    required this.label,
    required this.value,
  });

  // Factory method to create a Discipline from JSON
  factory Discipline.fromJson(Map<String, dynamic> json) {
    return Discipline(
      label: json['label'] ?? '',
      value: json['value'] ?? '',
    );
  }

  // Convert Discipline to JSON
  Map<String, dynamic> toJson() {
    return {
      'label': label,
      'value': value,
    };
  }
}

class Language {
  final String label;
  final String value;

  Language({
    required this.label,
    required this.value,
  });

  // Factory method to create a Language from JSON
  factory Language.fromJson(Map<String, dynamic> json) {
    return Language(
      label: json['label'] ?? '',
      value: json['value'] ?? '',
    );
  }

  // Convert Language to JSON
  Map<String, dynamic> toJson() {
    return {
      'label': label,
      'value': value,
    };
  }
}
