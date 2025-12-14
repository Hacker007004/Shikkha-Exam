// The Google Apps Script Webhook URL provided
export const GOOGLE_SHEETS_WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbxIiAvK0ETWJ6DCnGumxq1AwLnpbIW1XKHemKsB9rG4CbyL1NqmFiljlIO9D9LdfmdW/exec";

// Local storage key for preventing duplicate submissions
// Stored as a list of strings: "email_examId"
export const STORAGE_KEY_TAKEN_EXAMS = "exam_portal_taken_exams_v2";

// Storage keys for Admin features
export const STORAGE_KEY_EXAMS = "exam_portal_exams";
export const STORAGE_KEY_RESULTS = "exam_portal_results";

export const ADMIN_CREDENTIALS = {
  username: "admin",
  password: "admin"
};