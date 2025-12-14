export interface Question {
  id: number;
  text: string;
  options: string[];
  correctAnswer: number; // Index of the correct option
}

export interface Exam {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  active: boolean;
}

export interface StudentInfo {
  name: string;
  email: string;
}

export enum AppState {
  LANDING = 'LANDING',
  INFO_FORM = 'INFO_FORM',
  EXAM = 'EXAM',
  SUBMITTING = 'SUBMITTING',
  RESULT = 'RESULT',
  ERROR = 'ERROR',
  ADMIN_LOGIN = 'ADMIN_LOGIN',
  ADMIN_DASHBOARD = 'ADMIN_DASHBOARD',
}

export interface ExamResult {
  score: number;
  totalQuestions: number;
  passed: boolean;
}

export interface StudentResult extends ExamResult {
  studentName: string;
  studentEmail: string;
  timestamp: string;
  examId: string;
  examTitle: string;
}

export type Language = 'en' | 'bn';