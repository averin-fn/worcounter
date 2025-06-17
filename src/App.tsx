import React, { useState, useEffect } from "react";
import { Settings, BarChart3, Dumbbell, History } from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

import StatsChart from "./components/StatsChart";
import DayProgressSummary from "./components/DayProgressSummary";
import QuickActions from "./components/QuickActions";
import StreakCard from "./components/StreakCard";
import ExerciseStats from "./components/ExerciseStats";
import ExerciseHistory from "./components/ExerciseHistory";
import NextTrainingInfo from "./components/NextTrainingInfo";

import { EXERCISES } from "./constants";
import { UserSettings, WorkoutRecord, ExerciseHistoryEntry } from "./types";
import {
  loadSettings,
  saveSettings,
  loadRecords,
  saveRecords,
  isTrainingDay,
  getStatsForPeriod,
  calculateNewGoal,
  loadExerciseHistory,
  addExerciseToHistory,
  removeExerciseFromHistory,
} from "./utils/storage";

type TabType = "workout" | "stats" | "history" | "settings";

function App() {
  const [activeTab, setActiveTab] = useState<TabType>("workout");
  const [settings, setSettings] = useState<UserSettings>(loadSettings());
  const [records, setRecords] = useState<WorkoutRecord[]>(loadRecords());
  const [exerciseCounts, setExerciseCounts] = useState<{
    [key: string]: number;
  }>({});
  const [saveNotification, setSaveNotification] = useState<string | null>(null);  const [notificationType, setNotificationType] = useState<
    "success" | "delete" | "goal-reached" | "info"
  >("success");
  const [exerciseHistory, setExerciseHistory] = useState<
    ExerciseHistoryEntry[]
  >(loadExerciseHistory());
  const [notificationTimer, setNotificationTimer] =
    useState<NodeJS.Timeout | null>(null);

  const today = new Date();
  const todayStr = format(today, "yyyy-MM-dd");
  const isTodayTrainingDay = isTrainingDay(today, settings);
  const todayRecord = records.find((r) => r.date === todayStr);
  const currentPoints = Object.entries(exerciseCounts).reduce(
    (total, [exerciseId, count]) => {
      const exercise = EXERCISES.find((e) => e.id === exerciseId);
      return total + (exercise ? exercise.points * count : 0);
    },
    0
  );
  const isGoalReached = currentPoints >= settings.currentGoal;

  const stats = getStatsForPeriod(records, settings, 14); // Функция для показа уведомлений
  const showNotification = React.useCallback(
    (
      message: string,
      type: "success" | "delete" | "goal-reached" | "info",
      duration: number = 2500
    ) => {
      // Очищаем предыдущий таймер
      if (notificationTimer) {
        clearTimeout(notificationTimer);
      }

      setNotificationType(type);
      setSaveNotification(message);

      const timer = setTimeout(() => {
        // Добавляем класс для анимации исчезновения
        const notification = document.querySelector(".save-notification");
        if (notification) {
          notification.classList.add("fade-out");
          // Ждем завершения анимации перед удалением
          setTimeout(() => {
            setSaveNotification(null);
            setNotificationTimer(null);
          }, 300); // Длительность анимации fade-out
        } else {
          setSaveNotification(null);
          setNotificationTimer(null);
        }
      }, duration);

      setNotificationTimer(timer);
    },
    [notificationTimer]
  );

  // Settings save handler
  const handleSettingsSave = React.useCallback((newSettings: UserSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
  }, []);

  useEffect(() => {
    if (todayRecord) {
      setExerciseCounts(todayRecord.exercises);
    } else {
      setExerciseCounts({});
    }
  }, [todayRecord]);
  // Helper function to get the last training day
  const getLastTrainingDay = React.useCallback((): string | null => {
    const sortedRecords = [...records].sort((a, b) =>
      b.date.localeCompare(a.date)
    );
    for (const record of sortedRecords) {
      const recordDate = new Date(record.date);
      if (isTrainingDay(recordDate, settings) && record.date !== todayStr) {
        return record.date;
      }
    }
    return null;
  }, [records, settings, todayStr]);

  // Helper function to get the result of the last training day
  const getLastTrainingDayResult = React.useCallback(():
    | boolean
    | undefined => {
    const lastTrainingDay = getLastTrainingDay();
    if (lastTrainingDay) {
      const lastRecord = records.find((r) => r.date === lastTrainingDay);
      return lastRecord?.goalReached;
    }
    return undefined;
  }, [getLastTrainingDay, records]);

  // Check for goal adjustment on app load and day change
  useEffect(() => {
    const checkGoalAdjustment = () => {
      const lastTrainingDay = getLastTrainingDay();

      if (lastTrainingDay) {
        const lastRecord = records.find((r) => r.date === lastTrainingDay);
        const lastGoalAdjustmentKey = `goal_adjusted_${lastTrainingDay}`;
        const hasAdjusted = localStorage.getItem(lastGoalAdjustmentKey);

        // Only adjust if this is a new training day and we haven't adjusted for the last training day yet
        if (isTodayTrainingDay && !hasAdjusted && lastRecord) {
          const newGoal = calculateNewGoal(
            settings.currentGoal,
            lastRecord.goalReached
          );

          if (newGoal !== settings.currentGoal) {
            const newSettings = {
              ...settings,
              currentGoal: newGoal,
            };
            handleSettingsSave(newSettings);
            // Mark that we've adjusted for this training day
            localStorage.setItem(lastGoalAdjustmentKey, "true");

            // Show notification about goal change
            const changeType = lastRecord.goalReached
              ? "увеличена"
              : "уменьшена";
            const changePercent = lastRecord.goalReached ? "+10%" : "-5%";
            showNotification(
              `🎯 Цель ${changeType} (${changePercent}): ${newGoal} очков`,
              "info",
              4000
            );
          }
        }
      }
    };
    checkGoalAdjustment();
  }, [
    settings,
    records,
    isTodayTrainingDay,
    getLastTrainingDay,
    handleSettingsSave,
    todayStr,
    showNotification,
  ]);

  const handleExerciseCountChange = (exerciseId: string, count: number) => {
    const prevCount = exerciseCounts[exerciseId] || 0;
    const newCounts = {
      ...exerciseCounts,
      [exerciseId]: count,
    };
    setExerciseCounts(newCounts);

    // Добавляем в историю только если количество увеличилось
    if (count > prevCount) {
      const exercise = EXERCISES.find((e) => e.id === exerciseId);
      if (exercise) {
        const addedCount = count - prevCount;
        const addedPoints = addedCount * exercise.points;
        addExerciseToHistory(
          exerciseId,
          exercise.name,
          addedCount,
          addedPoints
        );
        setExerciseHistory(loadExerciseHistory()); // Обновляем состояние истории

        // Показываем уведомление об успешном добавлении
        showNotification(
          `✅ +${addedCount} ${exercise.name} (+${addedPoints} очков)`,
          "success"
        );
      }
    }

    // Auto-save immediately
    const newTotalPoints = Object.entries(newCounts).reduce(
      (total, [id, cnt]) => {
        const exercise = EXERCISES.find((e) => e.id === id);
        return total + (exercise ? exercise.points * cnt : 0);
      },
      0
    );

    if (newTotalPoints > 0) {
      const goalReached = newTotalPoints >= settings.currentGoal;

      const newRecord: WorkoutRecord = {
        id: todayStr,
        date: todayStr,
        exercises: newCounts,
        totalPoints: newTotalPoints,
        goalReached,
      };

      const updatedRecords = records.filter((r) => r.date !== todayStr);
      updatedRecords.push(newRecord);
      updatedRecords.sort((a, b) => a.date.localeCompare(b.date));

      setRecords(updatedRecords);
      saveRecords(updatedRecords); // Show goal reached notification but don't increase goal during the day
      const prevTotalPoints = Object.entries(exerciseCounts).reduce(
        (total, [id, cnt]) => {
          const exercise = EXERCISES.find((e) => e.id === id);
          return total + (exercise ? exercise.points * cnt : 0);
        },
        0
      );
      const wasGoalReached = prevTotalPoints >= settings.currentGoal;

      if (goalReached && !wasGoalReached) {
        // Показываем только при первом достижении цели
        showNotification("🎉 Цель достигнута!", "goal-reached", 3000);
      }
    }  };

  const handleQuickAdd = (exerciseId: string, count: number) => {
    const currentCount = exerciseCounts[exerciseId] || 0;
    handleExerciseCountChange(exerciseId, currentCount + count);
  };  const handleRemoveHistoryEntry = (entryId: string) => {
    const history = loadExerciseHistory();
    const entryToRemove = history.find((entry) => entry.id === entryId);

    // Проверяем, что удаление разрешено только для записей текущего дня
    if (!entryToRemove || entryToRemove.date !== todayStr) {
      showNotification('❌ Удаление разрешено только для записей текущего дня', 'delete');
      return;
    }

    removeExerciseFromHistory(entryId);
    setExerciseHistory(loadExerciseHistory()); // Обновляем состояние истории

    // Если удаляемая запись относится к сегодняшнему дню, обновляем счетчики
    if (entryToRemove && entryToRemove.date === todayStr) {
      const currentCount = exerciseCounts[entryToRemove.exerciseId] || 0;
      const newCount = Math.max(0, currentCount - entryToRemove.count);

      const newCounts = {
        ...exerciseCounts,
        [entryToRemove.exerciseId]: newCount,
      };
      setExerciseCounts(newCounts);

      // Пересчитываем общие очки и сохраняем запись дня
      const newTotalPoints = Object.entries(newCounts).reduce(
        (total, [id, cnt]) => {
          const exercise = EXERCISES.find((e) => e.id === id);
          return total + (exercise ? exercise.points * cnt : 0);
        },
        0
      );

      if (newTotalPoints > 0) {
        const goalReached = newTotalPoints >= settings.currentGoal;

        const newRecord: WorkoutRecord = {
          id: todayStr,
          date: todayStr,
          exercises: newCounts,
          totalPoints: newTotalPoints,
          goalReached,
        };

        const updatedRecords = records.filter((r) => r.date !== todayStr);
        updatedRecords.push(newRecord);
        updatedRecords.sort((a, b) => a.date.localeCompare(b.date));

        setRecords(updatedRecords);
        saveRecords(updatedRecords);
      } else {
        // Если очков стало 0, удаляем запись дня
        const updatedRecords = records.filter((r) => r.date !== todayStr);
        setRecords(updatedRecords);
        saveRecords(updatedRecords);
      }
    }

    if (entryToRemove) {
      showNotification(
        `🗑️ Удалено: ${entryToRemove.exerciseName} (-${entryToRemove.points} очков)`,
        "delete"
      );
    } else {
      showNotification("🗑️ Запись удалена", "delete");
    }
  };
  return (
    <div className="app-container">
      {/* Fixed Top Header */}
      <header className="fixed-header">
        {" "}
        {activeTab === "workout" ? (
          <div className="header-title">
            <div className="header-left">
              <Dumbbell size={24} style={{ color: "#111827" }} />
              <h1
                style={{
                  color: "#111827",
                  margin: 0,
                  fontSize: "1.5rem",
                  fontWeight: "bold",
                }}
              >
                Тренировка
              </h1>
            </div>{" "}
            <div className="header-right">
              <button
                onClick={() => setActiveTab("settings")}
                className="header-settings-btn"
                title="Настройки"
              >
                <Settings size={20} />
              </button>
            </div>
          </div>
        ) : activeTab === "stats" ? (
          <div className="header-title">
            <div className="header-left">
              <BarChart3 size={24} style={{ color: "#111827" }} />
              <h1
                style={{
                  color: "#111827",
                  margin: 0,
                  fontSize: "1.5rem",
                  fontWeight: "bold",
                }}
              >
                Статистика
              </h1>
            </div>
            <div className="header-right">
              <button
                onClick={() => setActiveTab("settings")}
                className="header-settings-btn"
                title="Настройки"
              >
                <Settings size={20} />
              </button>
            </div>
          </div>
        ) : activeTab === "history" ? (
          <div className="header-title">
            <div className="header-left">
              <History size={24} style={{ color: "#111827" }} />
              <h1
                style={{
                  color: "#111827",
                  margin: 0,
                  fontSize: "1.5rem",
                  fontWeight: "bold",
                }}
              >
                История
              </h1>
            </div>
            <div className="header-right">
              <button
                onClick={() => setActiveTab("settings")}
                className="header-settings-btn"
                title="Настройки"
              >
                <Settings size={20} />
              </button>
            </div>
          </div>
        ) : (
          <div className="header-title">
            <div className="header-left">
              <Settings size={24} style={{ color: "#111827" }} />
              <h1
                style={{
                  color: "#111827",
                  margin: 0,
                  fontSize: "1.5rem",
                  fontWeight: "bold",
                }}
              >
                Настройки
              </h1>
            </div>            <div className="header-right">
              <button
                onClick={() => setActiveTab("settings")}
                className={`header-settings-btn ${
                  activeTab === "settings" ? "active" : ""
                }`}
                title="Настройки"
              >
                <Settings size={20} />
              </button>
            </div>
          </div>
        )}
      </header>
      {/* Content */}
      <main className="main-content-new">
        {" "}
        {activeTab === "workout" ? (
          <div className="page-content">
            {" "}
            {/* Next Training Info - всегда показываем первым когда нужно */}
            {((isTodayTrainingDay && isGoalReached) || !isTodayTrainingDay) && (
              <NextTrainingInfo
                settings={settings}
                isTrainingDay={isTodayTrainingDay}
                goalReached={isGoalReached}
                lastTrainingDayGoalReached={getLastTrainingDayResult()}
              />
            )}
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
                <QuickActions onQuickAdd={handleQuickAdd} />
              </div>
            )}
          </div>
        ) : activeTab === "stats" ? (
          <div className="page-content">
            <StreakCard stats={stats} />
            <ExerciseStats stats={stats} records={records} />
            <StatsChart data={stats} />
          </div>
        ) : activeTab === "history" ? (
          <div className="page-content">
            {" "}
            <ExerciseHistory
              history={exerciseHistory}
              onRemoveEntry={handleRemoveHistoryEntry}
              currentDate={todayStr}
            />
          </div>        ) : (
          <div className="page-content">
            {/* Настройки тренировок */}
            <div className="day-progress-summary">
              <div className="progress-section">
                <div className="progress-header">
                  <div className="flex items-center">
                    <div 
                      style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: '0.5rem'
                      }}
                    >
                      <Settings size={12} color="white" />
                    </div>
                    <h3 className="progress-title">Настройки тренировок</h3>
                  </div>
                </div>
                
                <div className="day-summary-section" style={{ marginTop: '0.75rem' }}>
                  <div className="day-summary-grid">
                    {/* Периодичность тренировок */}
                    <div className="day-summary-item">
                      <div 
                        className="day-summary-icon"
                        style={{ backgroundColor: '#3b82f6' }}
                      />
                      <div className="day-summary-info">
                        <span className="day-summary-name">Периодичность</span>
                        <select
                          value={settings.trainingFrequency}
                          onChange={(e) => {
                            const newSettings = {
                              ...settings,
                              trainingFrequency: parseInt(e.target.value),
                            };
                            handleSettingsSave(newSettings);
                          }}
                          style={{
                            border: 'none',
                            background: 'transparent',
                            color: '#1f2937',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            outline: 'none'
                          }}
                        >
                          <option value={1}>Каждый день</option>
                          <option value={2}>Через день</option>
                          <option value={3}>Через 2 дня</option>
                          <option value={7}>Раз в неделю</option>
                        </select>
                      </div>
                    </div>
                    
                    {/* Текущая цель */}
                    <div className="day-summary-item">
                      <div 
                        className="day-summary-icon"
                        style={{ backgroundColor: '#10b981' }}
                      />
                      <div className="day-summary-info">
                        <span className="day-summary-name">Цель (очки)</span>
                        <input
                          type="number"
                          min="50"
                          max="500"
                          step="10"
                          value={settings.currentGoal}
                          onChange={(e) => {
                            const newSettings = {
                              ...settings,
                              currentGoal: parseInt(e.target.value) || 100,
                            };
                            handleSettingsSave(newSettings);
                          }}
                          style={{
                            border: 'none',
                            background: 'transparent',
                            color: '#1f2937',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            width: '80px',
                            outline: 'none'
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Дата начала - отдельный блок */}
                  <div className="day-summary-total" style={{ marginTop: '1rem' }}>
                    <span className="day-summary-total-label">Дата начала тренировок:</span>
                    <input
                      type="date"
                      value={settings.startDate}
                      onChange={(e) => {
                        const newSettings = {
                          ...settings,
                          startDate: e.target.value,
                        };
                        handleSettingsSave(newSettings);
                      }}
                      style={{
                        border: '1px solid #d1d5db',
                        borderRadius: '0.375rem',
                        padding: '0.25rem 0.5rem',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        color: '#1f2937',
                        background: 'white'
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Информация о приложении */}
            <div className="day-progress-summary">
              <div className="progress-section">
                <div className="progress-header">
                  <div className="flex items-center">
                    <div 
                      style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: '0.5rem'
                      }}
                    >
                      📱
                    </div>
                    <h3 className="progress-title">О приложении</h3>
                  </div>
                </div>
                
                <div className="day-summary-section" style={{ marginTop: '0.75rem' }}>
                  <div className="day-summary-empty">
                    <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280', lineHeight: '1.5' }}>
                      <strong>WorkoutCounter</strong> — приложение для отслеживания ежедневных тренировок и достижения фитнес-целей.
                      <br /><br />
                      Версия: 1.0.0<br />
                      Дата: {format(today, "EEEE, d MMMM yyyy", { locale: ru })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>{" "}
      {/* Bottom Navigation */}
      <nav className="bottom-navigation-fixed">
        <div className="bottom-tab-container">
          <button
            onClick={() => setActiveTab("workout")}
            className={`bottom-tab-button ${
              activeTab === "workout" ? "bottom-tab-active" : ""
            }`}
          >
            <Dumbbell size={24} />
            <span>Тренировка</span>
          </button>
          <button
            onClick={() => setActiveTab("stats")}
            className={`bottom-tab-button ${
              activeTab === "stats" ? "bottom-tab-active" : ""
            }`}
          >
            <BarChart3 size={24} />
            <span>Статистика</span>
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`bottom-tab-button ${
              activeTab === "history" ? "bottom-tab-active" : ""
            }`}
          >
            <History size={24} />
            <span>История</span>
          </button>
        </div>
      </nav>
      {/* Save Notification */}
      {saveNotification && (
        <div className={`save-notification ${notificationType}`}>
          {saveNotification}
        </div>
      )}
    </div>
  );
}

export default App;
