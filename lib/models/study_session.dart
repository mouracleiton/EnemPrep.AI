class StudySession {
  final String id;
  final int timestamp;
  final List<String> disciplines;
  final int questionCount;
  int questionsAnswered;
  int correctAnswers;
  int lessonsViewed;

  StudySession({
    required this.id,
    required this.timestamp,
    required this.disciplines,
    required this.questionCount,
    this.questionsAnswered = 0,
    this.correctAnswers = 0,
    this.lessonsViewed = 0,
  });

  // Calculate completion percentage
  double get completionPercentage {
    if (questionCount == 0) return 0;
    return (questionsAnswered / questionCount) * 100;
  }

  // Calculate accuracy percentage
  double get accuracyPercentage {
    if (questionsAnswered == 0) return 0;
    return (correctAnswers / questionsAnswered) * 100;
  }

  // Check if the session is completed
  bool get isCompleted {
    return questionsAnswered >= questionCount;
  }

  // Factory method to create a StudySession from JSON
  factory StudySession.fromJson(Map<String, dynamic> json) {
    return StudySession(
      id: json['id'] ?? '',
      timestamp: json['timestamp'] ?? 0,
      disciplines: List<String>.from(json['disciplines'] ?? []),
      questionCount: json['questionCount'] ?? 0,
      questionsAnswered: json['questionsAnswered'] ?? 0,
      correctAnswers: json['correctAnswers'] ?? 0,
      lessonsViewed: json['lessonsViewed'] ?? 0,
    );
  }

  // Convert StudySession to JSON
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'timestamp': timestamp,
      'disciplines': disciplines,
      'questionCount': questionCount,
      'questionsAnswered': questionsAnswered,
      'correctAnswers': correctAnswers,
      'lessonsViewed': lessonsViewed,
    };
  }

  // Create a copy of this StudySession with updated fields
  StudySession copyWith({
    String? id,
    int? timestamp,
    List<String>? disciplines,
    int? questionCount,
    int? questionsAnswered,
    int? correctAnswers,
    int? lessonsViewed,
  }) {
    return StudySession(
      id: id ?? this.id,
      timestamp: timestamp ?? this.timestamp,
      disciplines: disciplines ?? this.disciplines,
      questionCount: questionCount ?? this.questionCount,
      questionsAnswered: questionsAnswered ?? this.questionsAnswered,
      correctAnswers: correctAnswers ?? this.correctAnswers,
      lessonsViewed: lessonsViewed ?? this.lessonsViewed,
    );
  }
}
