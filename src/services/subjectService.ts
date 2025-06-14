import { Subject, ScheduleConflict } from '../types/schedule';
import { StorageService } from './storageService';
import { generateSubjectCode, checkScheduleConflicts, getNextAvailableColor } from '../utils/scheduleUtils';
import { ValidationError, ConflictError, StorageError, handleError } from '../utils/errors';

export class SubjectService {
  static loadSubjects(): Subject[] {
    try {
      return StorageService.loadData();
    } catch (error) {
      throw new StorageError('Erro ao carregar disciplinas', { originalError: error });
    }
  }

  static saveSubjects(subjects: Subject[]): void {
    try {
      StorageService.saveData(subjects);
    } catch (error) {
      throw new StorageError('Erro ao salvar disciplinas', { originalError: error });
    }
  }

  static addSubject(subject: Omit<Subject, 'id' | 'code' | 'color'>): Subject {
    try {
      const subjects = this.loadSubjects();
      const conflicts = checkScheduleConflicts(subject, subjects);
      
      if (conflicts.length > 0) {
        throw new ConflictError('Conflito de horário detectado', { conflicts });
      }

      const newSubject: Subject = {
        ...subject,
        id: crypto.randomUUID(),
        code: generateSubjectCode(subject.days, subject.shift, subject.timeSlots),
        color: getNextAvailableColor(subjects)
      };

      subjects.push(newSubject);
      this.saveSubjects(subjects);
      return newSubject;
    } catch (error) {
      if (error instanceof ConflictError) {
        throw error;
      }
      throw handleError(error);
    }
  }

  static updateSubject(id: string, updates: Partial<Omit<Subject, 'id' | 'code' | 'color'>>): Subject {
    try {
      const subjects = this.loadSubjects();
      const index = subjects.findIndex(s => s.id === id);
      
      if (index === -1) {
        throw new ValidationError('Disciplina não encontrada', { id });
      }

      const updatedSubject: Subject = {
        ...subjects[index],
        ...updates,
        code: generateSubjectCode(
          updates.days || subjects[index].days,
          updates.shift || subjects[index].shift,
          updates.timeSlots || subjects[index].timeSlots
        )
      };

      const conflicts = checkScheduleConflicts(updatedSubject, subjects, id);
      
      if (conflicts.length > 0) {
        throw new ConflictError('Conflito de horário detectado', { conflicts });
      }

      subjects[index] = updatedSubject;
      this.saveSubjects(subjects);
      return updatedSubject;
    } catch (error) {
      if (error instanceof ValidationError || error instanceof ConflictError) {
        throw error;
      }
      throw handleError(error);
    }
  }

  static deleteSubject(id: string): void {
    try {
      const subjects = this.loadSubjects();
      const filteredSubjects = subjects.filter(s => s.id !== id);
      
      if (filteredSubjects.length === subjects.length) {
        throw new ValidationError('Disciplina não encontrada', { id });
      }

      this.saveSubjects(filteredSubjects);
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      throw handleError(error);
    }
  }

  static getSubjectConflicts(subject: Omit<Subject, 'id' | 'code' | 'color'>, excludeId?: string): ScheduleConflict[] {
    try {
      const subjects = this.loadSubjects();
      return checkScheduleConflicts(subject, subjects, excludeId);
    } catch (error) {
      throw handleError(error);
    }
  }

  static exportSchedule(): string {
    try {
      return StorageService.exportData();
    } catch (error) {
      throw new StorageError('Erro ao exportar horário', { originalError: error });
    }
  }

  static importSchedule(jsonData: string): boolean {
    try {
      StorageService.importData(jsonData);
      return true;
    } catch (error) {
      return false;
    }
  }

  static clearSchedule(): void {
    try {
      StorageService.clearData();
    } catch (error) {
      throw new StorageError('Erro ao limpar horário', { originalError: error });
    }
  }
} 