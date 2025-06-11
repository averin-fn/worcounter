import React from 'react';
import { DayStats } from '../types';
import { EXERCISES } from '../constants';

interface ExerciseStatsProps {
  stats: DayStats[];
  records: any[];
}

const ExerciseStats: React.FC<ExerciseStatsProps> = ({ stats, records }) => {
  // Берем только последние 7 дней
  const last7Days = stats.slice(-7);
  
  // Подсчитываем статистику по упражнениям за 7 дней
  const exerciseStats = EXERCISES.map(exercise => {
    let totalCount = 0;
    let totalPoints = 0;
    
    last7Days.forEach(day => {
      if (day.isTrainingDay) {
        const record = records.find(r => r.date === day.date);
        if (record && record.exercises[exercise.id]) {
          const count = record.exercises[exercise.id];
          totalCount += count;
          totalPoints += count * exercise.points;
        }
      }
    });
    
    return {
      ...exercise,
      totalCount,
      totalPoints
    };
  }).filter(stat => stat.totalCount > 0); // Показываем только выполненные упражнения

  if (exerciseStats.length === 0) {
    return (
      <div className="day-progress-summary">
        <div className="progress-section">
          <div className="progress-header">
            <h3 className="progress-title">Статистика упражнений за 7 дней</h3>
          </div>
          <div className="day-summary-section" style={{ marginTop: '0.75rem' }}>
            <div className="day-summary-empty">
              <span>Нет данных за последние 7 дней</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="day-progress-summary">
      <div className="progress-section">
        <div className="progress-header">
          <h3 className="progress-title">Статистика упражнений за 7 дней</h3>
        </div>
        
        <div className="day-summary-section" style={{ marginTop: '0.75rem' }}>
          <div className="day-summary-grid">
            {exerciseStats.map(exercise => (
              <div key={exercise.id} className="day-summary-item">
                <div 
                  className="day-summary-icon"
                  style={{ backgroundColor: exercise.color }}
                />
                <div className="day-summary-info">
                  <span className="day-summary-name">{exercise.name}</span>
                  <span className="day-summary-count">{exercise.totalCount} раз = {exercise.totalPoints} очков</span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="day-summary-total">
            <span className="day-summary-total-label">Всего за 7 дней:</span>
            <span className="day-summary-total-value">
              {exerciseStats.reduce((sum, ex) => sum + ex.totalPoints, 0)} очков
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExerciseStats;
