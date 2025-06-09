import React, { useState } from 'react';
import { Save } from 'lucide-react';
import { UserSettings } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  settings: UserSettings;
  onClose: () => void;
  onSave: (settings: UserSettings) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, settings, onClose, onSave }) => {
  const [localSettings, setLocalSettings] = useState<UserSettings>(settings);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(localSettings);
    onClose();
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };
  return (
    <div 
      className="modal-overlay"
      onClick={handleOverlayClick}
    >
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">Настройки</h2>
        </div>
        
        <div className="space-y-4">
          <div className="form-group">
            <label className="form-label">
              Периодичность тренировок
            </label>
            <select
              value={localSettings.trainingFrequency}
              onChange={(e) => setLocalSettings({
                ...localSettings,
                trainingFrequency: parseInt(e.target.value)
              })}
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
              value={localSettings.currentGoal}
              onChange={(e) => setLocalSettings({
                ...localSettings,
                currentGoal: parseInt(e.target.value) || 100
              })}
              className="form-input"
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">
              Дата начала тренировок
            </label>
            <input
              type="date"
              value={localSettings.startDate}
              onChange={(e) => setLocalSettings({
                ...localSettings,
                startDate: e.target.value
              })}
              className="form-input"
            />
          </div>
        </div>
        
        <div className="flex space-x-3 mt-6">
          <button
            onClick={onClose}
            className="btn btn-secondary flex-1"
          >
            Отмена
          </button>
          <button
            onClick={handleSave}
            className="btn btn-primary flex-1 flex items-center justify-center"
          >
            <Save size={20} className="mr-2" />
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
