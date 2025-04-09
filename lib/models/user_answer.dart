class UserAnswer {
  final String questionId;
  final String selectedAlternative;
  final bool isCorrect;
  final int timestamp;
  final bool viewedLesson;
  final String? studySession;

  UserAnswer({
    required this.questionId,
    required this.selectedAlternative,
    required this.isCorrect,
    required this.timestamp,
    this.viewedLesson = false,
    this.studySession,
  });

  // Factory method to create a UserAnswer from JSON
  factory UserAnswer.fromJson(Map<String, dynamic> json) {
    return UserAnswer(
      questionId: json['questionId'] ?? '',
      selectedAlternative: json['selectedAlternative'] ?? '',
      isCorrect: json['isCorrect'] ?? false,
      timestamp: json['timestamp'] ?? 0,
      viewedLesson: json['viewedLesson'] ?? false,
      studySession: json['studySession'],
    );
  }

  // Convert UserAnswer to JSON
  Map<String, dynamic> toJson() {
    return {
      'questionId': questionId,
      'selectedAlternative': selectedAlternative,
      'isCorrect': isCorrect,
      'timestamp': timestamp,
      'viewedLesson': viewedLesson,
      'studySession': studySession,
    };
  }

  // Create a copy of this UserAnswer with updated fields
  UserAnswer copyWith({
    String? questionId,
    String? selectedAlternative,
    bool? isCorrect,
    int? timestamp,
    bool? viewedLesson,
    String? studySession,
  }) {
    return UserAnswer(
      questionId: questionId ?? this.questionId,
      selectedAlternative: selectedAlternative ?? this.selectedAlternative,
      isCorrect: isCorrect ?? this.isCorrect,
      timestamp: timestamp ?? this.timestamp,
      viewedLesson: viewedLesson ?? this.viewedLesson,
      studySession: studySession ?? this.studySession,
    );
  }
}
