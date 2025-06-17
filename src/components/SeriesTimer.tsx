import React, { useEffect, useState } from 'react';
import { Timer, Zap } from 'lucide-react';
import { SeriesState } from '../types';

interface SeriesTimerProps {
  seriesState: SeriesState;
  onSeriesEnd: () => void;
}

const SeriesTimer: React.FC<SeriesTimerProps> = ({ seriesState, onSeriesEnd }) => {
  const [timeLeft, setTimeLeft] = useState(seriesState.remainingTime);

  useEffect(() => {
    if (!seriesState.isActive) {
      return;
    }

    // Обновляем время на основе реального времени
    const updateTimer = () => {
      const now = Date.now();
      const elapsedSeconds = Math.floor((now - seriesState.startTime) / 1000);
      const remaining = Math.max(0, 120 - elapsedSeconds);
      
      setTimeLeft(remaining);
      
      if (remaining <= 0) {
        onSeriesEnd();
      }
    };

    // Обновляем сразу
    updateTimer();

    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [seriesState.isActive, seriesState.startTime, onSeriesEnd]);

  if (!seriesState.isActive) {
    return null;
  }

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = ((120 - timeLeft) / 120) * 100; // 120 секунд = 2 минуты

  return (
    <div className="series-timer">
      <div className="series-timer-header">
        <div 
          className="series-timer-icon"
          style={{
            background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
          }}
        >
          <Zap size={16} color="white" />
        </div>        <div className="series-timer-info">
          <h3 className="series-timer-title">Серия активна!</h3>
          <p className="series-timer-subtitle">
            Множитель: x{seriesState.multiplier.toFixed(1)} • Упражнений в серии: {seriesState.exerciseCount}
          </p>
        </div>
        <div className="series-timer-display">
          <Timer size={20} color="#f59e0b" />
          <span className="series-timer-time">
            {minutes}:{seconds.toString().padStart(2, '0')}
          </span>
        </div>
      </div>
      
      <div className="series-timer-progress">
        <div 
          className="series-timer-progress-bar"
          style={{ width: `${progress}%` }}
        />
      </div>
        <div className="series-timer-hint">
        <span>Добавляйте упражнения для увеличения множителя! Таймер сбрасывается при каждом новом упражнении.</span>
      </div>
    </div>
  );
};

export default SeriesTimer;
