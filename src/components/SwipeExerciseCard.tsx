import React, { useState, useRef } from 'react';
import { Plus, Minus } from 'lucide-react';
import { Exercise } from '../types';

interface SwipeExerciseCardProps {
  exercise: Exercise;
  count: number;
  onCountChange: (count: number) => void;
  onQuickAdd: (amount: number) => void;
}

const SwipeExerciseCard: React.FC<SwipeExerciseCardProps> = ({
  exercise,
  count,
  onCountChange,
  onQuickAdd
}) => {
  const [isSwipeActive, setIsSwipeActive] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX);
    setIsSwipeActive(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isSwipeActive) return;
    
    const currentX = e.touches[0].clientX;
    const diffX = currentX - startX;
    
    setCurrentX(diffX);
    
    if (Math.abs(diffX) > 50) {
      setSwipeDirection(diffX > 0 ? 'right' : 'left');
    } else {
      setSwipeDirection(null);
    }
  };

  const handleTouchEnd = () => {
    if (!isSwipeActive) return;
    
    const diffX = currentX;
    
    if (Math.abs(diffX) > 80) {
      if (diffX > 0) {
        // Swipe right - add
        onQuickAdd(5);
      } else {
        // Swipe left - subtract
        if (count >= 5) {
          onCountChange(count - 5);
        }
      }
    }
    
    setIsSwipeActive(false);
    setSwipeDirection(null);
    setCurrentX(0);
    setStartX(0);
  };
  const getCardStyle = () => {
    if (!isSwipeActive) return {};
    
    return {
      transform: `translateX(${currentX * 0.3}px)`,
      transition: isSwipeActive ? 'none' : 'transform 0.3s ease'
    };
  };

  const getActionOpacity = (direction: 'left' | 'right') => {
    if (!isSwipeActive || swipeDirection !== direction) return 0;
    return Math.min(Math.abs(currentX) / 100, 1);
  };

  return (
    <div className="swipe-exercise-wrapper">
      {/* Left action (subtract) */}
      <div 
        className="swipe-action swipe-action-left"
        style={{ opacity: getActionOpacity('left') }}
      >
        <Minus size={24} />
        <span>-5</span>
      </div>

      {/* Right action (add) */}
      <div 
        className="swipe-action swipe-action-right"
        style={{ opacity: getActionOpacity('right') }}
      >
        <Plus size={24} />
        <span>+5</span>
      </div>

      {/* Main card */}
      <div
        ref={cardRef}
        className={`swipe-exercise-card ${isSwipeActive ? 'swiping' : ''}`}
        style={getCardStyle()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="exercise-card-content">
          <div className="exercise-info">
            <div 
              className="exercise-icon"
              style={{ backgroundColor: exercise.color }}
            />
            <div className="exercise-details">
              <h4>{exercise.name}</h4>
              <p>{exercise.points} очков за раз</p>
            </div>
          </div>

          <div className="exercise-counter">
            <button
              onClick={() => onCountChange(Math.max(0, count - 1))}
              className="counter-btn counter-btn-minus"
              disabled={count === 0}
            >
              <Minus size={20} />
            </button>
            
            <div className="counter-display">
              <span className="counter-number">{count}</span>
              <span className="counter-points">{count * exercise.points} очков</span>
            </div>
            
            <button
              onClick={() => onCountChange(count + 1)}
              className="counter-btn counter-btn-plus"
            >
              <Plus size={20} />
            </button>
          </div>
        </div>

        <div className="swipe-hint">
          <span>← Смахните для быстрого изменения →</span>
        </div>
      </div>
    </div>
  );
};

export default SwipeExerciseCard;
