import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { EXERCISES } from '../constants';
import { SeriesState } from '../types';

interface QuickActionsProps {
  onQuickAdd: (exerciseId: string, count: number) => void;
  exerciseCounts: {[key: string]: number};
  checkWillBeRecord: (exerciseId: string, addedCount: number) => boolean;
  seriesState: SeriesState;
}

const QuickActions: React.FC<QuickActionsProps> = ({ 
  onQuickAdd,
  exerciseCounts,
  checkWillBeRecord,
  seriesState
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
  
  // Рассчитываем итоговые очки с учетом множителей
  let finalPoints = basePoints;
  let recordMultiplier = 1;
  let seriesMultiplier = 1;
  
  if (willBeRecord) {
    recordMultiplier = 2;
    finalPoints *= recordMultiplier;
  }
  
  // Предсказываем множитель серии (будет увеличен на следующем упражнении)
  if (seriesState.isActive) {
    const nextExerciseCount = seriesState.exerciseCount + 1;
    seriesMultiplier = Math.min(1.0 + (nextExerciseCount - 1) * 0.2, 3.0);
  } else {
    seriesMultiplier = 1.0; // Первое упражнение в серии
  }
  
  // Применяем множитель серии
  if (seriesMultiplier > 1) {
    finalPoints = Math.floor(finalPoints * seriesMultiplier);
  }

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
      </div>      {/* Summary and Add Button */}
      <div className="add-summary">
        <div className="add-preview">
          <span className="add-exercise-name">{selectedExerciseData?.name}</span>
          <span className="add-calculation">
            {count} × {selectedExerciseData?.points}
            {recordMultiplier > 1 && ` × ${recordMultiplier} (рекорд)`}
            {seriesMultiplier > 1 && ` × ${seriesMultiplier.toFixed(1)} (серия)`}
            {' = '}
            <strong>{finalPoints} очков</strong>
            
            {/* Показываем детали множителей */}
            <div style={{ 
              fontSize: '0.75rem', 
              color: '#6b7280',
              marginTop: '0.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              flexWrap: 'wrap'
            }}>              {willBeRecord && (
                <span style={{ 
                  fontWeight: 'bold',
                  background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                  color: 'white',
                  padding: '0.125rem 0.375rem',
                  borderRadius: '0.25rem',
                  fontSize: '0.7rem'
                }}>
                  🏆 РЕКОРД x2
                </span>
              )}
              {seriesMultiplier > 1 && (
                <span style={{ 
                  background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                  color: 'white',
                  padding: '0.125rem 0.375rem',
                  borderRadius: '0.25rem',
                  fontSize: '0.7rem',
                  fontWeight: 'bold'
                }}>
                  🔥 СЕРИЯ x{seriesMultiplier.toFixed(1)}
                </span>
              )}
              {seriesState.isActive && (
                <span style={{ fontSize: '0.7rem', color: '#10b981' }}>
                  Упражнение #{seriesState.exerciseCount + 1} в серии
                </span>
              )}
            </div>
          </span>
        </div>
          <button onClick={handleAdd} className="add-btn" style={{
          position: 'relative'
        }}>
          <Plus size={18} />
          Добавить
          {(willBeRecord || seriesMultiplier > 1) && (
            <div style={{
              position: 'absolute',
              top: '-8px',
              right: '-8px',
              display: 'flex',
              gap: '2px'
            }}>
              {willBeRecord && (
                <span style={{
                  background: '#fbbf24',
                  color: 'white',
                  borderRadius: '50%',
                  width: '18px',
                  height: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '9px',
                  fontWeight: 'bold'
                }}>
                  🏆
                </span>
              )}
              {seriesMultiplier > 1 && (
                <span style={{
                  background: '#f59e0b',
                  color: 'white',
                  borderRadius: '50%',
                  width: '18px',
                  height: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '9px',
                  fontWeight: 'bold'
                }}>
                  🔥
                </span>
              )}
            </div>
          )}
        </button>
      </div>
    </div>
  );
};

export default QuickActions;
