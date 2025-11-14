
import React from 'react';
import { Subject, Question, AppView } from '../types';
import { SparklesIcon, BookOpenIcon, BrainIcon, ChartBarIcon } from './Icons';

interface DashboardProps {
    subjects: Subject[];
    questionBank: Question[];
    onSetView: (view: AppView) => void;
}

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-surface p-6 rounded-lg shadow-lg flex items-center space-x-4">
        <div className="bg-primary/20 p-3 rounded-full">
            {icon}
        </div>
        <div>
            <p className="text-sm text-text-secondary">{title}</p>
            <p className="text-2xl font-bold text-text-primary">{value}</p>
        </div>
    </div>
);

export const Dashboard: React.FC<DashboardProps> = ({ subjects, questionBank, onSetView }) => {
    const totalQuestions = questionBank.length;
    const answeredQuestions = questionBank.filter(q => q.attempts > 0);
    const correctAnswers = answeredQuestions.filter(q => q.lastAttemptCorrect).length;
    const overallAccuracy = answeredQuestions.length > 0 ? ((correctAnswers / answeredQuestions.length) * 100).toFixed(1) + '%' : 'N/A';
    
    const weakSubjects = subjects.map(subject => {
        const subjectQuestions = questionBank.filter(q => q.subjectId === subject.id && q.attempts > 0);
        if (subjectQuestions.length === 0) return null;
        const correct = subjectQuestions.filter(q => q.lastAttemptCorrect).length;
        const accuracy = (correct / subjectQuestions.length) * 100;
        return { name: subject.name, accuracy };
    }).filter(s => s !== null && s.accuracy < 60).sort((a,b) => a!.accuracy - b!.accuracy).slice(0, 3) as {name: string, accuracy: number}[];

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <h1 className="text-3xl font-bold mb-2">Welcome Back, Aspirant</h1>
            <p className="text-text-secondary mb-8">Let's conquer your weak areas and secure that All-India Rank 1.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <StatCard title="Total Subjects" value={subjects.length.toString()} icon={<BookOpenIcon className="w-8 h-8 text-primary" />} />
                <StatCard title="Questions Generated" value={totalQuestions.toString()} icon={<BrainIcon className="w-8 h-8 text-primary" />} />
                <StatCard title="Overall Accuracy" value={overallAccuracy} icon={<ChartBarIcon className="w-8 h-8 text-primary" />} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-surface p-6 rounded-lg shadow-lg">
                    <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button onClick={() => onSetView('quizSetup')} className="p-6 bg-primary/80 rounded-lg text-left hover:bg-primary transition-all duration-300">
                            <SparklesIcon className="w-8 h-8 mb-2" />
                            <h3 className="text-lg font-semibold">Start New Quiz</h3>
                            <p className="text-sm text-gray-200">Generate questions from a subject.</p>
                        </button>
                        <button onClick={() => onSetView('quizSetup')} className="p-6 bg-secondary/80 rounded-lg text-left hover:bg-secondary transition-all duration-300">
                            <BrainIcon className="w-8 h-8 mb-2" />
                            <h3 className="text-lg font-semibold">Revenge Mode</h3>
                            <p className="text-sm text-gray-200">Re-attempt incorrect questions.</p>
                        </button>
                    </div>
                </div>

                <div className="bg-surface p-6 rounded-lg shadow-lg">
                    <h2 className="text-xl font-bold mb-4">Adaptive Recommendations</h2>
                    <p className="text-text-secondary mb-4 text-sm">Focus on these areas to improve your score:</p>
                    {weakSubjects.length > 0 ? (
                        <ul className="space-y-3">
                            {weakSubjects.map(s => (
                                <li key={s.name} className="flex justify-between items-center p-3 bg-background rounded-md">
                                    <span className="font-semibold">{s.name}</span>
                                    <span className="text-sm font-bold text-warning">{s.accuracy.toFixed(0)}% acc</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-center text-text-secondary py-4">No specific weak areas detected yet. Keep practicing!</p>
                    )}
                </div>
            </div>
        </div>
    );
};
