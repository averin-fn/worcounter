import React from 'react';
import { Target } from 'lucide-react';
import { EXERCISES } from '../constants';

interface DayProgressSummaryProps {
  currentPoints: number;
  goalPoints: number;
  exerciseCounts: {[key: string]: number};
  isTrainingDay: boolean;
  exercisePoints?: {[key: string]: number}; // Добавляем фактические очки по упражнениям
}

const DayProgressSummary: React.FC<DayProgressSummaryProps> = ({ 
  currentPoints, 
  goalPoints, 
  exerciseCounts,
  isTrainingDay,
  exercisePoints = {}
}) => {  // Calculate the colored progress segments based on actual exercise points
  const getProgressSegments = () => {
    if (!exercisePoints || Object.keys(exercisePoints).length === 0) {
      return [{ color: '#3b82f6', width: 0 }];
    }

    const segments: { color: string; width: number }[] = [];

    EXERCISES.forEach(exercise => {
      const points = exercisePoints[exercise.id] || 0;
      if (points > 0) {
        const segmentWidth = (points / goalPoints) * 100;
        if (segmentWidth > 0) {
          segments.push({
            color: exercise.color,
            width: segmentWidth
          });
        }
      }
    });

    // If no exercises completed, show default blue
    if (segments.length === 0) {
      segments.push({ color: '#3b82f6', width: 0 });
    }

    return segments;
  };

  const progressSegments = getProgressSegments();
  const progress = (currentPoints / goalPoints) * 100;
  const isGoalReached = currentPoints >= goalPoints;

  if (!isTrainingDay) {
    return (
      <div className="day-progress-summary">
        <div className="flex items-center justify-center">
          <div 
            style={{
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '0.5rem'
            }}
          >
            <Target size={12} color="white" />
          </div>
          <span className="progress-title" style={{ fontSize: '1rem' }}>День отдыха</span>
        </div>
      </div>
    );
  }

  return (
    <div className="day-progress-summary">
      {/* Progress Section */}
      <div className="progress-section">
        <div className="progress-header">
          <div className="flex items-center">
            <div 
              style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                background: isGoalReached 
                  ? 'linear-gradient(135deg, #10b981 0%, #34d399 100%)'
                  : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '0.5rem'
              }}
            >
              <Target size={12} color="white" />
            </div>
            <h3 className="progress-title">Цель: {currentPoints}/{goalPoints}</h3>
          </div>
          <div className="progress-percentage">
            {Math.round(progress)}%
          </div>
        </div>
        
        <div className="progress-bar" style={{ marginTop: '0.75rem' }}>
          {progressSegments.map((segment, index) => {
            const cumulativeWidth = progressSegments.slice(0, index).reduce((sum, seg) => sum + seg.width, 0);
            const segmentWidth = Math.min(segment.width, Math.max(0, 100 - cumulativeWidth));
            return (
              <div 
                key={index}
                className="progress-segment"
                style={{
                  width: `${segmentWidth}%`,
                  height: '100%',
                  backgroundColor: segment.color,
                  position: 'absolute',
                  left: `${cumulativeWidth}%`,
                  borderRadius: index === 0 ? '4px 0 0 4px' : 
                               (cumulativeWidth + segmentWidth >= 100 || index === progressSegments.length - 1) ? '0 4px 4px 0' : '0'
                }}
              />
            );
          })}
        </div>
      </div>

      {/* Day Summary Section */}
      <div className="day-summary-section">
        <h4 className="day-summary-title">Выполнено сегодня</h4>
        <div className="day-summary-grid">
          {EXERCISES.map(exercise => {
            const count = exerciseCounts[exercise.id] || 0;
            const points = count * exercise.points;
            
            if (count === 0) return null;
            
            return (
              <div key={exercise.id} className="day-summary-item">
                <div 
                  className="day-summary-icon"
                  style={{ backgroundColor: exercise.color }}
                />
                <div className="day-summary-info">
                  <span className="day-summary-name">{exercise.name}</span>
                  <span className="day-summary-count">{count} × {exercise.points} = {points} очков</span>
                </div>
              </div>
            );
          })}
          
          {Object.values(exerciseCounts).every(count => count === 0) && (
            <div className="day-summary-empty">
              <span>Пока ничего не выполнено</span>
            </div>
          )}
        </div>
        
        <div className="day-summary-total">
          <span className="day-summary-total-label">Всего очков:</span>
          <span className="day-summary-total-value">{currentPoints}</span>
        </div>
      </div>

      {/* Goal Status */}
      {isGoalReached && (
        <div className="goal-status-section">
          <div className="goal-reached">
            <span className="goal-reached-icon">🎉</span>
            <span className="goal-reached-text">
              {currentPoints > goalPoints 
                ? `Цель перевыполнена на ${currentPoints - goalPoints} очков!`
                : 'Цель достигнута!'
              }
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default DayProgressSummary;
