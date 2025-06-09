import React from 'react';
import { Trophy, Calendar, Target, TrendingUp } from 'lucide-react';
import { DayStats } from '../types';

interface StatsSummaryProps {
  stats: DayStats[];
}

const StatsSummary: React.FC<StatsSummaryProps> = ({ stats }) => {
  const trainingDays = stats.filter(s => s.isTrainingDay);
  const goalsReached = trainingDays.filter(s => s.goalReached).length;
  const totalPoints = stats.reduce((sum, s) => sum + s.points, 0);
  const averagePoints = trainingDays.length > 0 ? Math.round(totalPoints / trainingDays.length) : 0;
  const successRate = trainingDays.length > 0 ? Math.round((goalsReached / trainingDays.length) * 100) : 0;
  const statCards = [
    {
      icon: <Trophy color="white" size={24} />,
      title: 'Цели достигнуты',
      value: `${goalsReached}/${trainingDays.length}`,
      subtitle: `${successRate}% успеха`
    },
    {
      icon: <Target color="white" size={24} />,
      title: 'Всего очков',
      value: totalPoints.toString(),
      subtitle: 'за период'
    },
    {
      icon: <TrendingUp color="white" size={24} />,
      title: 'Среднее за день',
      value: averagePoints.toString(),
      subtitle: 'очков'
    },
    {
      icon: <Calendar color="white" size={24} />,
      title: 'Тренировок',
      value: trainingDays.length.toString(),
      subtitle: 'дней'
    }
  ];

  return (
    <div className="stats-grid">
      {statCards.map((card, index) => (
        <div key={index} className="stat-card">
          <div className="stat-header">
            {card.icon}
            <h3 className="stat-title">{card.title}</h3>
          </div>
          <div className="stat-value">{card.value}</div>
          <div className="stat-label">{card.subtitle}</div>
        </div>
      ))}
    </div>
  );
};

export default StatsSummary;
