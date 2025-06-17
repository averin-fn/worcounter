import React from 'react';
import { Clock, X } from 'lucide-react';
import { ExerciseHistoryEntry } from '../types';
import { EXERCISES } from '../constants';
import { format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';

interface ExerciseHistoryProps {
  history: ExerciseHistoryEntry[];
  onRemoveEntry: (entryId: string) => void;
  currentDate?: string; // Добавляем текущую дату
}

const ExerciseHistory: React.FC<ExerciseHistoryProps> = ({ history, onRemoveEntry, currentDate }) => {
  // Группируем историю по дням
  const groupedHistory = history.reduce((groups, entry) => {
    const date = entry.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(entry);
    return groups;
  }, {} as Record<string, ExerciseHistoryEntry[]>);

  const sortedDates = Object.keys(groupedHistory).sort((a, b) => b.localeCompare(a));

  if (history.length === 0) {
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
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '0.5rem'
                }}
              >
                <Clock size={12} color="white" />
              </div>
              <h3 className="progress-title">История упражнений</h3>
            </div>
          </div>
          
          <div className="day-summary-section" style={{ marginTop: '0.75rem' }}>
            <div className="day-summary-empty">
              <span>История пуста. Начните тренировку, чтобы увидеть записи здесь.</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '0.5rem'
              }}
            >
              <Clock size={12} color="white" />
            </div>
            <h3 className="progress-title">История упражнений</h3>
          </div>
          <div className="progress-percentage">
            {history.length}
          </div>
        </div>
        
        <div className="day-summary-section" style={{ marginTop: '0.75rem' }}>
          {sortedDates.map(date => {
            const dayEntries = groupedHistory[date];
            const dayTotal = dayEntries.reduce((sum, entry) => sum + entry.points, 0);
            
            return (
              <div key={date} style={{ marginBottom: '1rem' }}>                <div className="day-summary-total" style={{ marginBottom: '0.5rem' }}>
                  <span className="day-summary-total-label">
                    {format(parseISO(date), 'dd MMMM yyyy', { locale: ru })}
                    {currentDate && date === currentDate && (
                      <span style={{ 
                        marginLeft: '0.5rem', 
                        fontSize: '0.75rem', 
                        color: '#10b981',
                        fontWeight: 'normal'
                      }}>
                        (можно удалять)
                      </span>
                    )}
                  </span>
                  <span className="day-summary-total-value">{dayTotal} очков</span>
                </div>
                
                <div className="day-summary-grid">                  {dayEntries.map(entry => {
                    const exercise = EXERCISES.find(e => e.id === entry.exerciseId);
                    const time = format(parseISO(entry.timestamp), 'HH:mm');
                    const isCurrentDay = currentDate && entry.date === currentDate;
                    
                    return (
                      <div key={entry.id} className="day-summary-item" style={{ position: 'relative' }}>
                        <div 
                          className="day-summary-icon"
                          style={{ backgroundColor: exercise?.color || '#6b7280' }}
                        />
                        <div className="day-summary-info">
                          <span className="day-summary-name">
                            {entry.exerciseName} в {time}
                          </span>
                          <span className="day-summary-count">
                            +{entry.count} = {entry.points} очков
                          </span>
                        </div>
                        {isCurrentDay && (
                          <button
                            onClick={() => onRemoveEntry(entry.id)}
                            style={{
                              position: 'absolute',
                              right: '0.5rem',
                              top: '50%',
                              transform: 'translateY(-50%)',
                              background: '#ef4444',
                              border: 'none',
                              borderRadius: '50%',
                              width: '24px',
                              height: '24px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              color: 'white',
                              fontSize: '12px',
                              opacity: 0.8,
                              transition: 'opacity 0.2s'
                            }}
                            onMouseEnter={(e) => (e.target as HTMLElement).style.opacity = '1'}
                            onMouseLeave={(e) => (e.target as HTMLElement).style.opacity = '0.8'}
                            title="Удалить запись"
                          >
                            <X size={12} />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ExerciseHistory;
