export enum QuestionType {
  MCQ = 'MCQ',
  TF = 'TF',
}

export interface MCQ {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface TFQ {
  question: string;
  isTrue: boolean;
  explanation: string;
}

export interface QuizData {
  mcqs: MCQ[];
  tfqs: TFQ[];
}

export interface QuizState {
  currentQuestionIndex: number;
  score: number;
  answers: (number | boolean | null)[]; // Store user answers
  isFinished: boolean;
  showExplanation: boolean;
  quizData: QuizData | null;
}

export type InputMode = 'text' | 'url' | 'file';