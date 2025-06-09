import React, { useState } from 'react';
import { Plus, Minus, Check, X } from 'lucide-react';
import { EXERCISES } from '../constants';
import { Exercise } from '../types';

interface AddExerciseProps {
  onAddExercise: (exerciseId: string, count: number) => void;
}

const AddExercise: React.FC<AddExerciseProps> = ({ onAddExercise }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [count, setCount] = useState(1);

  const handleSave = () => {
    if (selectedExercise && count > 0) {
      onAddExercise(selectedExercise.id, count);
      setIsOpen(false);
      setSelectedExercise(null);
      setCount(1);
    }
  };

  const handleCancel = () => {
    setIsOpen(false);
    setSelectedExercise(null);
    setCount(1);
  };

  const incrementCount = () => setCount(prev => prev + 1);
  const decrementCount = () => setCount(prev => Math.max(1, prev - 1));

  if (!isOpen) {
    return (
      <div className="add-exercise-container">
        <button 
          onClick={() => setIsOpen(true)}
          className="add-exercise-button-new"
        >
          <Plus size={18} />
          Добавить упражнение
        </button>
      </div>
    );
  }

  if (!selectedExercise) {
    return (
      <div className="add-exercise-modal-new">
        <div className="add-exercise-header-new">
          <h3>Выберите упражнение</h3>
          <button onClick={handleCancel} className="close-button-new">
            <X size={18} />
          </button>
        </div>
        
        <div className="exercise-grid-new">
          {EXERCISES.map(exercise => (
            <button
              key={exercise.id}
              onClick={() => setSelectedExercise(exercise)}
              className="exercise-card-new"
            >
              <div 
                className="exercise-icon-new"
                style={{ backgroundColor: exercise.color }}
              />
              <div className="exercise-info-new">
                <span className="exercise-name-new">{exercise.name}</span>
                <span className="exercise-points-new">{exercise.points} очков</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="add-exercise-modal-new">
      <div className="add-exercise-header-new">
        <h3>Добавить {selectedExercise.name}</h3>
        <button onClick={handleCancel} className="close-button-new">
          <X size={18} />
        </button>
      </div>
      
      <div className="count-selector-new">
        <div className="exercise-preview-new">
          <div 
            className="exercise-icon-new"
            style={{ backgroundColor: selectedExercise.color }}
          />
          <div className="exercise-details-new">
            <span className="exercise-name-new">{selectedExercise.name}</span>
            <span className="exercise-calculation-new">
              {count} × {selectedExercise.points} = {count * selectedExercise.points} очков
            </span>
          </div>
        </div>
        
        <div className="count-controls-new">
          <button 
            onClick={decrementCount}
            className="count-btn-new count-minus-new"
            disabled={count <= 1}
          >
            <Minus size={16} />
          </button>
          
          <div className="count-display-new">
            <span className="count-number-new">{count}</span>
          </div>
          
          <button 
            onClick={incrementCount}
            className="count-btn-new count-plus-new"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>
        <div className="add-exercise-actions-new">
        <button onClick={handleCancel} className="cancel-btn-new">
          Отмена
        </button>
        <button onClick={handleSave} className="save-btn-new">
          <Check size={16} />
          Добавить
        </button>
      </div>
    </div>
  );
};

export default AddExercise;
