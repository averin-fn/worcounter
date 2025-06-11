import React from 'react';
import { Trophy } from 'lucide-react';
import { DayStats } from '../types';

interface StreakCardProps {
  stats: DayStats[];
}

const StreakCard: React.FC<StreakCardProps> = ({ stats }) => {
  // Берем только последние 7 дней
  const last7Days = stats.slice(-7);
  const trainingDays = last7Days.filter(s => s.isTrainingDay);
  const goalsReached = trainingDays.filter(s => s.goalReached).length;
  const successRate = trainingDays.length > 0 ? Math.round((goalsReached / trainingDays.length) * 100) : 0;

  // Вычисляем текущую серию выполненных целей
  const calculateCurrentStreak = () => {
    let streak = 0;
    for (let i = last7Days.length - 1; i >= 0; i--) {
      const day = last7Days[i];
      if (day.isTrainingDay) {
        if (day.goalReached) {
          streak++;
        } else {
          break;
        }
      }
    }
    return streak;
  };

  const currentStreak = calculateCurrentStreak();

  return (
    <div className="day-progress-summary">
      <div className="progress-section">
        <div className="progress-header">
          <div className="flex items-center">
            <div 
              style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                background: currentStreak > 0 
                  ? 'linear-gradient(135deg, #10b981 0%, #34d399 100%)'
                  : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '0.5rem'
              }}
            >
              <Trophy size={12} color="white" />
            </div>
            <h3 className="progress-title">Серия целей: {currentStreak}</h3>
          </div>
          <div className="progress-percentage">
            {successRate}%
          </div>
        </div>

        <div className="day-summary-section" style={{ marginTop: '0.75rem' }}>
          <div className="day-summary-grid">
            <div className="day-summary-item">
              <div 
                className="day-summary-icon"
                style={{ backgroundColor: '#10b981' }}
              />
              <div className="day-summary-info">
                <span className="day-summary-name">Выполнено целей</span>
                <span className="day-summary-count">{goalsReached}/{trainingDays.length} за 7 дней</span>
              </div>
            </div>
            
            <div className="day-summary-item">
              <div 
                className="day-summary-icon"
                style={{ backgroundColor: '#3b82f6' }}
              />
              <div className="day-summary-info">
                <span className="day-summary-name">Успешность</span>
                <span className="day-summary-count">{successRate}% за 7 дней</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StreakCard;
