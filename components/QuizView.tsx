
import React, { useState, useEffect } from 'react';
import { Quiz, Question } from '../types';
import { CheckCircleIcon, XCircleIcon, LightBulbIcon, ChevronRightIcon } from './Icons';

interface QuizViewProps {
  quiz: Quiz;
  onAnswer: (questionId: string, answer: string) => void;
  onNextQuestion: () => void;
  onFinishQuiz: () => void;
}

const QuizProgressBar: React.FC<{ current: number; total: number }> = ({ current, total }) => {
    const percentage = (current / total) * 100;
    return (
        <div className="w-full bg-gray-700 rounded-full h-2.5">
            <div className="bg-primary h-2.5 rounded-full" style={{ width: `${percentage}%` }}></div>
        </div>
    );
};

export const QuizView: React.FC<QuizViewProps> = ({ quiz, onAnswer, onNextQuestion, onFinishQuiz }) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);

  const currentQuestion = quiz.questions[quiz.currentQuestionIndex];
  
  useEffect(() => {
    setSelectedAnswer(null);
    setIsAnswered(false);
  }, [quiz.currentQuestionIndex]);

  const handleAnswerSubmit = () => {
    if (!selectedAnswer) return;
    setIsAnswered(true);
    onAnswer(currentQuestion.id, selectedAnswer);
  };

  const handleNext = () => {
    if (quiz.currentQuestionIndex < quiz.questions.length - 1) {
      onNextQuestion();
    } else {
      onFinishQuiz();
    }
  };

  const getOptionClass = (option: string) => {
    if (!isAnswered) {
      return selectedAnswer === option
        ? 'ring-2 ring-primary bg-primary/20'
        : 'bg-surface hover:bg-gray-600';
    }
    if (option === currentQuestion.correctAnswer) {
      return 'bg-success/20 ring-2 ring-success text-success';
    }
    if (option === selectedAnswer && option !== currentQuestion.correctAnswer) {
      return 'bg-danger/20 ring-2 ring-danger text-danger';
    }
    return 'bg-surface';
  };
  
  if (quiz.isFinished) {
    const correctAnswers = quiz.userAnswers.filter((answer, index) => answer === quiz.questions[index].correctAnswer).length;
    const score = (correctAnswers / quiz.questions.length) * 100;

    return (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <h2 className="text-4xl font-bold text-primary">Quiz Complete!</h2>
            <p className="text-xl mt-4 text-text-secondary">You scored</p>
            <p className="text-8xl font-bold my-6">{score.toFixed(0)}%</p>
            <p className="text-lg text-text-secondary">{correctAnswers} out of {quiz.questions.length} correct</p>
            <button onClick={onFinishQuiz} className="mt-10 px-8 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary/80 transition-all">
                Back to Dashboard
            </button>
        </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Question {quiz.currentQuestionIndex + 1} of {quiz.questions.length}</h2>
        </div>
        <QuizProgressBar current={quiz.currentQuestionIndex + 1} total={quiz.questions.length} />

        <div className="mt-8 bg-surface p-8 rounded-lg shadow-lg">
            <p className="text-xl font-semibold leading-relaxed text-text-primary">{currentQuestion.question}</p>
        </div>

        <div className="mt-6 space-y-4">
            {currentQuestion.options.map((option, index) => (
                <button
                    key={index}
                    onClick={() => !isAnswered && setSelectedAnswer(option)}
                    disabled={isAnswered}
                    className={`w-full text-left p-4 rounded-lg border-2 border-transparent transition-all duration-200 flex items-center text-lg ${getOptionClass(option)} ${isAnswered ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                >
                    <span className="font-bold mr-4">{String.fromCharCode(65 + index)}.</span>
                    <span>{option}</span>
                    {isAnswered && option === currentQuestion.correctAnswer && <CheckCircleIcon className="w-6 h-6 ml-auto text-success" />}
                    {isAnswered && option === selectedAnswer && option !== currentQuestion.correctAnswer && <XCircleIcon className="w-6 h-6 ml-auto text-danger" />}
                </button>
            ))}
        </div>
        
        {isAnswered && (
            <div className="mt-6 p-6 bg-background rounded-lg animate-fade-in">
                <h3 className="text-lg font-bold flex items-center text-yellow-400">
                    <LightBulbIcon className="w-6 h-6 mr-2" />
                    Explanation
                </h3>
                <p className="mt-2 text-text-secondary leading-relaxed">{currentQuestion.explanation}</p>
            </div>
        )}

        <div className="mt-8 text-right">
            {!isAnswered ? (
                <button
                    onClick={handleAnswerSubmit}
                    disabled={!selectedAnswer}
                    className="px-8 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary/80 transition-all disabled:bg-gray-600"
                >
                    Submit Answer
                </button>
            ) : (
                <button onClick={handleNext} className="px-8 py-3 bg-secondary text-white font-semibold rounded-lg hover:bg-secondary/80 transition-all flex items-center ml-auto">
                    {quiz.currentQuestionIndex < quiz.questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
                    <ChevronRightIcon className="w-5 h-5 ml-2" />
                </button>
            )}
        </div>
    </div>
  );
};
