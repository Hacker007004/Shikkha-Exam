import { Language } from './types';

export const TRANSLATIONS = {
  en: {
    // Header
    appBrand: "Shikkha",
    adminLogin: "Admin Login",
    adminAccess: "Administrator Access",
    secureSystem: "Secure Assessment System",
    
    // Landing
    landingTitle: "Examination Portal",
    landingDesc: "Select an exam below to begin. Ensure you have a stable internet connection.",
    availableExams: "Available Exams",
    startBtn: "Start",
    noExams: "No exams are currently available.",
    
    // Instructions (Generic)
    instructionsTitle: "Instructions:",
    instruction1: "Ensure you have a stable internet connection.",
    instruction2: "Enter your official name and Gmail address correctly.",
    instruction3: "One attempt only per exam.",
    instruction4: "Results will be automatically recorded.",
    
    // Info Form
    studentDetails: "Student Details",
    enterInfo: "Enter your details for:",
    fullName: "Full Name",
    email: "Gmail Address",
    cancel: "Cancel",
    start: "Start Exam",
    fillAll: "Please fill in all fields.",
    validEmail: "Please enter a valid gmail address.",
    
    // Exam
    question: "Question",
    of: "of",
    completed: "Completed",
    next: "Next Question",
    submit: "Submit Exam",
    
    // Submitting
    submitting: "Submitting your results...",
    doNotClose: "Please do not close this window.",
    
    // Result
    examSubmitted: "Exam Submitted!",
    thankYou: "Thank you",
    recorded: "Your answers have been successfully recorded.",
    yourScore: "Your Score",
    excellent: "Excellent Job!",
    keepPracticing: "Keep Practicing!",
    backHome: "Back to Home",
    
    // Error
    accessRestricted: "Access Restricted",
    accessDenied: "Access Denied: You have already submitted this exam.",
    returnHome: "Return to Home",
    
    // Admin
    adminDashboard: "Admin Dashboard",
    logout: "Logout",
    resultsExport: "Results",
    manageExams: "Manage Exams",
    exportExcel: "Export CSV",
    submissionLog: "Student Submission Log",
    noSubmissions: "No submissions yet.",
    
    // Exam Management
    createExam: "Create New Exam",
    examTitle: "Exam Title",
    examDesc: "Description",
    active: "Active",
    actions: "Actions",
    editQuestions: "Questions",
    delete: "Delete",
    saveExam: "Save Exam",
    deleteExamConfirm: "Are you sure you want to delete this exam and all its questions?",
    
    // Question Editor
    questionBank: "Question Bank",
    backToExams: "Back to Exams",
    addQuestion: "Add Question",
    editQuestion: "Edit Question",
    addNewQuestion: "Add New Question",
    questionText: "Question Text",
    option: "Option",
    correctAnswer: "Correct Answer",
    saveQuestion: "Save Question",
    deleteConfirm: "Are you sure you want to delete this question?",
    
    // Table Headers
    thName: "Name",
    thEmail: "Email",
    thExam: "Exam",
    thScore: "Score",
    thStatus: "Status",
    thDate: "Date",
    pass: "PASS",
    fail: "FAIL",
    yes: "Yes",
    no: "No"
  },
  bn: {
    // Header
    appBrand: "শিক্ষা",
    adminLogin: "অ্যাডমিন লগইন",
    adminAccess: "প্রশাসক অ্যাক্সেস",
    secureSystem: "সুরক্ষিত মূল্যায়ন সিস্টেম",
    
    // Landing
    landingTitle: "পরীক্ষা পোর্টাল",
    landingDesc: "শুরু করতে নিচে থেকে একটি পরীক্ষা নির্বাচন করুন। আপনার ইন্টারনেট সংযোগ নিশ্চিত করুন।",
    availableExams: "উপলব্ধ পরীক্ষা",
    startBtn: "শুরু করুন",
    noExams: "বর্তমানে কোন পরীক্ষা উপলব্ধ নেই।",
    
    // Instructions
    instructionsTitle: "নির্দেশাবলী:",
    instruction1: "আপনার ইন্টারনেট সংযোগ ঠিক আছে কিনা নিশ্চিত করুন।",
    instruction2: "আপনার সঠিক নাম এবং জিমেইল ঠিকানা লিখুন।",
    instruction3: "প্রতিটি পরীক্ষার জন্য মাত্র একবার চেষ্টা করা যাবে।",
    instruction4: "ফলাফল স্বয়ংক্রিয়ভাবে রেকর্ড করা হবে।",
    
    // Info Form
    studentDetails: "শিক্ষার্থীর বিবরণ",
    enterInfo: "আপনার তথ্য দিন:",
    fullName: "পূর্ণ নাম",
    email: "জিমেইল ঠিকানা",
    cancel: "বাতিল",
    start: "পরীক্ষা শুরু করুন",
    fillAll: "অনুগ্রহ করে সব ঘর পূরণ করুন।",
    validEmail: "অনুগ্রহ করে একটি সঠিক জিমেইল ঠিকানা লিখুন।",
    
    // Exam
    question: "প্রশ্ন",
    of: "এর",
    completed: "সম্পন্ন",
    next: "পরবর্তী প্রশ্ন",
    submit: "জমা দিন",
    
    // Submitting
    submitting: "ফলাফল জমা দেওয়া হচ্ছে...",
    doNotClose: "অনুগ্রহ করে এই উইন্ডোটি বন্ধ করবেন না।",
    
    // Result
    examSubmitted: "পরীক্ষা সম্পন্ন হয়েছে!",
    thankYou: "ধন্যবাদ",
    recorded: "আপনার উত্তরগুলি সফলভাবে রেকর্ড করা হয়েছে।",
    yourScore: "আপনার স্কোর",
    excellent: "অসাধারণ কাজ!",
    keepPracticing: "অনুশীলন চালিয়ে যান!",
    backHome: "নীড়ে ফিরে যান",
    
    // Error
    accessRestricted: "প্রবেশাধিকার সংরক্ষিত",
    accessDenied: "প্রবেশ নিষিদ্ধ: আপনি ইতিমধ্যে এই পরীক্ষাটি জমা দিয়েছেন।",
    returnHome: "নীড়ে ফিরে যান",
    
    // Admin
    adminDashboard: "অ্যাডমিন ড্যাশবোর্ড",
    logout: "লগআউট",
    resultsExport: "ফলাফল",
    manageExams: "পরীক্ষা ম্যানেজ করুন",
    exportExcel: "CSV ডাউনলোড",
    submissionLog: "শিক্ষার্থীদের জমার তালিকা",
    noSubmissions: "এখনও কোন জমা নেই।",
    
    // Exam Management
    createExam: "নতুন পরীক্ষা তৈরি করুন",
    examTitle: "পরীক্ষার শিরোনাম",
    examDesc: "বিবরণ",
    active: "সক্রিয়",
    actions: "অ্যাকশন",
    editQuestions: "প্রশ্নাবলী",
    delete: "মুছুন",
    saveExam: "পরীক্ষা সংরক্ষণ করুন",
    deleteExamConfirm: "আপনি কি নিশ্চিত যে আপনি এই পরীক্ষা এবং এর সমস্ত প্রশ্ন মুছে ফেলতে চান?",
    
    // Question Editor
    questionBank: "প্রশ্ন ব্যাংক",
    backToExams: "তালিকায় ফিরে যান",
    addQuestion: "প্রশ্ন যোগ করুন",
    editQuestion: "প্রশ্ন সম্পাদনা",
    addNewQuestion: "নতুন প্রশ্ন যোগ করুন",
    questionText: "প্রশ্নের টেক্সট",
    option: "অপশন",
    correctAnswer: "সঠিক উত্তর",
    saveQuestion: "সংরক্ষণ করুন",
    deleteConfirm: "আপনি কি নিশ্চিত যে আপনি এই প্রশ্নটি মুছে ফেলতে চান?",
    
    // Table Headers
    thName: "নাম",
    thEmail: "ইমেল",
    thExam: "পরীক্ষা",
    thScore: "স্কোর",
    thStatus: "অবস্থা",
    thDate: "তারিখ",
    pass: "পাস",
    fail: "ফেইল",
    yes: "হ্যাঁ",
    no: "না"
  }
};

export const getTranslation = (lang: Language) => TRANSLATIONS[lang];