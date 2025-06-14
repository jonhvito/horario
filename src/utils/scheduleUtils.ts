import { Subject, TimeSlot, ScheduleConflict } from '../types/schedule';

export const DAYS_MAP: Record<number, string> = {
  2: 'Segunda',
  3: 'Terça',
  4: 'Quarta',
  5: 'Quinta',
  6: 'Sexta',
  7: 'Sábado'
};

export const SHIFTS_MAP: Record<string, string> = {
  M: 'Manhã',
  T: 'Tarde',
  N: 'Noite'
};

export const TIME_SLOTS: Record<'M' | 'T' | 'N', TimeSlot[]> = {
  M: [
    { id: 1, label: '1º horário', start: '07:00', end: '08:00' },
    { id: 2, label: '2º horário', start: '08:00', end: '09:00' },
    { id: 3, label: '3º horário', start: '09:00', end: '10:00' },
    { id: 4, label: '4º horário', start: '10:00', end: '11:00' },
    { id: 5, label: '5º horário', start: '11:00', end: '12:00' },
    { id: 6, label: '6º horário', start: '12:00', end: '13:00' }
  ],
  T: [
    { id: 1, label: '1º horário', start: '13:00', end: '14:00' },
    { id: 2, label: '2º horário', start: '14:00', end: '15:00' },
    { id: 3, label: '3º horário', start: '15:00', end: '16:00' },
    { id: 4, label: '4º horário', start: '16:00', end: '17:00' },
    { id: 5, label: '5º horário', start: '17:00', end: '18:00' },
    { id: 6, label: '6º horário', start: '18:00', end: '19:00' }
  ],
  N: [
    { id: 1, label: '1º horário', start: '19:00', end: '19:50' },
    { id: 2, label: '2º horário', start: '19:50', end: '20:40' },
    { id: 3, label: '3º horário', start: '20:40', end: '21:30' },
    { id: 4, label: '4º horário', start: '21:30', end: '22:20' }
  ]
};

export const SUBJECT_COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', 
  '#3b82f6', '#8b5cf6', '#ec4899', '#f43f5e', '#84cc16',
  '#10b981', '#14b8a6', '#6366f1', '#a855f7', '#d946ef'
];

export function generateSubjectCode(days: number[], shift: 'M' | 'T' | 'N', timeSlots: number[]): string {
  const sortedDays = [...days].sort((a, b) => a - b);
  const sortedTimeSlots = [...timeSlots].sort((a, b) => a - b);
  
  return `${sortedDays.join('')}${shift}${sortedTimeSlots.join('')}`;
}

export function checkScheduleConflicts(
  newSubject: Omit<Subject, 'id' | 'code' | 'color'>,
  existingSubjects: Subject[],
  excludeSubjectId?: string
): ScheduleConflict[] {
  const conflicts: ScheduleConflict[] = [];
  const map = new Map<string, Subject>();

  // Validar dias
  if (!newSubject.days.every(day => day >= 2 && day <= 7)) {
    throw new Error('Dias inválidos. Use valores entre 2 (Segunda) e 7 (Sábado).');
  }

  // Validar horários
  const maxTimeSlots = newSubject.shift === 'N' ? 4 : 6;
  if (!newSubject.timeSlots.every(slot => slot >= 1 && slot <= maxTimeSlots)) {
    throw new Error(`Horários inválidos para o turno ${newSubject.shift}. Use valores entre 1 e ${maxTimeSlots}.`);
  }

  for (const subject of existingSubjects) {
    if (excludeSubjectId && subject.id === excludeSubjectId) continue;
    for (const d of subject.days) {
      for (const ts of subject.timeSlots) {
        map.set(`${d}-${subject.shift}-${ts}`, subject);
      }
    }
  }

  for (const day of newSubject.days) {
    for (const ts of newSubject.timeSlots) {
      const key = `${day}-${newSubject.shift}-${ts}`;
      const found = map.get(key);
      if (found) {
        conflicts.push({
          day,
          shift: newSubject.shift,
          timeSlot: ts,
          existingSubject: found
        });
      }
    }
  }
  
  return conflicts;
}

export function getNextAvailableColor(existingSubjects: Subject[]): string {
  const usedColors = existingSubjects.map(subject => subject.color);
  return SUBJECT_COLORS.find(color => !usedColors.includes(color)) || SUBJECT_COLORS[0];
}

export function validateSubjectForm(
  name: string,
  location: string,
  days: number[],
  shift: 'M' | 'T' | 'N' | '',
  timeSlots: number[]
): string[] {
  const errors: string[] = [];
  
  if (!name.trim()) {
    errors.push('Nome da disciplina é obrigatório');
  } else if (name.length > 100) {
    errors.push('Nome da disciplina deve ter no máximo 100 caracteres');
  }
  
  if (!location.trim()) {
    errors.push('Local da aula é obrigatório');
  } else if (location.length > 50) {
    errors.push('Local da aula deve ter no máximo 50 caracteres');
  }
  
  if (days.length === 0) {
    errors.push('Selecione pelo menos um dia da semana');
  } else if (!days.every(day => day >= 2 && day <= 7)) {
    errors.push('Dias inválidos. Use valores entre 2 (Segunda) e 7 (Sábado).');
  }
  
  if (!shift) {
    errors.push('Selecione um turno');
  }
  
  if (timeSlots.length === 0) {
    errors.push('Selecione pelo menos um horário');
  } else {
    const maxTimeSlots = shift === 'N' ? 4 : 6;
    if (!timeSlots.every(slot => slot >= 1 && slot <= maxTimeSlots)) {
      errors.push(`Horários inválidos para o turno ${shift}. Use valores entre 1 e ${maxTimeSlots}.`);
    }
  }
  
  return errors;
}