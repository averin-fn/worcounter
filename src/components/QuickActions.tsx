import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { EXERCISES } from '../constants';

interface QuickActionsProps {
  onQuickAdd: (exerciseId: string, count: number) => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({ 
  onQuickAdd 
}) => {
  const [selectedExercise, setSelectedExercise] = useState(EXERCISES[0].id);
  const [count, setCount] = useState(1);

  const quickCounts = [1, 5, 10];

  const handleAdd = () => {
    if (count > 0) {
      onQuickAdd(selectedExercise, count);
      setCount(1); // Reset to 1 after adding
    }
  };

  const incrementCount = () => setCount(prev => prev + 1);
  const decrementCount = () => setCount(prev => Math.max(1, prev - 1));

  const selectedExerciseData = EXERCISES.find(ex => ex.id === selectedExercise);

  return (
    <div className="exercise-add-block">
      <div className="exercise-add-header">
        <h3>Добавить упражнение</h3>
      </div>

      {/* Exercise Selection */}
      <div className="exercise-buttons">
        {EXERCISES.map(exercise => (
          <button
            key={exercise.id}
            onClick={() => setSelectedExercise(exercise.id)}
            className={`exercise-btn ${selectedExercise === exercise.id ? 'active' : ''}`}
            style={{ 
              '--exercise-color': exercise.color,
              backgroundColor: selectedExercise === exercise.id ? exercise.color : 'rgba(255, 255, 255, 0.1)'
            } as React.CSSProperties}
          >
            <div 
              className="exercise-btn-icon"
              style={{ backgroundColor: exercise.color }}
            />
            <span>{exercise.name}</span>
            <small>{exercise.points} очк.</small>
          </button>
        ))}
      </div>

      {/* Count Selection */}
      <div className="count-selection">
        <div className="count-quick-buttons">
          {quickCounts.map(quickCount => (
            <button
              key={quickCount}
              onClick={() => setCount(quickCount)}
              className={`count-quick-btn ${count === quickCount ? 'active' : ''}`}
            >
              {quickCount}
            </button>
          ))}
        </div>

        <div className="count-manual">
          <button 
            onClick={decrementCount}
            className="count-control-btn"
            disabled={count <= 1}
          >
            <Minus size={16} />
          </button>
          
          <input
            type="number"
            value={count}
            onChange={(e) => setCount(Math.max(1, parseInt(e.target.value) || 1))}
            className="count-input"
            min="1"
          />
          
          <button 
            onClick={incrementCount}
            className="count-control-btn"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      {/* Summary and Add Button */}
      <div className="add-summary">
        <div className="add-preview">
          <span className="add-exercise-name">{selectedExerciseData?.name}</span>
          <span className="add-calculation">
            {count} × {selectedExerciseData?.points} = {count * (selectedExerciseData?.points || 0)} очков
          </span>
        </div>
        
        <button onClick={handleAdd} className="add-btn">
          <Plus size={18} />
          Добавить
        </button>
      </div>
    </div>
  );
};

export default QuickActions;
