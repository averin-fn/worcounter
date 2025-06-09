import React from 'react';
import { Target } from 'lucide-react';
import { EXERCISES } from '../constants';

interface GoalProgressProps {
  currentPoints: number;
  goalPoints: number;
  isTrainingDay: boolean;
  compact?: boolean;
  exerciseCounts?: {[key: string]: number};
}

const GoalProgress: React.FC<GoalProgressProps> = ({ currentPoints, goalPoints, isTrainingDay, compact = false, exerciseCounts = {} }) => {  // Calculate the colored progress segments based on exercise counts
  const getProgressSegments = () => {
    if (!exerciseCounts || Object.keys(exerciseCounts).length === 0) {
      return [{ color: '#3b82f6', width: 0 }];
    }

    const segments: { color: string; width: number }[] = [];

    EXERCISES.forEach(exercise => {
      const count = exerciseCounts[exercise.id] || 0;
      if (count > 0) {
        const points = count * exercise.points;
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

  if (!isTrainingDay) {
    if (compact) {
      return (
        <div className="progress-container">
          <div className="flex items-center justify-between">          <div className="flex items-center">
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
        </div>
      );
    }
    return (
      <div className="progress-container">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4">
            <Target size={32} color="rgba(255, 255, 255, 0.8)" />
          </div>
          <h2 className="progress-title mb-2">
            Сегодня день отдыха
          </h2>
          <p className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            Следующая тренировка завтра
          </p>
        </div>
      </div>    );
  }
  const progress = (currentPoints / goalPoints) * 100; // Убираем Math.min, позволяем превышать 100%
  const isGoalReached = currentPoints >= goalPoints;

  if (compact) {
    return (
      <div className="progress-container">        <div className="progress-header">
          <h2 className="progress-title">Цель: {currentPoints}/{goalPoints}</h2>
          <div className="progress-percentage">
            {Math.round(progress)}%
          </div>
        </div>
          <div className="progress-bar" style={{ marginTop: '0.5rem' }}>
          {progressSegments.map((segment, index) => {
            const cumulativeWidth = progressSegments.slice(0, index).reduce((sum, seg) => sum + seg.width, 0);
            const segmentWidth = Math.min(segment.width, Math.max(0, 100 - cumulativeWidth)); // Ограничиваем визуальное отображение до 100%
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
    );
  }
    return (
    <div className="progress-container">
      <div className="progress-header">
        <div className="flex items-center">
          <div 
            style={{
              width: '24px',
              height: '24px',
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
            <Target size={14} color="white" />
          </div>
          <h2 className="progress-title">
            Цель на сегодня
          </h2>
        </div>
        <div className="progress-percentage">
          {Math.round(progress)}%
        </div>
      </div>
      
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-2xl font-bold text-white">
            {currentPoints}
          </span>
          <span className="text-lg" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
            / {goalPoints} очков
          </span>
        </div>
          <div className="progress-bar" style={{ position: 'relative' }}>
          {progressSegments.map((segment, index) => {
            const cumulativeWidth = progressSegments.slice(0, index).reduce((sum, seg) => sum + seg.width, 0);
            const segmentWidth = Math.min(segment.width, Math.max(0, 100 - cumulativeWidth)); // Ограничиваем визуальное отображение до 100%
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
        {isGoalReached ? (
        <div className="text-center">
          <p className="font-semibold text-white mb-1">
            🎉 Цель достигнута!
          </p>
          <p className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
            {currentPoints > goalPoints 
              ? `Перевыполнение на ${currentPoints - goalPoints} очков!`
              : 'Отличная работа!'
            }
          </p>
        </div>
      ) : (
        <div className="text-center">
          <p className="font-semibold text-white">
            Осталось {goalPoints - currentPoints} очков до цели
          </p>
        </div>
      )}
    </div>
  );
};

export default GoalProgress;
