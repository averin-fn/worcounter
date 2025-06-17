export interface Exercise {
  id: string;
  name: string;
  points: number;
  icon: string;
  color: string;
}

export interface WorkoutRecord {
  id: string;
  date: string;
  exercises: {
    [exerciseId: string]: number;
  };
  totalPoints: number;
  goalReached: boolean;
}

// Новые типы для системы серий
export interface SeriesState {
  isActive: boolean;
  multiplier: number;
  remainingTime: number;
  exerciseCount: number;
  startTime: number;
}

export interface ExerciseHistoryEntry {
  id: string;
  exerciseId: string;
  exerciseName: string;
  count: number;
  points: number;
  timestamp: string;
  date: string;
  isRecord?: boolean; // Признак рекорда
  multiplier?: number; // Множитель очков (например, 2x для рекорда или серий)
  seriesMultiplier?: number; // Множитель за серию
}

export interface ExerciseRecord {
  exerciseId: string;
  exerciseName: string;
  maxCount: number;
  date: string;
  timestamp: string;
}

export interface UserSettings {
  trainingFrequency: number; // дни между тренировками
  currentGoal: number;
  startDate: string;
}

export interface DayStats {
  date: string;
  points: number;
  goal: number;
  goalReached: boolean;
  isTrainingDay: boolean;
}
