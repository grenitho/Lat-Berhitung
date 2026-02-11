import React, { useState } from 'react';
import { WelcomeScreen } from './components/WelcomeScreen';
import { ConfigScreen } from './components/ConfigScreen';
import { QuizScreen } from './components/QuizScreen';
import { ResultScreen } from './components/ResultScreen';
import { GameConfig, GameStats, OperationType, ScreenState } from './types';

function App() {
  const [screen, setScreen] = useState<ScreenState>('WELCOME');
  
  // Game State
  const [config, setConfig] = useState<GameConfig>({
    userName: '',
    operation: 'BASIC',
    questionCount: 0,
    maxNumber: 10
  });
  
  const [gameStats, setGameStats] = useState<GameStats | null>(null);

  const handleNameSubmit = (name: string) => {
    setConfig(prev => ({ ...prev, userName: name }));
    setScreen('CONFIG');
  };

  const handleConfigStart = (op: OperationType, count: number, maxNum: number) => {
    setConfig(prev => ({
      ...prev,
      operation: op,
      questionCount: count,
      maxNumber: maxNum
    }));
    setScreen('QUIZ');
  };

  const handleQuizFinish = (stats: GameStats) => {
    setGameStats(stats);
    setScreen('RESULT');
  };

  const handleReset = () => {
    // Keep username, reset rest
    setConfig(prev => ({ ...prev, questionCount: 0 }));
    setGameStats(null);
    setScreen('WELCOME'); // Or CONFIG if we want to keep name
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 bg-[radial-gradient(#e0e7ff_1px,transparent_1px)] [background-size:16px_16px]">
      {screen === 'WELCOME' && (
        <WelcomeScreen onNext={handleNameSubmit} />
      )}
      
      {screen === 'CONFIG' && (
        <ConfigScreen 
          userName={config.userName} 
          onStart={handleConfigStart} 
        />
      )}
      
      {screen === 'QUIZ' && (
        <QuizScreen 
          problemCount={config.questionCount}
          maxNum={config.maxNumber}
          operation={config.operation}
          onFinish={handleQuizFinish}
          onQuit={handleReset}
        />
      )}
      
      {screen === 'RESULT' && gameStats && (
        <ResultScreen 
          config={config} 
          stats={gameStats} 
          onReset={handleReset} 
        />
      )}
    </div>
  );
}

export default App;
