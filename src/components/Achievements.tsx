import React from 'react';
import { Award, Target, Flame, Trophy, Star, Zap } from 'lucide-react';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  unlocked: boolean;
  progress: number;
  maxProgress: number;
  color: string;
}

interface AchievementsProps {
  totalPoints: number;
  streakDays: number;
  totalWorkouts: number;
}

const Achievements: React.FC<AchievementsProps> = ({ 
  totalPoints, 
  streakDays, 
  totalWorkouts 
}) => {
  const achievements: Achievement[] = [
    {
      id: 'first-workout',
      title: 'Первая тренировка',
      description: 'Выполните свою первую тренировку',
      icon: <Zap size={20} />,
      unlocked: totalWorkouts >= 1,
      progress: Math.min(totalWorkouts, 1),
      maxProgress: 1,
      color: '#4ECDC4'
    },
    {
      id: 'week-streak',
      title: 'Неделя подряд',
      description: 'Тренируйтесь 7 дней подряд',
      icon: <Flame size={20} />,
      unlocked: streakDays >= 7,
      progress: Math.min(streakDays, 7),
      maxProgress: 7,
      color: '#FF6B6B'
    },
    {
      id: 'hundred-points',
      title: 'Сотня очков',
      description: 'Наберите 100 очков за день',
      icon: <Target size={20} />,
      unlocked: totalPoints >= 100,
      progress: Math.min(totalPoints, 100),
      maxProgress: 100,
      color: '#45B7D1'
    },
    {
      id: 'ten-workouts',
      title: 'Дисциплина',
      description: 'Выполните 10 тренировок',
      icon: <Trophy size={20} />,
      unlocked: totalWorkouts >= 10,
      progress: Math.min(totalWorkouts, 10),
      maxProgress: 10,
      color: '#FFD93D'
    },
    {
      id: 'month-streak',
      title: 'Месяц силы',
      description: 'Тренируйтесь 30 дней подряд',
      icon: <Award size={20} />,
      unlocked: streakDays >= 30,
      progress: Math.min(streakDays, 30),
      maxProgress: 30,
      color: '#9B59B6'
    },
    {
      id: 'perfectionist',
      title: 'Перфекционист',
      description: 'Наберите 500 очков за день',
      icon: <Star size={20} />,
      unlocked: totalPoints >= 500,
      progress: Math.min(totalPoints, 500),
      maxProgress: 500,
      color: '#E74C3C'
    }
  ];

  const unlockedCount = achievements.filter(a => a.unlocked).length;

  return (
    <div className="achievements">
      <div className="achievements-header">
        <h3>🏆 Достижения</h3>
        <div className="achievements-counter">
          {unlockedCount}/{achievements.length}
        </div>
      </div>

      <div className="achievements-grid">
        {achievements.map(achievement => (
          <div 
            key={achievement.id}
            className={`achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}`}
          >
            <div 
              className="achievement-icon"
              style={{ 
                backgroundColor: achievement.unlocked ? achievement.color : '#gray',
                color: 'white'
              }}
            >
              {achievement.icon}
            </div>
            
            <div className="achievement-content">
              <h4 className="achievement-title">{achievement.title}</h4>
              <p className="achievement-description">{achievement.description}</p>
              
              <div className="achievement-progress">
                <div 
                  className="achievement-progress-bar"
                  style={{
                    background: `linear-gradient(90deg, ${achievement.color} ${(achievement.progress / achievement.maxProgress) * 100}%, rgba(255,255,255,0.2) ${(achievement.progress / achievement.maxProgress) * 100}%)`
                  }}
                />
                <span className="achievement-progress-text">
                  {achievement.progress}/{achievement.maxProgress}
                </span>
              </div>
            </div>

            {achievement.unlocked && (
              <div className="achievement-unlocked-badge">
                <Award size={16} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Achievements;
