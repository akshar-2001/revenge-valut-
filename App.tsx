
import React, { useState, useCallback, useMemo } from 'react';
import { Subject, Question, AppView, SubjectContent, Quiz, QuizMode } from './types';
import { generateMCQs } from './services/geminiService';
import { SubjectsView } from './components/SubjectsView';
import { QuizSetup } from './components/QuizSetup';
import { QuizView } from './components/QuizView';
import { Dashboard } from './components/Dashboard';
// Fix: Imported SparklesIcon which was missing.
import { BrainIcon, BookOpenIcon, ChartBarIcon, SparklesIcon } from './components/Icons';

// Main App Component
const App: React.FC = () => {
    const [view, setView] = useState<AppView>('dashboard');
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [questionBank, setQuestionBank] = useState<Question[]>([]);
    const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    
    // --- State Management Callbacks ---
    const handleAddSubject = useCallback((name: string) => {
        const newSubject: Subject = {
            id: Date.now().toString(),
            name,
            transcripts: '',
            pdfs: '',
            pyqs: '',
        };
        setSubjects(prev => [...prev, newSubject]);
    }, []);

    const handleUpdateSubjectContent = useCallback((id: string, content: SubjectContent) => {
        setSubjects(prev => prev.map(s => s.id === id ? { ...s, ...content } : s));
    }, []);

    const handleDeleteSubject = useCallback((id: string) => {
        setSubjects(prev => prev.filter(s => s.id !== id));
        setQuestionBank(prev => prev.filter(q => q.subjectId !== id));
    }, []);

    // --- Quiz Logic ---
    const handleStartQuiz = useCallback(async (subjectId: string, mode: QuizMode, questionCount: number) => {
        setIsLoading(true);
        setError(null);
        
        try {
            let questionsForQuiz: Question[] = [];

            if (mode === QuizMode.Revenge) {
                questionsForQuiz = questionBank.filter(q => q.lastAttemptCorrect === false);
            } else if (mode === QuizMode.DailyRevision) {
                const revengeQs = questionBank.filter(q => q.lastAttemptCorrect === false);
                const revisionQs = questionBank.filter(q => q.attempts > 0 && q.lastAttemptCorrect === true)
                                               .sort((a, b) => a.attempts - b.attempts) // simple logic to prioritize less attempted
                                               .slice(0, questionCount - revengeQs.length);
                questionsForQuiz = [...revengeQs, ...revisionQs].slice(0, 15);
            } else { // Post-Lecture
                const subject = subjects.find(s => s.id === subjectId);
                if (!subject) throw new Error("Subject not found");
                
                const context = `${subject.transcripts}\n\n${subject.pdfs}`;
                const newGeneratedQuestions = await generateMCQs(context, subject.pyqs, questionCount);
                
                const newQuestions: Question[] = newGeneratedQuestions.map(q => ({
                    ...q,
                    id: `${subjectId}-${Date.now()}-${Math.random()}`,
                    subjectId: subjectId,
                    isCorrect: null,
                    attempts: 0,
                    lastAttemptCorrect: false,
                    confidence: null,
                }));

                setQuestionBank(prev => [...prev, ...newQuestions]);
                questionsForQuiz = newQuestions;
            }

            if(questionsForQuiz.length === 0) {
                 throw new Error("No questions available for this quiz mode.");
            }

            setActiveQuiz({
                questions: questionsForQuiz,
                currentQuestionIndex: 0,
                userAnswers: Array(questionsForQuiz.length).fill(null),
                isFinished: false,
            });
            setView('quiz');

        } catch (err: any) {
            setError(err.message || 'An unknown error occurred');
            setView('quizSetup'); // Stay on setup view on error
        } finally {
            setIsLoading(false);
        }
    }, [subjects, questionBank]);

    const handleAnswerQuestion = useCallback((questionId: string, answer: string) => {
        setActiveQuiz(prev => {
            if (!prev) return null;
            const question = prev.questions[prev.currentQuestionIndex];
            const isCorrect = question.correctAnswer === answer;
            
            setQuestionBank(qBank => qBank.map(q => 
                q.id === questionId 
                ? { ...q, attempts: q.attempts + 1, lastAttemptCorrect: isCorrect, isCorrect } 
                : q
            ));

            const newUserAnswers = [...prev.userAnswers];
            newUserAnswers[prev.currentQuestionIndex] = answer;
            return { ...prev, userAnswers: newUserAnswers };
        });
    }, []);

    const handleNextQuestion = useCallback(() => {
        setActiveQuiz(prev => {
            if (!prev || prev.currentQuestionIndex >= prev.questions.length - 1) return prev;
            return { ...prev, currentQuestionIndex: prev.currentQuestionIndex + 1 };
        });
    }, []);
    
    const handleFinishQuiz = useCallback(() => {
        setActiveQuiz(prev => prev ? { ...prev, isFinished: true } : null);
        setTimeout(() => {
             setActiveQuiz(null);
             setView('dashboard');
        }, 4000); // show result for 4 seconds
    }, []);


    // --- View Rendering ---
    const renderView = () => {
        switch (view) {
            case 'subjects':
                return <SubjectsView subjects={subjects} onAddSubject={handleAddSubject} onUpdateSubjectContent={handleUpdateSubjectContent} onDeleteSubject={handleDeleteSubject} />;
            case 'quizSetup':
                return <QuizSetup subjects={subjects} questionBank={questionBank} onStartQuiz={handleStartQuiz} onSetView={setView} />;
            case 'quiz':
                return activeQuiz && <QuizView quiz={activeQuiz} onAnswer={handleAnswerQuestion} onNextQuestion={handleNextQuestion} onFinishQuiz={handleFinishQuiz} />;
            case 'dashboard':
            default:
                return <Dashboard subjects={subjects} questionBank={questionBank} onSetView={setView} />;
        }
    };

    const NavItem: React.FC<{ targetView: AppView, icon: React.ReactNode, label: string }> = ({ targetView, icon, label }) => (
        <button
            onClick={() => setView(targetView)}
            className={`flex flex-col md:flex-row items-center justify-center md:justify-start space-y-1 md:space-y-0 md:space-x-3 px-2 py-3 rounded-lg transition-colors duration-200 w-full text-left ${view === targetView ? 'bg-primary text-white' : 'hover:bg-surface'}`}
        >
            {icon}
            <span className="text-sm md:text-base font-medium">{label}</span>
        </button>
    );

    return (
        <div className="flex flex-col md:flex-row h-screen font-sans">
             {isLoading && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center z-50">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-4 text-white text-lg">Generating Your Quiz...</p>
                </div>
            )}
            
            <nav className="w-full md:w-20 lg:w-64 bg-background border-r border-gray-700 p-2 md:p-4 order-last md:order-first flex md:flex-col justify-around md:justify-start md:space-y-4">
                <div className="hidden md:flex items-center space-x-3 p-2 mb-6">
                     <BrainIcon className="w-10 h-10 text-primary" />
                     <h1 className="text-xl font-bold text-text-primary hidden lg:block">Revenge Vault</h1>
                </div>
                <NavItem targetView="dashboard" icon={<ChartBarIcon className="w-6 h-6" />} label="Dashboard" />
                <NavItem targetView="subjects" icon={<BookOpenIcon className="w-6 h-6" />} label="Subjects" />
                <NavItem targetView="quizSetup" icon={<SparklesIcon className="w-6 h-6" />} label="New Quiz" />
            </nav>

            <main className="flex-1 overflow-y-auto bg-background">
                {error && (
                    <div className="p-4 bg-danger text-white text-center">
                        {error} <button onClick={() => setError(null)} className="ml-4 font-bold">X</button>
                    </div>
                )}
                {renderView()}
            </main>
        </div>
    );
};

export default App;
