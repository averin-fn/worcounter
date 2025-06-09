import { UserSettings, WorkoutRecord, DayStats } from '../types';
import { DEFAULT_SETTINGS } from '../constants';
import { addDays, differenceInDays, format, parseISO } from 'date-fns';

const STORAGE_KEYS = {
  SETTINGS: 'workout_settings',
  RECORDS: 'workout_records'
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
    return Math.min(currentGoal + 20, 500); // увеличиваем на 20, максимум 500
  } else {
    return Math.max(currentGoal - 10, 50); // уменьшаем на 10, минимум 50
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
