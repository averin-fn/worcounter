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

export interface ExerciseHistoryEntry {
  id: string;
  exerciseId: string;
  exerciseName: string;
  count: number;
  points: number;
  timestamp: string;
  date: string;
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
