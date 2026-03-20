export interface QuizQuestion {
  question: string;
  choices: [string, string, string, string];
  correctIndex: number;
  explanation: string;
}

export interface QuizConfig {
  topic: string;        // normalized key (for DB lookup)
  displayTopic: string; // human-readable label
  count: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface QuizState {
  config: QuizConfig;
  questions: QuizQuestion[];
  answers: number[]; // index into choices[], -1 = unanswered
}
