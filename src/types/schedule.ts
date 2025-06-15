export interface TimeSlot {
  id: number;
  label: string;
  start: string;
  end: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  location: string;
  color: string;
  days: number[];
  shift: 'M' | 'T' | 'N';
  timeSlots: number[];
  professor: string;
  scheduleCode?: string;
}

export interface ScheduleConflict {
  day: number;
  shift: 'M' | 'T' | 'N';
  timeSlot: number;
  existingSubject: Subject;
}
