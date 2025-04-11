class EssayEvaluation {
  final String id;
  final String text;
  final String title;
  final int timestamp;
  final int wordCount;
  final int lineCount;
  final CompetencyScores competencyScores;
  final int totalScore;
  final EssayFeedback feedback;

  EssayEvaluation({
    required this.id,
    required this.text,
    required this.title,
    required this.timestamp,
    required this.wordCount,
    required this.lineCount,
    required this.competencyScores,
    required this.totalScore,
    required this.feedback,
  });

  // Factory method to create an EssayEvaluation from JSON
  factory EssayEvaluation.fromJson(Map<String, dynamic> json) {
    return EssayEvaluation(
      id: json['id'] ?? '',
      text: json['text'] ?? '',
      title: json['title'] ?? '',
      timestamp: json['timestamp'] ?? 0,
      wordCount: json['wordCount'] ?? 0,
      lineCount: json['lineCount'] ?? 0,
      competencyScores: CompetencyScores.fromJson(json['competencyScores'] ?? {}),
      totalScore: json['totalScore'] ?? 0,
      feedback: EssayFeedback.fromJson(json['feedback'] ?? {}),
    );
  }

  // Convert EssayEvaluation to JSON
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'text': text,
      'title': title,
      'timestamp': timestamp,
      'wordCount': wordCount,
      'lineCount': lineCount,
      'competencyScores': competencyScores.toJson(),
      'totalScore': totalScore,
      'feedback': feedback.toJson(),
    };
  }
}

class CompetencyScores {
  final int competency1; // Domínio da norma culta (0-200)
  final int competency2; // Compreensão da proposta (0-200)
  final int competency3; // Argumentação (0-200)
  final int competency4; // Coesão textual (0-200)
  final int competency5; // Proposta de intervenção (0-200)

  CompetencyScores({
    required this.competency1,
    required this.competency2,
    required this.competency3,
    required this.competency4,
    required this.competency5,
  });

  // Factory method to create CompetencyScores from JSON
  factory CompetencyScores.fromJson(Map<String, dynamic> json) {
    return CompetencyScores(
      competency1: json['competency1'] ?? 0,
      competency2: json['competency2'] ?? 0,
      competency3: json['competency3'] ?? 0,
      competency4: json['competency4'] ?? 0,
      competency5: json['competency5'] ?? 0,
    );
  }

  // Convert CompetencyScores to JSON
  Map<String, dynamic> toJson() {
    return {
      'competency1': competency1,
      'competency2': competency2,
      'competency3': competency3,
      'competency4': competency4,
      'competency5': competency5,
    };
  }
}

class EssayFeedback {
  final String generalAnalysis;
  final String competency1Feedback;
  final String competency2Feedback;
  final String competency3Feedback;
  final String competency4Feedback;
  final String competency5Feedback;
  final String summary;

  EssayFeedback({
    required this.generalAnalysis,
    required this.competency1Feedback,
    required this.competency2Feedback,
    required this.competency3Feedback,
    required this.competency4Feedback,
    required this.competency5Feedback,
    required this.summary,
  });

  // Factory method to create EssayFeedback from JSON
  factory EssayFeedback.fromJson(Map<String, dynamic> json) {
    return EssayFeedback(
      generalAnalysis: json['generalAnalysis'] ?? '',
      competency1Feedback: json['competency1Feedback'] ?? '',
      competency2Feedback: json['competency2Feedback'] ?? '',
      competency3Feedback: json['competency3Feedback'] ?? '',
      competency4Feedback: json['competency4Feedback'] ?? '',
      competency5Feedback: json['competency5Feedback'] ?? '',
      summary: json['summary'] ?? '',
    );
  }

  // Convert EssayFeedback to JSON
  Map<String, dynamic> toJson() {
    return {
      'generalAnalysis': generalAnalysis,
      'competency1Feedback': competency1Feedback,
      'competency2Feedback': competency2Feedback,
      'competency3Feedback': competency3Feedback,
      'competency4Feedback': competency4Feedback,
      'competency5Feedback': competency5Feedback,
      'summary': summary,
    };
  }
}
