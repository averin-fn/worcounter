import React from 'react';
import { Plus, Minus } from 'lucide-react';
import { Exercise } from '../types';

interface ExerciseCounterProps {
  exercise: Exercise;
  count: number;
  onCountChange: (count: number) => void;
}

const getExerciseIcon = (exercise: Exercise) => {
  return (
    <div 
      style={{
        width: '24px',
        height: '24px',
        borderRadius: '50%',
        backgroundColor: exercise.color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    />
  );
};

const ExerciseCounter: React.FC<ExerciseCounterProps> = ({ exercise, count, onCountChange }) => {  const handleIncrement = () => {
    // Haptic feedback for mobile devices
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
    onCountChange(count + 1);
  };

  const handleDecrement = () => {
    if (count > 0) {
      // Haptic feedback for mobile devices
      if ('vibrate' in navigator) {
        navigator.vibrate(50);
      }
      onCountChange(count - 1);
    }
  };
  const totalPoints = count * exercise.points;
  const exerciseClass = `exercise-card exercise-${exercise.id}`;
    return (
    <div className={exerciseClass}>
      <div className="exercise-header">        <div className="flex items-center gap-3">
          <div className="exercise-icon">
            {getExerciseIcon(exercise)}
          </div>
          <div className="exercise-info">
            <h3 className="exercise-title">{exercise.name}</h3>
            <p className="exercise-subtitle">{exercise.points} очк. за раз</p>
          </div>
        </div>
        <div className="exercise-points">
          <div className="exercise-points-value">{totalPoints}</div>
          <div className="exercise-points-label">очков</div>
        </div>
      </div>
      
      <div className="exercise-controls">
        <button
          onClick={handleDecrement}
          disabled={count === 0}
          className="counter-button counter-decrement"
        >
          <Minus size={20} />
        </button>
        
        <div className="exercise-count">{count}</div>
        
        <button
          onClick={handleIncrement}
          className="counter-button counter-increment"
        >
          <Plus size={20} />
        </button>
      </div>
    </div>
  );
};

export default ExerciseCounter;
