import React, { useState, useEffect, useMemo } from 'react';
import { Download, Trash2, Plus, Edit, Save, X, LogOut, Check, ArrowLeft, Settings } from 'lucide-react';
import { Exam, Question, StudentResult, Language } from '../types';
import { getStoredExams, saveStoredExams, getStoredResults } from '../services/storageService';
import { getTranslation } from '../translations';

interface AdminDashboardProps {
  onLogout: () => void;
  onQuestionsUpdate: () => void;
  language: Language;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout, onQuestionsUpdate, language }) => {
  const t = getTranslation(language);
  const [activeTab, setActiveTab] = useState<'results' | 'exams'>('results');
  const [results, setResults] = useState<StudentResult[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  
  // UI State for Exams
  const [isEditingExam, setIsEditingExam] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [isManagingQuestions, setIsManagingQuestions] = useState<string | null>(null); // Exam ID
  
  // UI State for Questions inside an Exam
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isEditingQuestionMode, setIsEditingQuestionMode] = useState(false);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = () => {
    setResults(getStoredResults());
    setExams(getStoredExams());
  };

  // Aggregation Logic for Pivot Table
  const aggregatedData = useMemo(() => {
    const studentMap: Record<string, { name: string; email: string; results: Record<string, StudentResult> }> = {};
    const allTitles = new Set<string>();

    // 1. Gather all potential exam titles from active exams
    exams.forEach(e => allTitles.add(e.title));

    // 2. Process results
    results.forEach(r => {
      const title = r.examTitle || 'Unknown Exam';
      allTitles.add(title);
      
      const emailKey = r.studentEmail.toLowerCase().trim();
      if (!studentMap[emailKey]) {
        studentMap[emailKey] = {
          name: r.studentName,
          email: r.studentEmail,
          results: {}
        };
      }
      // Update name to latest if needed, store result keyed by exam title
      studentMap[emailKey].name = r.studentName; 
      studentMap[emailKey].results[title] = r;
    });

    return {
      students: Object.values(studentMap).sort((a, b) => a.name.localeCompare(b.name)),
      examTitles: Array.from(allTitles).sort()
    };
  }, [results, exams]);

  const handleDownloadCSV = () => {
    const { students, examTitles } = aggregatedData;
    
    // Header Row
    const headers = ["Name", "Email", ...examTitles];
    
    // Data Rows
    const rows = students.map(student => {
      const examScores = examTitles.map(title => {
        const res = student.results[title];
        return res ? `${res.score}/${res.totalQuestions}` : "-";
      });
      return [student.name, student.email, ...examScores];
    });

    const csvContent = "data:text/csv;charset=utf-8," + 
      [headers.join(","), ...rows.map(e => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "consolidated_exam_results.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- EXAM MANAGEMENT ---

  const handleAddNewExam = () => {
    setEditingExam({
      id: "exam_" + Date.now(),
      title: "",
      description: "",
      questions: [],
      active: true
    });
    setIsEditingExam(true);
  };

  const handleEditExamMeta = (exam: Exam) => {
    setEditingExam({ ...exam });
    setIsEditingExam(true);
  };

  const handleDeleteExam = (id: string) => {
    if (window.confirm(t.deleteExamConfirm)) {
      const updated = exams.filter(e => e.id !== id);
      saveStoredExams(updated);
      setExams(updated);
      onQuestionsUpdate();
    }
  };

  const handleSaveExam = () => {
    if (!editingExam || !editingExam.title.trim()) return;
    
    let updatedExams = [...exams];
    const index = updatedExams.findIndex(e => e.id === editingExam.id);
    
    if (index > -1) {
      updatedExams[index] = editingExam;
    } else {
      updatedExams.push(editingExam);
    }

    saveStoredExams(updatedExams);
    setExams(updatedExams);
    setIsEditingExam(false);
    setEditingExam(null);
    onQuestionsUpdate();
  };

  // --- QUESTION MANAGEMENT ---

  const getActiveExam = () => exams.find(e => e.id === isManagingQuestions);

  const handleManageQuestions = (examId: string) => {
    setIsManagingQuestions(examId);
    setIsEditingQuestionMode(false);
    setEditingQuestion(null);
  };

  const handleAddQuestionToExam = () => {
    setEditingQuestion({
      id: Date.now(),
      text: "",
      options: ["", "", "", ""],
      correctAnswer: 0
    });
    setIsEditingQuestionMode(true);
  };

  const handleEditQuestion = (q: Question) => {
    setEditingQuestion({ ...q });
    setIsEditingQuestionMode(true);
  };

  const handleDeleteQuestionFromExam = (qId: number) => {
    if (!window.confirm(t.deleteConfirm)) return;
    const exam = getActiveExam();
    if (!exam) return;

    const updatedQuestions = exam.questions.filter(q => q.id !== qId);
    const updatedExam = { ...exam, questions: updatedQuestions };
    
    updateExamInStorage(updatedExam);
  };

  const handleSaveQuestion = () => {
    if (!editingQuestion || !editingQuestion.text.trim()) return;
    const exam = getActiveExam();
    if (!exam) return;

    let updatedQuestions = [...exam.questions];
    const index = updatedQuestions.findIndex(q => q.id === editingQuestion.id);

    if (index > -1) {
      updatedQuestions[index] = editingQuestion;
    } else {
      updatedQuestions.push(editingQuestion);
    }

    const updatedExam = { ...exam, questions: updatedQuestions };
    updateExamInStorage(updatedExam);
    
    setIsEditingQuestionMode(false);
    setEditingQuestion(null);
  };

  const updateExamInStorage = (updatedExam: Exam) => {
    const updatedExams = exams.map(e => e.id === updatedExam.id ? updatedExam : e);
    saveStoredExams(updatedExams);
    setExams(updatedExams);
    onQuestionsUpdate();
  };

  const updateOption = (idx: number, val: string) => {
    if (!editingQuestion) return;
    const newOptions = [...editingQuestion.options];
    newOptions[idx] = val;
    setEditingQuestion({ ...editingQuestion, options: newOptions });
  };

  // --- RENDERERS ---

  const renderResultsTable = () => {
    const { students, examTitles } = aggregatedData;

    return (
      <div className="bg-white rounded-xl shadow border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <h3 className="font-semibold text-slate-700">{t.submissionLog}</h3>
          <button 
            onClick={handleDownloadCSV}
            className="flex items-center space-x-2 text-sm bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>{t.exportExcel}</span>
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-100 text-slate-800 uppercase font-semibold text-xs">
              <tr>
                <th className="px-6 py-3 min-w-[200px]">{t.thName}</th>
                <th className="px-6 py-3 min-w-[200px]">{t.thEmail}</th>
                {examTitles.map(title => (
                  <th key={title} className="px-6 py-3 min-w-[150px] whitespace-nowrap border-l border-slate-200">
                    {title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {students.length === 0 ? (
                <tr>
                  <td colSpan={2 + examTitles.length} className="px-6 py-8 text-center text-slate-400">
                    {t.noSubmissions}
                  </td>
                </tr>
              ) : (
                students.map((student, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="px-6 py-3 font-medium text-slate-900">{student.name}</td>
                    <td className="px-6 py-3">{student.email}</td>
                    {examTitles.map(title => {
                      const res = student.results[title];
                      if (!res) return <td key={title} className="px-6 py-3 text-center border-l border-slate-100 text-slate-300">-</td>;
                      
                      return (
                        <td key={title} className="px-6 py-3 border-l border-slate-100">
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-700">
                              {res.score} <span className="text-slate-400 font-normal">/ {res.totalQuestions}</span>
                            </span>
                            <span className={`text-[10px] uppercase font-bold ${res.passed ? 'text-green-600' : 'text-orange-500'}`}>
                              {res.passed ? t.pass : t.fail}
                            </span>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderExamList = () => {
    if (isManagingQuestions) return renderQuestionManager();

    if (isEditingExam && editingExam) {
      return (
        <div className="bg-white p-6 rounded-xl shadow border border-slate-200 max-w-2xl mx-auto">
           <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-800">
              {exams.find(e => e.id === editingExam.id) ? "Edit Exam Details" : t.createExam}
            </h3>
            <button onClick={() => setIsEditingExam(false)} className="text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-4">
             <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t.examTitle}</label>
              <input
                type="text"
                value={editingExam.title}
                onChange={e => setEditingExam({ ...editingExam, title: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t.examDesc}</label>
              <textarea
                value={editingExam.description}
                onChange={e => setEditingExam({ ...editingExam, description: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                rows={3}
              />
            </div>
            <div className="flex items-center">
               <input
                type="checkbox"
                id="examActive"
                checked={editingExam.active}
                onChange={e => setEditingExam({ ...editingExam, active: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
              />
              <label htmlFor="examActive" className="ml-2 block text-sm text-slate-900">{t.active}</label>
            </div>
             <div className="pt-4 flex justify-end space-x-3">
              <button 
                onClick={() => setIsEditingExam(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                {t.cancel}
              </button>
              <button 
                onClick={handleSaveExam}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center"
              >
                <Save className="w-4 h-4 mr-2" />
                {t.saveExam}
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-slate-700">{t.availableExams}</h3>
          <button 
            onClick={handleAddNewExam}
            className="flex items-center space-x-2 text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>{t.createExam}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {exams.map(exam => (
            <div key={exam.id} className="bg-white p-5 rounded-xl shadow border border-slate-200 flex flex-col justify-between">
              <div>
                 <div className="flex justify-between items-start mb-2">
                   <h4 className="font-bold text-slate-800 text-lg">{exam.title}</h4>
                   <span className={`px-2 py-0.5 rounded text-xs font-semibold ${exam.active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                     {exam.active ? 'Active' : 'Inactive'}
                   </span>
                 </div>
                 <p className="text-sm text-slate-500 mb-4 line-clamp-2">{exam.description}</p>
                 <div className="text-xs text-slate-400 font-medium bg-slate-50 inline-block px-2 py-1 rounded mb-4">
                   {exam.questions.length} Questions
                 </div>
              </div>

              <div className="flex justify-between items-center border-t border-slate-100 pt-4">
                <button 
                  onClick={() => handleManageQuestions(exam.id)}
                  className="text-sm text-blue-600 hover:text-blue-800 font-semibold flex items-center"
                >
                  <Settings className="w-4 h-4 mr-1" /> {t.editQuestions}
                </button>
                <div className="flex space-x-1">
                   <button 
                    onClick={() => handleEditExamMeta(exam)}
                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                    title="Edit Details"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDeleteExam(exam.id)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                    title="Delete Exam"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderQuestionManager = () => {
    const exam = getActiveExam();
    if (!exam) return <div>Exam not found</div>;

    if (isEditingQuestionMode && editingQuestion) {
      // Re-use the previous Question Editor UI
      return (
        <div className="bg-white p-6 rounded-xl shadow border border-slate-200">
           <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-800">
              {exam.questions.find(q => q.id === editingQuestion.id) ? t.editQuestion : t.addNewQuestion}
            </h3>
            <button onClick={() => setIsEditingQuestionMode(false)} className="text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t.questionText}</label>
              <textarea
                value={editingQuestion.text}
                onChange={e => setEditingQuestion({ ...editingQuestion, text: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                rows={2}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {editingQuestion.options.map((opt, idx) => (
                <div key={idx}>
                  <label className="block text-xs font-medium text-slate-500 mb-1">{t.option} {idx + 1}</label>
                  <div className="flex items-center">
                    <span className="w-6 h-6 flex items-center justify-center bg-slate-100 text-slate-500 text-xs rounded-full mr-2">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <input
                      type="text"
                      value={opt}
                      onChange={e => updateOption(idx, e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    />
                  </div>
                </div>
              ))}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t.correctAnswer}</label>
              <select
                value={editingQuestion.correctAnswer}
                onChange={e => setEditingQuestion({ ...editingQuestion, correctAnswer: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                {editingQuestion.options.map((_, idx) => (
                  <option key={idx} value={idx}>{t.option} {String.fromCharCode(65 + idx)}</option>
                ))}
              </select>
            </div>
            <div className="pt-4 flex justify-end space-x-3">
              <button 
                onClick={() => setIsEditingQuestionMode(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                {t.cancel}
              </button>
              <button 
                onClick={handleSaveQuestion}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center"
              >
                <Save className="w-4 h-4 mr-2" />
                {t.saveQuestion}
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-xl shadow border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <div className="flex items-center space-x-3">
            <button onClick={() => setIsManagingQuestions(null)} className="p-1 hover:bg-slate-100 rounded">
               <ArrowLeft className="w-5 h-5 text-slate-500" />
            </button>
            <div>
              <h3 className="font-semibold text-slate-800">{exam.title}</h3>
              <p className="text-xs text-slate-500">{t.questionBank}</p>
            </div>
          </div>
          <button 
            onClick={handleAddQuestionToExam}
            className="flex items-center space-x-2 text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>{t.addQuestion}</span>
          </button>
        </div>
        <div className="divide-y divide-slate-100">
          {exam.questions.length === 0 ? (
             <div className="p-8 text-center text-slate-400">No questions added yet.</div>
          ) : (
            exam.questions.map((q, i) => (
              <div key={q.id} className="p-4 hover:bg-slate-50 flex justify-between items-start group">
                <div>
                  <p className="font-medium text-slate-900 mb-1">
                    <span className="text-slate-400 mr-2">{i + 1}.</span>
                    {q.text}
                  </p>
                  <div className="text-xs text-slate-500 pl-6 grid grid-cols-2 gap-x-4 gap-y-1">
                    {q.options.map((opt, idx) => (
                      <span key={idx} className={`flex items-center ${idx === q.correctAnswer ? 'text-green-600 font-medium' : ''}`}>
                        {idx === q.correctAnswer && <Check className="w-3 h-3 mr-1" />}
                        {String.fromCharCode(65 + idx)}. {opt}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => handleEditQuestion(q)}
                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDeleteQuestionFromExam(q.id)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-2xl font-bold text-slate-800">{t.adminDashboard}</h2>
        <button onClick={onLogout} className="flex items-center text-sm text-red-600 hover:text-red-700 font-medium">
          <LogOut className="w-4 h-4 mr-1" /> {t.logout}
        </button>
      </div>

      <div className="flex space-x-1 bg-slate-200 p-1 rounded-lg w-fit">
        <button
          onClick={() => { setActiveTab('results'); setIsManagingQuestions(null); }}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'results' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-800'}`}
        >
          {t.resultsExport}
        </button>
        <button
          onClick={() => setActiveTab('exams')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'exams' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-800'}`}
        >
          {t.manageExams}
        </button>
      </div>

      {activeTab === 'results' ? renderResultsTable() : renderExamList()}
    </div>
  );
};