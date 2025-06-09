import React, { useState, useEffect } from 'react';
import { Settings, BarChart3, Dumbbell } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

import ExerciseCounter from './components/ExerciseCounter';
import GoalProgress from './components/GoalProgress';
import StatsChart from './components/StatsChart';
import StatsSummary from './components/StatsSummary';

import { EXERCISES } from './constants';
import { UserSettings, WorkoutRecord } from './types';
import { 
  loadSettings, 
  saveSettings, 
  loadRecords, 
  saveRecords,
  isTrainingDay,
  getStatsForPeriod
} from './utils/storage';

type TabType = 'workout' | 'stats' | 'settings';

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('workout');
  const [settings, setSettings] = useState<UserSettings>(loadSettings());
  const [records, setRecords] = useState<WorkoutRecord[]>(loadRecords());
  const [exerciseCounts, setExerciseCounts] = useState<{[key: string]: number}>({});
  const [saveNotification, setSaveNotification] = useState<string | null>(null);

  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');
  const isTodayTrainingDay = isTrainingDay(today, settings);
  
  const todayRecord = records.find(r => r.date === todayStr);
  const currentPoints = Object.entries(exerciseCounts).reduce((total, [exerciseId, count]) => {
    const exercise = EXERCISES.find(e => e.id === exerciseId);
    return total + (exercise ? exercise.points * count : 0);
  }, 0);

  const stats = getStatsForPeriod(records, settings, 14);

  useEffect(() => {
    if (todayRecord) {
      setExerciseCounts(todayRecord.exercises);
    } else {
      setExerciseCounts({});
    }
  }, [todayRecord]);

  const handleExerciseCountChange = (exerciseId: string, count: number) => {
    const newCounts = {
      ...exerciseCounts,
      [exerciseId]: count
    };
    setExerciseCounts(newCounts);

    // Auto-save immediately
    const newTotalPoints = Object.entries(newCounts).reduce((total, [id, cnt]) => {
      const exercise = EXERCISES.find(e => e.id === id);
      return total + (exercise ? exercise.points * cnt : 0);
    }, 0);

    if (newTotalPoints > 0) {
      const goalReached = newTotalPoints >= settings.currentGoal;
      
      const newRecord: WorkoutRecord = {
        id: todayStr,
        date: todayStr,
        exercises: newCounts,
        totalPoints: newTotalPoints,
        goalReached
      };

      const updatedRecords = records.filter(r => r.date !== todayStr);
      updatedRecords.push(newRecord);
      updatedRecords.sort((a, b) => a.date.localeCompare(b.date));
      
      setRecords(updatedRecords);
      saveRecords(updatedRecords);

      // Show save notification
      setSaveNotification('✓ Автосохранено');
      setTimeout(() => setSaveNotification(null), 2000);

      // Show goal reached notification but don't increase goal during the day
      if (goalReached) {
        setSaveNotification('🎉 Цель достигнута!');
        setTimeout(() => setSaveNotification(null), 3000);
      }
    }
  };

  const handleSettingsSave = (newSettings: UserSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  return (
    <div className="app-container">
      {/* Fixed Top Progress Bar - показываем на всех страницах */}
      <header className="fixed-progress-header">
        {activeTab === 'workout' ? (
          <GoalProgress
            currentPoints={currentPoints}
            goalPoints={settings.currentGoal}
            isTrainingDay={isTodayTrainingDay}
            compact={true}
            exerciseCounts={exerciseCounts}
          />
        ) : activeTab === 'stats' ? (
          <div className="header-title">
            <h1 style={{ color: 'white', margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>
              Статистика
            </h1>
            <div className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
              {format(today, 'd MMMM yyyy', { locale: ru })}
            </div>
          </div>
        ) : (
          <div className="header-title">
            <h1 style={{ color: 'white', margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>
              Настройки
            </h1>
            <div className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
              {format(today, 'd MMMM yyyy', { locale: ru })}
            </div>
          </div>
        )}
      </header>

      {/* Content */}
      <main className="main-content-new">
        {activeTab === 'workout' ? (
          <div className="workout-content">
            {isTodayTrainingDay && (
              <div className="space-y-4">
                {EXERCISES.map(exercise => (
                  <ExerciseCounter
                    key={exercise.id}
                    exercise={exercise}
                    count={exerciseCounts[exercise.id] || 0}
                    onCountChange={(count) => handleExerciseCountChange(exercise.id, count)}
                  />
                ))}
              </div>
            )}
          </div>
        ) : activeTab === 'stats' ? (
          <div className="stats-content">
            <StatsSummary stats={stats} />
            <StatsChart data={stats} />
          </div>
        ) : (
          <div className="settings-content">
            <div className="settings-header">
              <h2 className="settings-title">Настройки</h2>
              <p className="settings-subtitle">
                {format(today, 'EEEE, d MMMM yyyy', { locale: ru })}
              </p>
            </div>
            
            <div className="settings-form">
              <div className="form-group">
                <label className="form-label">
                  Периодичность тренировок
                </label>
                <select
                  value={settings.trainingFrequency}
                  onChange={(e) => {
                    const newSettings = {
                      ...settings,
                      trainingFrequency: parseInt(e.target.value)
                    };
                    handleSettingsSave(newSettings);
                  }}
                  className="form-select"
                >
                  <option value={1}>Каждый день</option>
                  <option value={2}>Через день</option>
                  <option value={3}>Через 2 дня</option>
                  <option value={7}>Раз в неделю</option>
                </select>
              </div>
              
              <div className="form-group">
                <label className="form-label">
                  Текущая цель (очки)
                </label>
                <input
                  type="number"
                  min="50"
                  max="500"
                  step="10"
                  value={settings.currentGoal}
                  onChange={(e) => {
                    const newSettings = {
                      ...settings,
                      currentGoal: parseInt(e.target.value) || 100
                    };
                    handleSettingsSave(newSettings);
                  }}
                  className="form-input"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">
                  Дата начала тренировок
                </label>
                <input
                  type="date"
                  value={settings.startDate}
                  onChange={(e) => {
                    const newSettings = {
                      ...settings,
                      startDate: e.target.value
                    };
                    handleSettingsSave(newSettings);
                  }}
                  className="form-input"
                />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="bottom-navigation-fixed">
        <div className="bottom-tab-container">
          <button
            onClick={() => setActiveTab('workout')}
            className={`bottom-tab-button ${activeTab === 'workout' ? 'bottom-tab-active' : ''}`}
          >
            <Dumbbell size={24} />
            <span>Тренировка</span>
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`bottom-tab-button ${activeTab === 'stats' ? 'bottom-tab-active' : ''}`}
          >
            <BarChart3 size={24} />
            <span>Статистика</span>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`bottom-tab-button ${activeTab === 'settings' ? 'bottom-tab-active' : ''}`}
          >
            <Settings size={24} />
            <span>Настройки</span>
          </button>
        </div>
      </nav>

      {/* Save Notification */}
      {saveNotification && (
        <div className="save-notification">
          {saveNotification}
        </div>
      )}
    </div>
  );
}

export default App;
