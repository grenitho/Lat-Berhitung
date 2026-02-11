import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Clock, CheckCircle, XCircle, SkipForward, RotateCcw } from 'lucide-react';
import { Problem, GameStats, SECONDS_PER_QUESTION } from '../types';
import { generateProblemBatch, formatTime } from '../utils/mathGame';

interface QuizScreenProps {
  problemCount: number;
  maxNum: number;
  operation: 'BASIC' | 'FULL';
  onFinish: (stats: GameStats) => void;
  onQuit: () => void;
}

export const QuizScreen: React.FC<QuizScreenProps> = ({ 
  problemCount, 
  maxNum, 
  operation, 
  onFinish,
  onQuit
}) => {
  // Game State
  const [problems, setProblems] = useState<Problem[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [startTime] = useState(Date.now());
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  
  // UI State
  const [feedback, setFeedback] = useState<'CORRECT' | 'WRONG' | 'SKIPPED' | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  
  const timerRef = useRef<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize
  useEffect(() => {
    const generated = generateProblemBatch(problemCount, maxNum, operation);
    setProblems(generated);
    setTimeLeft(problemCount * SECONDS_PER_QUESTION);
  }, [problemCount, maxNum, operation]);

  const finishGame = useCallback((timeIsUp: boolean) => {
    if (timerRef.current) clearInterval(timerRef.current);
    
    onFinish({
      totalAttempted: currentIdx + (timeIsUp ? 0 : 1), // If time is up, current isn't counted as completed
      correct: correctCount,
      incorrect: incorrectCount,
      startTime: startTime,
      endTime: Date.now(),
      isTimeUp: timeIsUp
    });
  }, [currentIdx, correctCount, incorrectCount, startTime, onFinish]);

  // Timer Logic
  useEffect(() => {
    if (problems.length === 0) return; // Wait for initialization

    timerRef.current = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          finishGame(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [problems, finishGame]);

  // Auto focus input
  useEffect(() => {
    if (!feedback) {
      inputRef.current?.focus();
    }
  }, [currentIdx, feedback]);

  const handleNext = () => {
    if (currentIdx >= problems.length - 1) {
      // Game Over (Completed)
      finishGame(false);
    } else {
      setFeedback(null);
      setUserAnswer('');
      setCurrentIdx((prev) => prev + 1);
    }
  };

  const processAnswer = (skipped: boolean = false) => {
    if (feedback) return; // Prevent double submission

    const currentProblem = problems[currentIdx];
    const val = parseInt(userAnswer);

    let isCorrect = false;

    if (skipped) {
      setIncorrectCount((prev) => prev + 1);
      setFeedback('SKIPPED');
      setIsShaking(true);
    } else {
      if (isNaN(val)) {
        // Just shake, don't submit
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 500);
        return;
      }

      if (val === currentProblem.answer) {
        setCorrectCount((prev) => prev + 1);
        setFeedback('CORRECT');
        isCorrect = true;
      } else {
        setIncorrectCount((prev) => prev + 1);
        setFeedback('WRONG');
        setIsShaking(true);
      }
    }

    setTimeout(() => setIsShaking(false), 500);

    // Delay before next question
    setTimeout(() => {
      handleNext();
    }, 1200);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      processAnswer(false);
    }
  };

  if (problems.length === 0) return <div className="text-center p-10">Memuat Soal...</div>;

  const currentProblem = problems[currentIdx];
  const progress = ((currentIdx + 1) / problemCount) * 100;
  
  // Format operator for display
  const displayOp = currentProblem.operator === '*' ? '×' : currentProblem.operator === '/' ? '÷' : currentProblem.operator;

  return (
    <div className="w-full max-w-lg bg-white p-6 md:p-10 rounded-2xl shadow-xl border border-slate-100 relative">
      {/* Header Info */}
      <div className="flex justify-between items-center mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
        <div className="text-sm font-semibold text-slate-500">
          Soal <span className="text-indigo-600 text-lg">{currentIdx + 1}</span> / {problemCount}
        </div>
        <div className={`text-2xl font-mono font-bold flex items-center gap-2 ${timeLeft < 20 ? 'text-red-600 animate-pulse' : 'text-slate-700'}`}>
          <Clock className="w-5 h-5" />
          {formatTime(timeLeft)}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 h-2 rounded-full mb-8 overflow-hidden">
        <div 
          className="bg-indigo-500 h-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      {/* Problem Display */}
      <div className={`text-center mb-8 py-8 rounded-2xl transition-colors duration-300 ${
        feedback === 'CORRECT' ? 'bg-green-50' : feedback ? 'bg-red-50' : 'bg-white'
      } ${isShaking ? 'animate-shake' : ''}`}>
        <div className="text-6xl md:text-7xl font-black text-slate-800 tracking-tight flex justify-center items-center gap-4">
          <span>{currentProblem.num1}</span>
          <span className="text-indigo-500">{displayOp}</span>
          <span>{currentProblem.num2}</span>
          <span className="text-slate-400">=</span>
          <span className="text-indigo-600">?</span>
        </div>
      </div>

      {/* Feedback Message */}
      <div className="h-8 mb-4 flex justify-center items-center">
        {feedback === 'CORRECT' && (
          <div className="flex items-center gap-2 text-green-600 font-bold bg-green-100 px-4 py-1 rounded-full animate-fade-in">
            <CheckCircle className="w-4 h-4" /> Benar!
          </div>
        )}
        {(feedback === 'WRONG' || feedback === 'SKIPPED') && (
          <div className="flex items-center gap-2 text-red-600 font-bold bg-red-100 px-4 py-1 rounded-full animate-fade-in">
            <XCircle className="w-4 h-4" /> Salah/Dilewati. Jawaban: {currentProblem.answer}
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="flex flex-col gap-4">
        <input
          ref={inputRef}
          type="number"
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={!!feedback}
          placeholder="Jawaban..."
          className="w-full text-center text-3xl font-bold py-4 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all disabled:bg-slate-50 disabled:text-slate-400"
          autoComplete="off"
        />

        <div className="flex gap-3">
          <button
            onClick={() => processAnswer(false)}
            disabled={!!feedback}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl shadow-md active:scale-95 transition-all"
          >
            Jawab
          </button>
          <button
            onClick={() => processAnswer(true)}
            disabled={!!feedback}
            className="px-6 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl shadow-md active:scale-95 transition-all flex items-center justify-center"
            title="Lewati Soal"
          >
            <SkipForward className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Stats Mini */}
      <div className="mt-8 flex justify-between text-sm font-medium text-slate-400 border-t border-slate-100 pt-4">
        <div>Benar: <span className="text-green-600">{correctCount}</span></div>
        <div>Salah: <span className="text-red-500">{incorrectCount}</span></div>
      </div>

      <div className="mt-6 text-center">
        <button onClick={onQuit} className="text-slate-400 hover:text-slate-600 text-sm flex items-center justify-center gap-1 w-full">
            <RotateCcw className="w-3 h-3"/> Keluar ke Menu Utama
        </button>
      </div>
    </div>
  );
};