export type ScreenState = 'WELCOME' | 'CONFIG' | 'QUIZ' | 'RESULT';

export type OperationType = 'BASIC' | 'FULL'; // BASIC = (+, -), FULL = (+, -, *, /)

export interface GameConfig {
  userName: string;
  operation: OperationType;
  questionCount: number;
  maxNumber: number; // Determined by questionCount (difficulty tier)
}

export interface Problem {
  id: string;
  num1: number;
  num2: number;
  operator: string;
  answer: number;
}

export interface GameStats {
  totalAttempted: number;
  correct: number;
  incorrect: number;
  startTime: number;
  endTime: number;
  isTimeUp: boolean;
}

export interface HistoryRecord {
  id: string;
  timestamp: number;
  userName: string;
  operation: OperationType;
  grade: string;
  correct: number;
  total: number;
  timeString: string;
}

export const SECONDS_PER_QUESTION = 10;