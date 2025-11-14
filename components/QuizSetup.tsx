
import React, { useState } from 'react';
import { Subject, QuizMode } from '../types';
import { SparklesIcon, ChevronRightIcon } from './Icons';

interface QuizSetupProps {
  subjects: Subject[];
  questionBank: import('../types').Question[];
  onStartQuiz: (subjectId: string, mode: QuizMode, questionCount: number) => void;
  onSetView: (view: import('../types').AppView) => void;
}

export const QuizSetup: React.FC<QuizSetupProps> = ({ subjects, questionBank, onStartQuiz, onSetView }) => {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [quizMode, setQuizMode] = useState<QuizMode>(QuizMode.PostLecture);
  const [questionCount, setQuestionCount] = useState<number>(10);

  const availableSubjects = subjects.filter(s => s.transcripts.trim().length > 0 || s.pdfs.trim().length > 0);

  const getRevengeQuestionCount = () => {
    return questionBank.filter(q => q.lastAttemptCorrect === false).length;
  }
  
  const getDailyRevisionQuestionCount = () => {
      const weakQuestions = questionBank.filter(q => q.lastAttemptCorrect === false).length;
      const oldQuestions = questionBank.filter(q => q.attempts > 0).length; // simple logic for now
      return Math.min(15, weakQuestions + oldQuestions);
  }

  const handleStart = () => {
    let subjectIdForQuiz = selectedSubjectId;
    if (quizMode === QuizMode.DailyRevision || quizMode === QuizMode.Revenge) {
        // These modes are cross-subject, so we don't need a specific subjectId
        subjectIdForQuiz = 'all'; 
    }
    onStartQuiz(subjectIdForQuiz, quizMode, questionCount);
  };
  
  const isStartDisabled = () => {
      if (quizMode === QuizMode.PostLecture) {
          return !selectedSubjectId;
      }
      if (quizMode === QuizMode.Revenge) {
          return getRevengeQuestionCount() === 0;
      }
      if (quizMode === QuizMode.DailyRevision) {
          return getDailyRevisionQuestionCount() === 0;
      }
      return true;
  }
  
  const renderQuizModeOptions = () => {
    switch (quizMode) {
      case QuizMode.PostLecture:
        return (
          <>
            <label htmlFor="subject" className="block text-sm font-medium text-text-secondary">Subject</label>
            <select
              id="subject"
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="mt-1 block w-full p-3 bg-background border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
            >
              <option value="" disabled>Select a subject</option>
              {availableSubjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
             {availableSubjects.length === 0 && <p className='text-sm text-warning mt-2'>You need to add content to at least one subject first.</p>}

            <label htmlFor="questionCount" className="block text-sm font-medium text-text-secondary mt-4">Number of Questions</label>
            <input
              type="number"
              id="questionCount"
              value={questionCount}
              onChange={(e) => setQuestionCount(Math.max(1, parseInt(e.target.value, 10)))}
              min="1"
              max="20"
              className="mt-1 block w-full p-3 bg-background border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
            />
          </>
        );
      case QuizMode.Revenge:
        return <p className="text-text-secondary">Targeting {getRevengeQuestionCount()} incorrectly answered questions.</p>;
      case QuizMode.DailyRevision:
         return <p className="text-text-secondary">Curated session of {getDailyRevisionQuestionCount()} questions from weak and past topics.</p>;
      default:
        return null;
    }
  };


  return (
    <div className="p-4 sm:p-6 lg:p-8 flex items-center justify-center min-h-full">
      <div className="w-full max-w-2xl bg-surface rounded-xl shadow-2xl p-8 space-y-8">
        <div>
           <SparklesIcon className="w-12 h-12 text-primary mx-auto" />
          <h1 className="text-3xl font-bold text-center mt-4">Start a New Quiz</h1>
          <p className="text-center text-text-secondary mt-2">Configure your practice session.</p>
        </div>
        
        <div className="space-y-4">
            <label className="block text-sm font-medium text-text-secondary">Quiz Mode</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {Object.values(QuizMode).map(mode => (
                    <button key={mode} onClick={() => setQuizMode(mode)} className={`p-4 rounded-lg text-center font-semibold transition-all duration-200 ${quizMode === mode ? 'bg-primary text-white ring-2 ring-offset-2 ring-offset-surface ring-primary' : 'bg-background hover:bg-gray-700'}`}>
                        {mode}
                    </button>
                ))}
            </div>
        </div>
        
        <div className="min-h-[150px]">
          {renderQuizModeOptions()}
        </div>

        <button
          onClick={handleStart}
          disabled={isStartDisabled()}
          className="w-full flex items-center justify-center p-4 bg-secondary text-white font-bold rounded-lg text-lg hover:bg-secondary/80 transition-all duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed transform hover:scale-105"
        >
          <span>Begin Session</span>
          <ChevronRightIcon className="w-6 h-6 ml-2" />
        </button>
      </div>
    </div>
  );
};
