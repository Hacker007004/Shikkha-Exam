import { Exam, StudentResult } from '../types';
import { INITIAL_EXAMS } from '../questions';
import { STORAGE_KEY_EXAMS, STORAGE_KEY_RESULTS, STORAGE_KEY_TAKEN_EXAMS } from '../constants';

// Legacy key support for migration
const LEGACY_STORAGE_KEY_QUESTIONS = "exam_portal_questions";
const LEGACY_STORAGE_KEY_TAKEN_EXAMS = "exam_portal_taken_emails";

export const getStoredExams = (): Exam[] => {
  const stored = localStorage.getItem(STORAGE_KEY_EXAMS);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error("Failed to parse stored exams", e);
    }
  }

  // Migration: Check for legacy single-exam questions
  const legacyQuestions = localStorage.getItem(LEGACY_STORAGE_KEY_QUESTIONS);
  if (legacyQuestions) {
    try {
      const questions = JSON.parse(legacyQuestions);
      const migratedExam: Exam = {
        id: "exam_migrated_" + Date.now(),
        title: "Legacy Exam",
        description: "Migrated from previous version",
        questions: questions,
        active: true
      };
      // Save new structure
      const newExams = [migratedExam, ...INITIAL_EXAMS.filter(e => e.id !== "exam_default_01")]; // Avoid dupes if needed
      saveStoredExams(newExams);
      // Clean up legacy
      localStorage.removeItem(LEGACY_STORAGE_KEY_QUESTIONS);
      return newExams;
    } catch (e) {
      console.error("Migration failed", e);
    }
  }

  return INITIAL_EXAMS;
};

export const saveStoredExams = (exams: Exam[]) => {
  localStorage.setItem(STORAGE_KEY_EXAMS, JSON.stringify(exams));
};

export const getStoredResults = (): StudentResult[] => {
  const stored = localStorage.getItem(STORAGE_KEY_RESULTS);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error("Failed to parse stored results", e);
    }
  }
  return [];
};

export const saveStoredResult = (result: StudentResult) => {
  const results = getStoredResults();
  results.push(result);
  localStorage.setItem(STORAGE_KEY_RESULTS, JSON.stringify(results));
};

// Check if a student has taken a specific exam
export const hasStudentTakenExam = (email: string, examId: string): boolean => {
  const key = `${email.toLowerCase().trim()}_${examId}`;
  const taken = JSON.parse(localStorage.getItem(STORAGE_KEY_TAKEN_EXAMS) || '[]');
  
  // Also check legacy storage for backward compatibility
  if (examId.startsWith("exam_migrated") || examId === "exam_default_01") {
     const legacyTaken = JSON.parse(localStorage.getItem(LEGACY_STORAGE_KEY_TAKEN_EXAMS) || '[]');
     if (legacyTaken.includes(email.toLowerCase().trim())) return true;
  }

  return taken.includes(key);
};

export const markExamAsTaken = (email: string, examId: string) => {
  const key = `${email.toLowerCase().trim()}_${examId}`;
  const taken = JSON.parse(localStorage.getItem(STORAGE_KEY_TAKEN_EXAMS) || '[]');
  if (!taken.includes(key)) {
    taken.push(key);
    localStorage.setItem(STORAGE_KEY_TAKEN_EXAMS, JSON.stringify(taken));
  }
};