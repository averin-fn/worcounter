import React from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';
import { DayStats } from '../types';
import { format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';

interface StatsChartProps {
  data: DayStats[];
}

const StatsChart: React.FC<StatsChartProps> = ({ data }) => {
  const chartData = data.map(stat => ({
    date: format(parseISO(stat.date), 'dd.MM', { locale: ru }),
    points: stat.points,
    goal: stat.goal,
    goalReached: stat.goalReached,
    isTrainingDay: stat.isTrainingDay
  }));
  return (
    <div className="progress-container">
      <h3 className="progress-title mb-4">Статистика за последние дни</h3>
      
      <div className="chart-container">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <XAxis 
              dataKey="date" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#6B7280' }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#6B7280' }}
            />
            <Bar dataKey="points" radius={[4, 4, 0, 0]}>
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
      
      <div className="flex justify-center mt-4 space-x-4 text-sm">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
          <span style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Цель достигнута</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
          <span style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Тренировочный день</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-gray-300 rounded mr-2"></div>
          <span style={{ color: 'rgba(255, 255, 255, 0.8)' }}>День отдыха</span>
        </div>
      </div>
    </div>
  );
};

export default StatsChart;
