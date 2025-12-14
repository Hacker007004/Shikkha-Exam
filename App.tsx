import React, { useState, useEffect } from 'react';
import { 
  ClipboardList, 
  CheckCircle, 
  AlertCircle, 
  User, 
  ChevronRight, 
  Loader2,
  Lock,
  Globe,
  BookOpen
} from 'lucide-react';
import { AppState, Exam, Question, StudentInfo, ExamResult, StudentResult, Language } from './types';
import { ADMIN_CREDENTIALS } from './constants';
import { submitToGoogleSheet } from './services/sheetService';
import { getStoredExams, saveStoredResult, hasStudentTakenExam, markExamAsTaken } from './services/storageService';
import { InputField } from './components/InputField';
import { AdminDashboard } from './components/AdminDashboard';
import { getTranslation } from './translations';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.LANDING);
  const [language, setLanguage] = useState<Language>('bn');
  const [studentInfo, setStudentInfo] = useState<StudentInfo>({ name: '', email: '' });
  
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [examResult, setExamResult] = useState<ExamResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');
  
  // Translation Helper
  const t = getTranslation(language);

  // Admin Login State
  const [adminUser, setAdminUser] = useState('');
  const [adminPass, setAdminPass] = useState('');

  // Load exams on mount
  useEffect(() => {
    refreshExams();
  }, []);

  const refreshExams = () => {
    const loadedExams = getStoredExams();
    setExams(loadedExams);
  };

  const handleExamSelect = (exam: Exam) => {
    setSelectedExam(exam);
    setAnswers(new Array(exam.questions.length).fill(-1));
    setCurrentQuestionIndex(0);
    setAppState(AppState.INFO_FORM);
    setErrorMsg('');
  };

  const handleAdminLoginClick = () => {
    setAppState(AppState.ADMIN_LOGIN);
    setErrorMsg('');
  };

  const handleAdminLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminUser === ADMIN_CREDENTIALS.username && adminPass === ADMIN_CREDENTIALS.password) {
      setAppState(AppState.ADMIN_DASHBOARD);
      setAdminUser('');
      setAdminPass('');
      setErrorMsg('');
    } else {
      setErrorMsg("Invalid credentials");
    }
  };

  const handleInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentInfo.name.trim() || !studentInfo.email.trim()) {
      setErrorMsg(t.fillAll);
      return;
    }

    if (!isValidEmail(studentInfo.email)) {
      setErrorMsg(t.validEmail);
      return;
    }

    if (!selectedExam) return;

    // Check Local Storage if student already took THIS exam
    if (hasStudentTakenExam(studentInfo.email, selectedExam.id)) {
      setAppState(AppState.ERROR);
      setErrorMsg(t.accessDenied);
      return;
    }

    setErrorMsg('');
    setAppState(AppState.EXAM);
  };

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleAnswerSelect = (optionIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = optionIndex;
    setAnswers(newAnswers);
  };

  const handleNextQuestion = () => {
    if (!selectedExam) return;
    if (currentQuestionIndex < selectedExam.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      finishExam();
    }
  };

  const finishExam = async () => {
    if (!selectedExam) return;
    setAppState(AppState.SUBMITTING);
    
    // Calculate Score
    let score = 0;
    const questions = selectedExam.questions;
    answers.forEach((answer, index) => {
      if (questions[index] && answer === questions[index].correctAnswer) {
        score++;
      }
    });

    const result: StudentResult = {
      score,
      totalQuestions: questions.length,
      passed: score >= (questions.length / 2),
      studentName: studentInfo.name,
      studentEmail: studentInfo.email,
      timestamp: new Date().toISOString(),
      examId: selectedExam.id,
      examTitle: selectedExam.title
    };

    setExamResult(result);

    // Save taken status locally
    markExamAsTaken(studentInfo.email, selectedExam.id);

    // Save result to local database for Admin
    saveStoredResult(result);

    // Attempt to Send to Google Sheet
    try {
      await submitToGoogleSheet(studentInfo, score, selectedExam.title);
    } catch (e) {
      console.warn("Sheet submission failed silently", e);
    }
    
    setAppState(AppState.RESULT);
  };

  // --- RENDER HELPERS ---

  const renderLanding = () => (
    <div className="flex flex-col items-center min-h-[60vh] text-center max-w-4xl mx-auto px-4 relative pt-10">
      <div className="bg-blue-100 p-4 rounded-full mb-6">
        <ClipboardList className="w-16 h-16 text-blue-600" />
      </div>
      <h1 className="text-4xl font-bold text-slate-900 mb-4 font-['Hind_Siliguri']">{t.landingTitle}</h1>
      <p className="text-lg text-slate-600 mb-10 leading-relaxed font-['Hind_Siliguri']">
        {t.landingDesc}
      </p>

      <div className="w-full">
        <h3 className="text-xl font-semibold text-slate-800 mb-6 text-left flex items-center">
          <BookOpen className="w-5 h-5 mr-2 text-blue-500" />
          {t.availableExams}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {exams.filter(e => e.active).length === 0 ? (
            <div className="col-span-full p-8 bg-slate-100 rounded-xl text-slate-500">
              {t.noExams}
            </div>
          ) : (
            exams.filter(e => e.active).map(exam => (
              <div key={exam.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow text-left flex flex-col">
                <h4 className="text-lg font-bold text-slate-900 mb-2">{exam.title}</h4>
                <p className="text-slate-500 text-sm mb-4 flex-grow">{exam.description}</p>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                  <span className="text-xs font-semibold bg-blue-50 text-blue-600 px-2 py-1 rounded">
                    {exam.questions.length} Questions
                  </span>
                  <button
                    onClick={() => handleExamSelect(exam)}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2 px-5 rounded-lg transition-colors flex items-center"
                  >
                    {t.startBtn} <ChevronRight className="ml-1 w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  const renderAdminLogin = () => (
    <div className="max-w-sm mx-auto bg-white p-8 rounded-2xl shadow-lg border border-slate-100 mt-10">
      <div className="text-center mb-6">
        <Lock className="w-12 h-12 text-slate-700 mx-auto mb-2" />
        <h2 className="text-2xl font-bold text-slate-800">{t.adminLogin}</h2>
      </div>
      <form onSubmit={handleAdminLoginSubmit}>
        <InputField
          label="Username"
          type="text"
          value={adminUser}
          onChange={(e) => setAdminUser(e.target.value)}
          required
        />
        <InputField
          label="Password"
          type="password"
          value={adminPass}
          onChange={(e) => setAdminPass(e.target.value)}
          required
        />
        {errorMsg && (
          <div className="mb-4 text-red-600 text-sm text-center font-medium">
            {errorMsg}
          </div>
        )}
        <button type="submit" className="w-full bg-slate-800 hover:bg-slate-900 text-white font-semibold py-3 rounded-lg">
          Login
        </button>
        <button 
          type="button" 
          onClick={() => setAppState(AppState.LANDING)}
          className="w-full mt-3 text-slate-500 text-sm hover:underline"
        >
          {t.backHome}
        </button>
      </form>
    </div>
  );

  const renderInfoForm = () => (
    <div className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-lg border border-slate-100 mt-10">
      <div className="text-center mb-6">
        <User className="w-12 h-12 text-blue-600 mx-auto mb-2" />
        <h2 className="text-2xl font-bold text-slate-800 font-['Hind_Siliguri']">{t.studentDetails}</h2>
        <p className="text-sm font-semibold text-blue-600 mb-2">{selectedExam?.title}</p>
        <p className="text-slate-500 font-['Hind_Siliguri']">{t.enterInfo} {selectedExam?.title}</p>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg mb-6 text-sm text-slate-700">
        <h4 className="font-semibold mb-2">{t.instructionsTitle}</h4>
        <ul className="list-disc list-inside space-y-1">
          <li>{t.instruction2}</li>
          <li>{t.instruction3}</li>
        </ul>
      </div>

      <form onSubmit={handleInfoSubmit}>
        <InputField
          label={t.fullName}
          type="text"
          value={studentInfo.name}
          onChange={(e) => setStudentInfo({ ...studentInfo, name: e.target.value })}
          placeholder="e.g. John Doe"
          required
        />
        <InputField
          label={t.email}
          type="email"
          value={studentInfo.email}
          onChange={(e) => setStudentInfo({ ...studentInfo, email: e.target.value })}
          placeholder="e.g. john.doe@gmail.com"
          required
        />

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center">
            <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
            {errorMsg}
          </div>
        )}

        <div className="flex space-x-3">
          <button
            type="button"
            onClick={() => {
              setAppState(AppState.LANDING);
              setSelectedExam(null);
            }}
            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold py-3 rounded-lg transition-colors mt-2"
          >
            {t.cancel}
          </button>
          <button
            type="submit"
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors mt-2"
          >
            {t.start}
          </button>
        </div>
      </form>
    </div>
  );

  const renderExam = () => {
    if (!selectedExam) return null;
    const questions = selectedExam.questions;
    if (questions.length === 0) return <div>No questions in this exam.</div>;
    const question = questions[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === questions.length - 1;
    const hasAnswered = answers[currentQuestionIndex] !== -1;

    return (
      <div className="max-w-2xl mx-auto mt-6">
        {/* Header with Exam Name */}
        <div className="mb-4 text-center">
          <h2 className="text-lg font-bold text-slate-700">{selectedExam.title}</h2>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-slate-500 mb-2">
            <span>{t.question} {currentQuestionIndex + 1} {t.of} {questions.length}</span>
            <span>{Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}% {t.completed}</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2.5">
            <div 
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white p-8 rounded-2xl shadow-md border border-slate-200">
          <h2 className="text-xl font-semibold text-slate-900 mb-6">
            {currentQuestionIndex + 1}. {question.text}
          </h2>

          <div className="space-y-3">
            {question.options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswerSelect(idx)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between group
                  ${answers[currentQuestionIndex] === idx 
                    ? 'border-blue-500 bg-blue-50 text-blue-700' 
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                  }`}
              >
                <span className="flex items-center">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium mr-3 border 
                    ${answers[currentQuestionIndex] === idx ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-slate-500 border-slate-300'}`}>
                    {String.fromCharCode(65 + idx)}
                  </span>
                  {option}
                </span>
                {answers[currentQuestionIndex] === idx && (
                  <CheckCircle className="w-5 h-5 text-blue-500" />
                )}
              </button>
            ))}
          </div>

          <div className="mt-8 flex justify-end">
            <button
              onClick={handleNextQuestion}
              disabled={!hasAnswered}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-8 rounded-lg transition-all flex items-center"
            >
              {isLastQuestion ? t.submit : t.next}
              {!isLastQuestion && <ChevronRight className="ml-2 w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderSubmitting = () => (
    <div className="flex flex-col items-center justify-center min-h-[50vh]">
      <Loader2 className="w-16 h-16 text-blue-600 animate-spin mb-4" />
      <h2 className="text-2xl font-semibold text-slate-800">{t.submitting}</h2>
      <p className="text-slate-500 mt-2">{t.doNotClose}</p>
    </div>
  );

  const renderResult = () => {
    if (!examResult) return null;

    return (
      <div className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-xl text-center border-t-4 border-blue-500 mt-10">
        <div className="mb-6 inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-3xl font-bold text-slate-900 mb-2 font-['Hind_Siliguri']">{t.examSubmitted}</h2>
        <p className="text-slate-600 mb-6 font-['Hind_Siliguri']">
          {t.thankYou}, <strong>{studentInfo.name}</strong>। {t.recorded}
        </p>

        <div className="bg-slate-50 rounded-xl p-6 mb-8">
          <p className="text-sm uppercase tracking-wide text-slate-500 font-semibold mb-1">{t.yourScore}</p>
          <div className="text-5xl font-bold text-blue-600 mb-2">
            {examResult.score} <span className="text-2xl text-slate-400 font-normal">/ {examResult.totalQuestions}</span>
          </div>
          <p className={`text-sm font-medium ${examResult.passed ? 'text-green-600' : 'text-orange-500'}`}>
            {examResult.passed ? t.excellent : t.keepPracticing}
          </p>
          <p className="text-xs text-slate-400 mt-2">{examResult.examTitle}</p>
        </div>
        
        <button 
          onClick={() => {
            setAppState(AppState.LANDING);
            setStudentInfo({name: '', email: ''});
            setAnswers([]);
            setCurrentQuestionIndex(0);
            setSelectedExam(null);
          }}
          className="text-blue-600 hover:underline"
        >
          {t.backHome}
        </button>
      </div>
    );
  };

  const renderError = () => (
    <div className="max-w-md mx-auto bg-red-50 p-8 rounded-2xl border border-red-100 text-center mt-10">
      <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
      <h2 className="text-2xl font-bold text-red-700 mb-2">{t.accessRestricted}</h2>
      <p className="text-red-600 mb-6">
        {errorMsg || "An unknown error occurred."}
      </p>
      <button 
        onClick={() => {
          setAppState(AppState.LANDING);
          setSelectedExam(null);
        }}
        className="text-red-700 font-medium hover:underline"
      >
        {t.returnHome}
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-['Hind_Siliguri']">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div 
            className="flex items-center space-x-3 cursor-pointer" 
            onClick={() => {
              setAppState(AppState.LANDING);
              setSelectedExam(null);
            }}
          >
            <img 
              src="https://shikkha.dev/uploads/logo_1761924429.png" 
              alt="Shikkha Logo" 
              className="h-10 w-auto"
            />
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setLanguage(l => l === 'en' ? 'bn' : 'en')}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium transition-colors"
            >
              <Globe className="w-4 h-4" />
              <span>{language === 'en' ? 'বাংলা' : 'English'}</span>
            </button>
            {appState === AppState.LANDING && (
              <button 
                onClick={handleAdminLoginClick}
                className="text-sm text-slate-500 hover:text-blue-600 font-medium transition-colors"
              >
                {t.adminLogin}
              </button>
            )}
            <div className="text-sm text-slate-400 font-medium hidden sm:block border-l pl-4 ml-2">
              {appState === AppState.ADMIN_DASHBOARD ? t.adminAccess : t.secureSystem}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex items-start justify-center p-4">
        <div className="w-full max-w-5xl animate-fade-in">
          {appState === AppState.LANDING && renderLanding()}
          {appState === AppState.ADMIN_LOGIN && renderAdminLogin()}
          {appState === AppState.ADMIN_DASHBOARD && (
            <AdminDashboard 
              onLogout={() => setAppState(AppState.LANDING)} 
              onQuestionsUpdate={refreshExams}
              language={language}
            />
          )}
          {appState === AppState.INFO_FORM && renderInfoForm()}
          {appState === AppState.EXAM && renderExam()}
          {appState === AppState.SUBMITTING && renderSubmitting()}
          {appState === AppState.RESULT && renderResult()}
          {appState === AppState.ERROR && renderError()}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-slate-400 text-sm">
        <p>&copy; {new Date().getFullYear()} {t.appBrand}. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default App;