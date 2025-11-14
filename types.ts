
export interface SubjectContent {
  transcripts: string;
  pdfs: string;
  pyqs: string;
}

export interface Subject extends SubjectContent {
  id: string;
  name: string;
}

export interface Question {
  id: string;
  subjectId: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  // Performance tracking
  isCorrect: boolean | null;
  attempts: number;
  lastAttemptCorrect: boolean;
  confidence: 'low' | 'medium' | 'high' | null;
}

export interface Quiz {
  questions: Question[];
  currentQuestionIndex: number;
  userAnswers: (string | null)[];
  isFinished: boolean;
}

export type AppView = 'dashboard' | 'subjects' | 'quiz' | 'quizSetup' | 'analytics';

export enum QuizMode {
  PostLecture = 'Post-Lecture',
  Revenge = 'Revenge Mode',
  DailyRevision = 'Daily Mixed Revision'
}
