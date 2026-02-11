import { HistoryRecord } from '../types';

const STORAGE_KEY = 'kumon_math_history';

export const getHistory = (): HistoryRecord[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Failed to load history", error);
    return [];
  }
};

export const saveHistory = (record: HistoryRecord) => {
  try {
    const current = getHistory();
    // Add new record to the beginning
    const updated = [record, ...current].slice(0, 50); // Keep last 50 records
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error("Failed to save history", error);
  }
};

export const clearHistory = () => {
    localStorage.removeItem(STORAGE_KEY);
};