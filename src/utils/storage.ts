import { UserSettings, WorkoutRecord, DayStats, ExerciseHistoryEntry, ExerciseRecord } from '../types';
import { DEFAULT_SETTINGS } from '../constants';
import { addDays, differenceInDays, format, parseISO } from 'date-fns';

const STORAGE_KEYS = {
  SETTINGS: 'workout_settings',
  RECORDS: 'workout_records',
  EXERCISE_HISTORY: 'exercise_history',
  EXERCISE_RECORDS: 'exercise_records'
};

export const loadSettings = (): UserSettings => {
  const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
  return stored ? JSON.parse(stored) : DEFAULT_SETTINGS;
};

export const saveSettings = (settings: UserSettings): void => {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
};

export const loadRecords = (): WorkoutRecord[] => {
  const stored = localStorage.getItem(STORAGE_KEYS.RECORDS);
  return stored ? JSON.parse(stored) : [];
};

export const saveRecords = (records: WorkoutRecord[]): void => {
  localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(records));
};

export const isTrainingDay = (date: Date, settings: UserSettings): boolean => {
  const startDate = parseISO(settings.startDate);
  const daysDiff = differenceInDays(date, startDate);
  return daysDiff % settings.trainingFrequency === 0;
};

export const getNextTrainingDay = (currentDate: Date, settings: UserSettings): Date => {
  let nextDate = addDays(currentDate, 1);
  while (!isTrainingDay(nextDate, settings)) {
    nextDate = addDays(nextDate, 1);
  }
  return nextDate;
};

export const calculateNewGoal = (currentGoal: number, goalReached: boolean): number => {
  if (goalReached) {
    // Увеличиваем на 10%, максимум 500
    return Math.min(Math.round(currentGoal * 1.1), 500);
  } else {
    // Уменьшаем на 5%, минимум 50
    return Math.max(Math.round(currentGoal * 0.95), 50);
  }
};

export const getStatsForPeriod = (records: WorkoutRecord[], settings: UserSettings, days: number): DayStats[] => {
  const stats: DayStats[] = [];
  const today = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = addDays(today, -i);
    const dateStr = format(date, 'yyyy-MM-dd');
    const record = records.find(r => r.date === dateStr);
    const isTraining = isTrainingDay(date, settings);
    
    stats.push({
      date: dateStr,
      points: record?.totalPoints || 0,
      goal: isTraining ? settings.currentGoal : 0,
      goalReached: record?.goalReached || false,
      isTrainingDay: isTraining
    });
  }
  
  return stats;
};

// Exercise History functions
export const loadExerciseHistory = (): ExerciseHistoryEntry[] => {
  const stored = localStorage.getItem(STORAGE_KEYS.EXERCISE_HISTORY);
  return stored ? JSON.parse(stored) : [];
};

export const saveExerciseHistory = (history: ExerciseHistoryEntry[]): void => {
  localStorage.setItem(STORAGE_KEYS.EXERCISE_HISTORY, JSON.stringify(history));
};

export const addExerciseToHistory = (
  exerciseId: string, 
  exerciseName: string, 
  count: number, 
  points: number
): void => {
  const history = loadExerciseHistory();
  const now = new Date();
  
  const entry: ExerciseHistoryEntry = {
    id: `${exerciseId}_${now.getTime()}`,
    exerciseId,
    exerciseName,
    count,
    points,
    timestamp: now.toISOString(),
    date: format(now, 'yyyy-MM-dd')
  };
  
  history.unshift(entry); // Добавляем в начало массива
  
  // Ограничиваем историю последними 100 записями
  if (history.length > 100) {
    history.splice(100);
  }
  
  saveExerciseHistory(history);
};

export const removeExerciseFromHistory = (entryId: string): void => {
  const history = loadExerciseHistory();
  const updatedHistory = history.filter(entry => entry.id !== entryId);
  saveExerciseHistory(updatedHistory);
};

// Exercise Records functions
export const loadExerciseRecords = (): ExerciseRecord[] => {
  const stored = localStorage.getItem(STORAGE_KEYS.EXERCISE_RECORDS);
  return stored ? JSON.parse(stored) : [];
};

export const saveExerciseRecords = (records: ExerciseRecord[]): void => {
  localStorage.setItem(STORAGE_KEYS.EXERCISE_RECORDS, JSON.stringify(records));
};

export const checkAndUpdateRecord = (
  exerciseId: string,
  exerciseName: string,
  count: number
): { isNewRecord: boolean; previousRecord?: number } => {
  const records = loadExerciseRecords();
  const existingRecord = records.find(r => r.exerciseId === exerciseId);
  
  if (!existingRecord || count > existingRecord.maxCount) {
    const previousRecord = existingRecord?.maxCount;
    const now = new Date();
    
    // Обновляем или создаем новый рекорд
    const updatedRecords = records.filter(r => r.exerciseId !== exerciseId);
    updatedRecords.push({
      exerciseId,
      exerciseName,
      maxCount: count,
      date: format(now, 'yyyy-MM-dd'),
      timestamp: now.toISOString()
    });
    
    saveExerciseRecords(updatedRecords);
    return { isNewRecord: true, previousRecord };
  }
  
  return { isNewRecord: false };
};

export const addExerciseToHistoryWithRecord = (
  exerciseId: string, 
  exerciseName: string, 
  addedCount: number, // Количество добавленных упражнений за раз
  basePoints: number // Базовые очки за добавленные упражнения
): { points: number; isRecord: boolean } => {
  const { isNewRecord } = checkAndUpdateRecord(exerciseId, exerciseName, addedCount);
  const multiplier = isNewRecord ? 2 : 1;
  const points = basePoints * multiplier;
  
  const history = loadExerciseHistory();
  const now = new Date();
  
  const entry: ExerciseHistoryEntry = {
    id: `${exerciseId}_${now.getTime()}`,
    exerciseId,
    exerciseName,
    count: addedCount,
    points,
    timestamp: now.toISOString(),
    date: format(now, 'yyyy-MM-dd'),
    isRecord: isNewRecord,
    multiplier: isNewRecord ? 2 : 1
  };
  
  history.unshift(entry);
  
  if (history.length > 100) {
    history.splice(100);
  }
  
  saveExerciseHistory(history);
  return { points, isRecord: isNewRecord };
};

export const removeExerciseRecord = (exerciseId: string): void => {
  const records = loadExerciseRecords();
  const updatedRecords = records.filter(record => record.exerciseId !== exerciseId);
  saveExerciseRecords(updatedRecords);
};

export const recalculateExerciseRecord = (exerciseId: string, exerciseName: string): void => {
  const history = loadExerciseHistory();
  const exerciseHistory = history.filter(entry => entry.exerciseId === exerciseId);
  
  if (exerciseHistory.length === 0) {
    // Если нет записей этого упражнения, удаляем рекорд
    removeExerciseRecord(exerciseId);
    return;
  }
  
  // Находим максимальное количество среди оставшихся записей
  const maxEntry = exerciseHistory.reduce((max, entry) => 
    entry.count > max.count ? entry : max
  );
  
  // Обновляем рекорд
  const records = loadExerciseRecords();
  const updatedRecords = records.filter(r => r.exerciseId !== exerciseId);
  
  updatedRecords.push({
    exerciseId,
    exerciseName,
    maxCount: maxEntry.count,
    date: maxEntry.date,
    timestamp: maxEntry.timestamp
  });
  
  saveExerciseRecords(updatedRecords);
};

export const checkWillBeRecord = (exerciseId: string, addedCount: number): boolean => {
  const records = loadExerciseRecords();
  const existingRecord = records.find(r => r.exerciseId === exerciseId);
  
  return !existingRecord || addedCount > existingRecord.maxCount;
};
