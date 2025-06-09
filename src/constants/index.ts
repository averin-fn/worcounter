import { Exercise } from '../types';

export const EXERCISES: Exercise[] = [
  {
    id: 'pullups',
    name: 'Подтягивания',
    points: 3,
    icon: 'ChevronUp',
    color: '#FF6B6B' // Красный
  },
  {
    id: 'dips',
    name: 'Отжимания на брусьях',
    points: 2,
    icon: 'ArrowUp',
    color: '#4ECDC4' // Бирюзовый
  },
  {
    id: 'pushups',
    name: 'Отжимания от пола',
    points: 1,
    icon: 'ArrowDown',
    color: '#45B7D1' // Синий
  }
];

export const DEFAULT_SETTINGS = {
  trainingFrequency: 2, // через день
  currentGoal: 100,
  startDate: new Date().toISOString().split('T')[0]
};
