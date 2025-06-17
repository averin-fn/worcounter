import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { EXERCISES } from '../constants';

interface QuickActionsProps {
  onQuickAdd: (exerciseId: string, count: number) => void;
  exerciseCounts: {[key: string]: number};
  checkWillBeRecord: (exerciseId: string, addedCount: number) => boolean;
}

const QuickActions: React.FC<QuickActionsProps> = ({ 
  onQuickAdd,
  exerciseCounts,
  checkWillBeRecord
}) => {
  const [selectedExercise, setSelectedExercise] = useState(EXERCISES[0].id);
  const [count, setCount] = useState(1);

  const quickCounts = [1, 5, 10, 20];

  const handleAdd = () => {
    if (count > 0) {
      onQuickAdd(selectedExercise, count);
      setCount(1); // Reset to 1 after adding
    }
  };

  const incrementCount = () => setCount(prev => prev + 1);
  const decrementCount = () => setCount(prev => Math.max(1, prev - 1));  const selectedExerciseData = EXERCISES.find(ex => ex.id === selectedExercise);
  const willBeRecord = checkWillBeRecord(selectedExercise, count);
  const basePoints = count * (selectedExerciseData?.points || 0);
  const finalPoints = willBeRecord ? basePoints * 2 : basePoints;

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
      <div className="add-summary">        <div className="add-preview">
          <span className="add-exercise-name">{selectedExerciseData?.name}</span>
          <span className="add-calculation">
            {willBeRecord ? (
              <>
                {count} × {selectedExerciseData?.points} × 2 = {finalPoints} очков
                <span style={{ 
                  marginLeft: '0.5rem',
                  color: '#fbbf24',
                  fontWeight: 'bold',
                  fontSize: '0.8rem'
                }}>
                  🏆 РЕКОРД!
                </span>
              </>
            ) : (
              <>
                {count} × {selectedExerciseData?.points} = {basePoints} очков
              </>
            )}
          </span>
        </div>
        
        <button onClick={handleAdd} className="add-btn" style={{
          position: 'relative'
        }}>
          <Plus size={18} />
          Добавить
          {willBeRecord && (
            <span style={{
              position: 'absolute',
              top: '-6px',
              right: '-6px',
              background: '#fbbf24',
              color: 'white',
              borderRadius: '50%',
              width: '20px',
              height: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '10px',
              fontWeight: 'bold'
            }}>
              x2
            </span>
          )}
        </button>
      </div>
    </div>
  );
};

export default QuickActions;
