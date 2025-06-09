import React from 'react';
import { EXERCISES } from '../constants';

interface DayStatsProps {
  exerciseCounts: {[key: string]: number};
  totalPoints: number;
}

const DayStats: React.FC<DayStatsProps> = ({ exerciseCounts, totalPoints }) => {
  return (
    <div className="day-stats-block">
      <div className="day-stats-header">
        <h3 className="day-stats-title">Выполнено сегодня</h3>
        <div className="day-stats-total">
          <span className="day-stats-total-label">Всего:</span>
          <span className="day-stats-total-value">{totalPoints} очков</span>
        </div>
      </div>
      
      <div className="day-stats-grid">
        {EXERCISES.map(exercise => {
          const count = exerciseCounts[exercise.id] || 0;
          const points = count * exercise.points;
          
          if (count === 0) return null;
          
          return (
            <div key={exercise.id} className="day-stat-item">
              <div 
                className="day-stat-icon"
                style={{ backgroundColor: exercise.color }}
              />
              <div className="day-stat-info">
                <span className="day-stat-name">{exercise.name}</span>
                <span className="day-stat-count">{count} × {exercise.points} = {points} очков</span>
              </div>
            </div>
          );
        })}
        
        {Object.values(exerciseCounts).every(count => count === 0) && (
          <div className="day-stats-empty">
            <span>Пока ничего не выполнено</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default DayStats;
