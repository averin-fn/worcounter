import React, { useState, useEffect } from 'react';
import { Settings, BarChart3, Dumbbell } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

import StatsChart from './components/StatsChart';
import StatsSummary from './components/StatsSummary';
import DayProgressSummary from './components/DayProgressSummary';
import QuickActions from './components/QuickActions';
import Achievements from './components/Achievements';
import ThemeSwitcher from './components/ThemeSwitcher';


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
  const [isDarkTheme, setIsDarkTheme] = useState(false);

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

  const handleThemeToggle = () => {
    setIsDarkTheme(!isDarkTheme);
  };

  const handleQuickAdd = (exerciseId: string, count: number) => {
    const currentCount = exerciseCounts[exerciseId] || 0;
    handleExerciseCountChange(exerciseId, currentCount + count);
  };

  // Calculate achievements data
  const totalWorkouts = records.length;
  const streakDays = calculateStreakDays(records, settings);

  function calculateStreakDays(records: WorkoutRecord[], settings: UserSettings): number {
    if (records.length === 0) return 0;
    
    const sortedRecords = [...records].sort((a, b) => b.date.localeCompare(a.date));
    let streak = 0;
    let currentDate = new Date();
    
    for (const record of sortedRecords) {
      const recordDate = new Date(record.date);
      const diffDays = Math.floor((currentDate.getTime() - recordDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays <= streak * settings.trainingFrequency + settings.trainingFrequency - 1) {
        streak++;
        currentDate = recordDate;
      } else {
        break;
      }
    }
    
    return streak;
  }

  return (
    <div className={`app-container ${isDarkTheme ? 'dark-theme' : ''}`}>
      {/* Fixed Top Header */}
      <header className="fixed-header">
        {activeTab === 'workout' ? (
          <div className="header-title">
            <h1 style={{ color: 'white', margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>
              Тренировка
            </h1>
          </div>
        ) : activeTab === 'stats' ? (
          <div className="header-title">
            <h1 style={{ color: 'white', margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>
              Статистика
            </h1>
          </div>
        ) : (
          <div className="header-title">
            <h1 style={{ color: 'white', margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>
              Настройки
            </h1>
            <ThemeSwitcher 
              isDarkTheme={isDarkTheme}
              onThemeToggle={handleThemeToggle}
            />
          </div>
        )}
      </header>

      {/* Content */}
      <main className="main-content-new">
        {activeTab === 'workout' ? (
          <div className="workout-content">
            {isTodayTrainingDay && (
              <div className="space-y-4">
                {/* Day Progress Summary - Combined progress and day stats */}
                <DayProgressSummary
                  currentPoints={currentPoints}
                  goalPoints={settings.currentGoal}
                  exerciseCounts={exerciseCounts}
                  isTrainingDay={isTodayTrainingDay}
                />
                
                {/* Quick Actions */}
                <QuickActions
                  onQuickAdd={handleQuickAdd}
                />
              </div>
            )}
            
            {!isTodayTrainingDay && (
              <div className="rest-day-message">
                <h2>Сегодня день отдыха</h2>
                <p>Следующая тренировка запланирована на завтра</p>
              </div>
            )}
          </div>
        ) : activeTab === 'stats' ? (
          <div className="stats-content">
            <Achievements
              totalPoints={currentPoints}
              streakDays={streakDays}
              totalWorkouts={totalWorkouts}
            />
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
