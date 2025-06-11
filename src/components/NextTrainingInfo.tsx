import React from 'react';
import { Calendar } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { ru } from 'date-fns/locale';
import { UserSettings } from '../types';
import { getNextTrainingDay, calculateNewGoal } from '../utils/storage';

interface NextTrainingInfoProps {
  settings: UserSettings;
  isTrainingDay: boolean;
  goalReached: boolean;
  lastTrainingDayGoalReached?: boolean;
}

const NextTrainingInfo: React.FC<NextTrainingInfoProps> = ({ 
  settings, 
  isTrainingDay, 
  goalReached,
  lastTrainingDayGoalReached
}) => {
  // Показываем информацию только если:
  // 1. Сегодня не тренировочный день
  // 2. Или сегодня тренировочный день и цель выполнена
  const shouldShowInfo = !isTrainingDay || (isTrainingDay && goalReached);
  
  if (!shouldShowInfo) {
    return null;
  }

  const today = new Date();
  const nextTrainingDate = isTrainingDay && goalReached 
    ? getNextTrainingDay(today, settings)
    : !isTrainingDay 
      ? getNextTrainingDay(today, settings)
      : today;
  const nextGoal = isTrainingDay && goalReached 
    ? calculateNewGoal(settings.currentGoal, true)
    : !isTrainingDay && lastTrainingDayGoalReached !== undefined
      ? calculateNewGoal(settings.currentGoal, lastTrainingDayGoalReached)
      : settings.currentGoal;

  const formatNextTrainingDate = (date: Date) => {
    const today = new Date();
    const tomorrow = addDays(today, 1);
    
    if (format(date, 'yyyy-MM-dd') === format(tomorrow, 'yyyy-MM-dd')) {
      return 'завтра';
    } else if (format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')) {
      return 'сегодня';
    } else {
      return format(date, 'dd MMMM', { locale: ru });
    }
  };

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
                background: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '0.5rem'
              }}
            >
              <Calendar size={12} color="white" />
            </div>
            <h3 className="progress-title">
              {!isTrainingDay 
                ? 'Следующая тренировка' 
                : 'Цель выполнена! Следующая тренировка'
              }
            </h3>
          </div>
        </div>
        
        <div className="day-summary-section" style={{ marginTop: '0.75rem' }}>
          <div className="day-summary-grid">
            <div className="day-summary-item">
              <div 
                className="day-summary-icon"
                style={{ backgroundColor: '#3b82f6' }}
              />
              <div className="day-summary-info">
                <span className="day-summary-name">Дата</span>
                <span className="day-summary-count">
                  {formatNextTrainingDate(nextTrainingDate)}
                </span>
              </div>
            </div>
            
            <div className="day-summary-item">
              <div 
                className="day-summary-icon"
                style={{ backgroundColor: '#10b981' }}
              />
              <div className="day-summary-info">
                <span className="day-summary-name">Цель</span>
                <span className="day-summary-count">
                  {nextGoal} очков
                  {isTrainingDay && goalReached && nextGoal !== settings.currentGoal && (
                    <span style={{ color: '#10b981', marginLeft: '0.25rem' }}>
                      (+{Math.round(((nextGoal - settings.currentGoal) / settings.currentGoal) * 100)}%)
                    </span>
                  )}
                </span>
              </div>
            </div>
          </div>
          
          {!isTrainingDay && (
            <div className="day-summary-total">
              <span className="day-summary-total-label">Статус:</span>
              <span className="day-summary-total-value">День отдыха</span>
            </div>
          )}
          
          {isTrainingDay && goalReached && (
            <div className="day-summary-total">
              <span className="day-summary-total-label">Статус:</span>
              <span className="day-summary-total-value">🎉 Отличная работа!</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NextTrainingInfo;
