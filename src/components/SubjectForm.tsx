import React, { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { Subject, ScheduleConflict } from '../types/schedule';
import { 
  DAYS_MAP, 
  SHIFTS_MAP, 
  TIME_SLOTS, 
  validateSubjectForm
} from '../utils/scheduleUtils';
import { SubjectService } from '../services/subjectService';
import { useNotification } from '../contexts/NotificationContext';

interface SubjectFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (subject: Omit<Subject, 'id' | 'code' | 'color'>) => void;
  editingSubject?: Subject | null;
}

export function SubjectForm({ 
  isOpen, 
  onClose, 
  onSave, 
  editingSubject 
}: SubjectFormProps) {
  const { showNotification } = useNotification();
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    days: [] as number[],
    shift: '' as 'M' | 'T' | 'N' | '',
    timeSlots: [] as number[]
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [conflicts, setConflicts] = useState<ScheduleConflict[]>([]);

  useEffect(() => {
    if (editingSubject) {
      setFormData({
        name: editingSubject.name,
        location: editingSubject.location,
        days: editingSubject.days,
        shift: editingSubject.shift,
        timeSlots: editingSubject.timeSlots
      });
    } else {
      setFormData({
        name: '',
        location: '',
        days: [],
        shift: '',
        timeSlots: []
      });
    }
    setErrors([]);
    setTouched({});
    setConflicts([]);
  }, [editingSubject, isOpen]);

  useEffect(() => {
    const validationErrors = validateSubjectForm(
      formData.name,
      formData.location,
      formData.days,
      formData.shift,
      formData.timeSlots
    );
    setErrors(validationErrors);
  }, [formData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setTouched(prev => ({ ...prev, [name]: true }));
  };

  const handleDayChange = (day: number) => {
    setFormData(prev => ({
      ...prev,
      days: prev.days.includes(day)
        ? prev.days.filter(d => d !== day)
        : [...prev.days, day]
    }));
    setTouched(prev => ({ ...prev, days: true }));
  };

  const handleTimeSlotChange = (slot: number) => {
    setFormData(prev => ({
      ...prev,
      timeSlots: prev.timeSlots.includes(slot)
        ? prev.timeSlots.filter(s => s !== slot)
        : [...prev.timeSlots, slot]
    }));
    setTouched(prev => ({ ...prev, timeSlots: true }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (errors.length > 0) {
      showNotification('Por favor, corrija os erros no formulário', 'error');
      return;
    }

    if (formData.shift) {
      const conflicts = SubjectService.getSubjectConflicts(
        {
          name: formData.name,
          location: formData.location,
          days: formData.days,
          shift: formData.shift as 'M' | 'T' | 'N',
          timeSlots: formData.timeSlots
        },
        editingSubject?.id
      );

      if (conflicts.length > 0) {
        setConflicts(conflicts);
        showNotification('Conflitos de horário detectados', 'warning');
        return;
      }

      onSave({
        name: formData.name,
        location: formData.location,
        days: formData.days,
        shift: formData.shift as 'M' | 'T' | 'N',
        timeSlots: formData.timeSlots
      });
    }
  };

  const isFieldInvalid = (fieldName: string) => {
    return touched[fieldName] && errors.some(error => error.toLowerCase().includes(fieldName.toLowerCase()));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {editingSubject ? 'Editar Disciplina' : 'Adicionar Disciplina'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Nome da Disciplina *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-4 py-2 rounded-md border ${
                  isFieldInvalid('nome') 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 dark:border-gray-600 focus:ring-ufpb-primary'
                } bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 transition-colors`}
                placeholder="Ex: Cálculo I"
              />
              {isFieldInvalid('nome') && (
                <p className="mt-1 text-sm text-red-600">{errors.find(e => e.toLowerCase().includes('nome'))}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Local *
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className={`w-full px-4 py-2 rounded-md border ${
                  isFieldInvalid('local') 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 dark:border-gray-600 focus:ring-ufpb-primary'
                } bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 transition-colors`}
                placeholder="Ex: CAE 108"
              />
              {isFieldInvalid('local') && (
                <p className="mt-1 text-sm text-red-600">{errors.find(e => e.toLowerCase().includes('local'))}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-3">
              Dias da Semana *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {Object.entries(DAYS_MAP).map(([day, name]) => (
                <label key={day} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.days.includes(Number(day))}
                    onChange={() => handleDayChange(Number(day))}
                    className="border-gray-300 dark:border-gray-600 text-ufpb-primary focus:ring-ufpb-primary rounded"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-200">{name}</span>
                </label>
              ))}
            </div>
            {isFieldInvalid('dias') && (
              <p className="mt-1 text-sm text-red-600">{errors.find(e => e.toLowerCase().includes('dias'))}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-3">
              Turno *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(SHIFTS_MAP).map(([shiftKey, shiftName]) => (
                <label key={shiftKey} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="shift"
                    value={shiftKey}
                    checked={formData.shift === shiftKey}
                    onChange={handleChange}
                    className="border-gray-300 dark:border-gray-600 text-ufpb-primary focus:ring-ufpb-primary"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-200">{shiftName}</span>
                </label>
              ))}
            </div>
            {isFieldInvalid('turno') && (
              <p className="mt-1 text-sm text-red-600">{errors.find(e => e.toLowerCase().includes('turno'))}</p>
            )}
          </div>

          {formData.shift && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-3">
                Horários *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {TIME_SLOTS[formData.shift as 'M' | 'T' | 'N'].map(slot => (
                  <label key={slot.id} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.timeSlots.includes(slot.id)}
                      onChange={() => handleTimeSlotChange(slot.id)}
                      className="border-gray-300 dark:border-gray-600 text-ufpb-primary focus:ring-ufpb-primary rounded"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-200">{slot.label}</span>
                  </label>
                ))}
              </div>
              {isFieldInvalid('horários') && (
                <p className="mt-1 text-sm text-red-600">{errors.find(e => e.toLowerCase().includes('horários'))}</p>
              )}
            </div>
          )}

          {conflicts.length > 0 && (
            <div className="bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 rounded-md p-4">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                    Conflitos de horário detectados:
                  </h3>
                  <ul className="mt-2 text-sm text-red-700 dark:text-red-300 list-disc list-inside">
                    {conflicts.map((conflict, index) => (
                      <li key={index}>
                        {conflict.existingSubject.name} - {DAYS_MAP[conflict.day]}, {conflict.timeSlot}º horário
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-ufpb-primary hover:bg-ufpb-secondary rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ufpb-primary"
            >
              {editingSubject ? 'Salvar Alterações' : 'Adicionar Disciplina'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}