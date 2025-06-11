import React from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';
import { DayStats } from '../types';
import { format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';

interface StatsChartProps {
  data: DayStats[];
}

const StatsChart: React.FC<StatsChartProps> = ({ data }) => {
  // Берем только последние 7 дней
  const last7Days = data.slice(-7);
  
  const chartData = last7Days.map(stat => ({
    date: format(parseISO(stat.date), 'dd.MM', { locale: ru }),
    points: stat.points,
    goal: stat.goal,
    goalReached: stat.goalReached,
    isTrainingDay: stat.isTrainingDay
  }));

  return (
    <div className="day-progress-summary">
      <div className="progress-section">
        <div className="progress-header">
          <h3 className="progress-title">График за 7 дней</h3>
        </div>
          <div style={{ marginTop: '0.75rem', height: '200px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <XAxis 
                dataKey="date" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: '#6B7280' }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: '#6B7280' }}
                width={25}
              />
              <Bar dataKey="points" radius={[2, 2, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={
                      !entry.isTrainingDay 
                        ? '#E5E7EB' 
                        : entry.goalReached 
                          ? '#10B981' 
                          : '#3B82F6'
                    } 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="day-summary-section" style={{ marginTop: '0.5rem' }}>
          <div className="day-summary-grid">
            <div className="day-summary-item">
              <div 
                className="day-summary-icon"
                style={{ backgroundColor: '#10B981' }}
              />
              <div className="day-summary-info">
                <span className="day-summary-name">Цель достигнута</span>
              </div>
            </div>
            
            <div className="day-summary-item">
              <div 
                className="day-summary-icon"
                style={{ backgroundColor: '#3B82F6' }}
              />
              <div className="day-summary-info">
                <span className="day-summary-name">Тренировочный день</span>
              </div>
            </div>
            
            <div className="day-summary-item">
              <div 
                className="day-summary-icon"
                style={{ backgroundColor: '#E5E7EB' }}
              />
              <div className="day-summary-info">
                <span className="day-summary-name">День отдыха</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsChart;
