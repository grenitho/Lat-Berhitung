import { Problem, OperationType, SECONDS_PER_QUESTION } from '../types';

const MIN_NUM = 1;

export const determineMaxNumber = (count: number): number => {
  if (count <= 50) return 10;
  if (count <= 100) return 20;
  return 50;
};

const getRandomInt = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const generateProblem = (maxNum: number, opType: OperationType): Problem => {
  const operators = opType === 'FULL' ? ['+', '-', '*', '/'] : ['+', '-'];
  const operator = operators[Math.floor(Math.random() * operators.length)];
  
  let num1 = 0;
  let num2 = 0;
  let answer = 0;

  switch (operator) {
    case '+':
      num1 = getRandomInt(MIN_NUM, maxNum);
      num2 = getRandomInt(MIN_NUM, maxNum);
      answer = num1 + num2;
      break;
    case '-': {
      // Ensure result is positive
      const a = getRandomInt(MIN_NUM, maxNum * 2);
      const b = getRandomInt(MIN_NUM, maxNum);
      num1 = Math.max(a, b);
      num2 = Math.min(a, b);
      // Double check constraint
      if (num1 - num2 < 0) {
         const temp = num1;
         num1 = num2;
         num2 = temp;
      }
      answer = num1 - num2;
      break;
    }
    case '*':
      num1 = getRandomInt(MIN_NUM, maxNum);
      num2 = getRandomInt(MIN_NUM, maxNum);
      answer = num1 * num2;
      break;
    case '/': {
      // Ensure integer result
      const result = getRandomInt(MIN_NUM, maxNum); // This is the answer
      num2 = getRandomInt(MIN_NUM, maxNum); // Divisor
      num1 = result * num2; // Dividend
      answer = result;
      break;
    }
  }

  // Create a unique key to help avoid immediate duplicates in the queue logic
  const id = `${num1}${operator}${num2}-${Date.now()}-${Math.random()}`;

  return { id, num1, num2, operator, answer };
};

export const generateProblemBatch = (count: number, maxNum: number, opType: OperationType): Problem[] => {
  const problems: Problem[] = [];
  const signatures = new Set<string>();
  
  // Safety break to prevent infinite loops if pool is small
  let attempts = 0;
  const maxAttempts = count * 10;

  while (problems.length < count && attempts < maxAttempts) {
    const p = generateProblem(maxNum, opType);
    const signature = `${p.num1}${p.operator}${p.num2}`;
    
    if (!signatures.has(signature)) {
      signatures.add(signature);
      problems.push(p);
    }
    attempts++;
  }
  
  // Fill the rest if unique generation failed (rare)
  while(problems.length < count) {
      problems.push(generateProblem(maxNum, opType));
  }

  return problems;
};

export const calculateGrade = (
  correct: number, 
  totalAttempted: number, 
  maxQuestions: number,
  isTimeUp: boolean
): { grade: string; colorClass: string } => {
  const accuracy = totalAttempted > 0 ? (correct / totalAttempted) * 100 : 0;
  const completionRate = (totalAttempted / maxQuestions) * 100;

  // Completed all questions within time
  if (!isTimeUp && completionRate >= 100) {
    if (accuracy >= 95) return { grade: 'A', colorClass: 'bg-yellow-100 text-yellow-700 border-yellow-300' };
    if (accuracy >= 85) return { grade: 'B', colorClass: 'bg-green-100 text-green-700 border-green-300' };
    if (accuracy >= 75) return { grade: 'C', colorClass: 'bg-blue-100 text-blue-700 border-blue-300' };
    return { grade: 'D', colorClass: 'bg-red-100 text-red-700 border-red-300' };
  }

  // Time ran out or quit early
  // More lenient if they did a lot of questions with high accuracy
  if (completionRate >= 90 && accuracy >= 90) return { grade: 'B', colorClass: 'bg-green-100 text-green-700 border-green-300' };
  if (completionRate >= 75 && accuracy >= 70) return { grade: 'C', colorClass: 'bg-blue-100 text-blue-700 border-blue-300' };
  
  return { grade: 'D', colorClass: 'bg-red-100 text-red-700 border-red-300' };
};

export const formatTime = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};
