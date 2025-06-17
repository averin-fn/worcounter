import React from 'react';
import { Trophy } from 'lucide-react';
import { ExerciseRecord } from '../types';
import { EXERCISES } from '../constants';
import { format, parseISO } from 'date-fns';

interface ExerciseRecordsProps {
  records: ExerciseRecord[];
}

const ExerciseRecords: React.FC<ExerciseRecordsProps> = ({ records }) => {
  if (records.length === 0) {
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
                  background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '0.5rem'
                }}
              >
                <Trophy size={12} color="white" />
              </div>              <h3 className="progress-title">Рекорды за раз</h3>
            </div>
          </div>
          
          <div className="day-summary-section" style={{ marginTop: '0.75rem' }}>
            <div className="day-summary-empty">
              <span>Пока нет рекордов. Добавляйте упражнения, чтобы установить рекорды по максимальному количеству за раз!</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Сортируем рекорды по дате (новые сначала)
  const sortedRecords = [...records].sort((a, b) => b.timestamp.localeCompare(a.timestamp));

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
                background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '0.5rem'
              }}
            >
              <Trophy size={12} color="white" />
            </div>            <h3 className="progress-title">Рекорды за раз</h3>
          </div>
          <div className="progress-percentage">
            {records.length}
          </div>
        </div>
        
        <div className="day-summary-section" style={{ marginTop: '0.75rem' }}>
          <div className="day-summary-grid">
            {sortedRecords.map(record => {
              const exercise = EXERCISES.find(e => e.id === record.exerciseId);
              const date = format(parseISO(record.date), 'dd.MM.yyyy');
              
              return (
                <div key={record.exerciseId} className="day-summary-item">                  <div 
                    className="day-summary-icon"
                    style={{ 
                      backgroundColor: exercise?.color || '#6b7280'
                    }}
                  >
                    <span style={{ fontSize: '10px' }}>🏆</span>
                  </div>
                  <div className="day-summary-info">
                    <span className="day-summary-name">
                      {record.exerciseName}
                    </span>                    <span className="day-summary-count">
                      {record.maxCount} ({date})
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExerciseRecords;
