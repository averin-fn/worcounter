import { Exercise } from '../types';

export const EXERCISES: Exercise[] = [
  {
    id: 'pullups',
    name: 'Подтягивания',
    points: 3,
    icon: '',
    color: '#FF6B6B' // Красный
  },
  {
    id: 'dips',
    name: 'Брусья',
    points: 2,
    icon: '',
    color: '#4ECDC4' // Бирюзовый
  },
  {
    id: 'pushups',
    name: 'Отжимания',
    points: 1,
    icon: '',
    color: '#45B7D1' // Синий
  }
];

export const DEFAULT_SETTINGS = {
  trainingFrequency: 2, // через день
  currentGoal: 100,
  startDate: new Date().toISOString().split('T')[0]
};
