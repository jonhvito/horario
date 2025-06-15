import { Subject, ScheduleConflict } from '../types/schedule';
import { StorageService } from './storageService';
import {
  generateSubjectCode,
  checkScheduleConflicts,
  getNextAvailableColor,
  generateId,
} from '../utils/scheduleUtils';
import { ValidationError, ConflictError, StorageError, handleError } from '../utils/errors';

export class SubjectService {
  private static validateSubjectData(subject: Partial<Subject>, isUpdate: boolean = false): void {
    if (!isUpdate || 'name' in subject) {
      if (!subject.name?.trim()) {
        throw new ValidationError('Nome da disciplina é obrigatório');
      }
    }
    if (!isUpdate || 'location' in subject) {
      if (!subject.location?.trim()) {
        throw new ValidationError('Localização é obrigatória');
      }
    }
    if (!isUpdate || 'days' in subject) {
      if (!subject.days?.length) {
        throw new ValidationError('Pelo menos um dia deve ser selecionado');
      }
    }
    if (!isUpdate || 'timeSlots' in subject) {
      if (!subject.timeSlots?.length) {
        throw new ValidationError('Pelo menos um horário deve ser selecionado');
      }
    }
    if (!isUpdate || 'shift' in subject) {
      if (!subject.shift) {
        throw new ValidationError('Turno é obrigatório');
      }
    }
  }

  static loadSubjects(): Subject[] {
    try {
      const subjects = StorageService.loadData();
      if (!Array.isArray(subjects)) {
        throw new ValidationError('Dados corrompidos: formato inválido');
      }
      return subjects;
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new StorageError('Erro ao carregar disciplinas');
    }
  }

  static saveSubjects(subjects: Subject[]): void {
    try {
      if (!Array.isArray(subjects)) {
        throw new ValidationError('Dados inválidos: formato incorreto');
      }
      StorageService.saveData(subjects);
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new StorageError('Erro ao salvar disciplinas', { originalError: error });
    }
  }

  static addSubject(subject: Omit<Subject, 'id' | 'code' | 'color'>): Subject {
    try {
      this.validateSubjectData(subject);
      const subjects = this.loadSubjects();
      const conflicts = checkScheduleConflicts(subject, subjects);

      if (conflicts.length > 0) {
        throw new ConflictError('Conflito de horário detectado', { conflicts });
      }

      const newSubject: Subject = {
        ...subject,
        id: generateId(),
        code: generateSubjectCode(subject.days, subject.shift, subject.timeSlots),
        color: getNextAvailableColor(subjects),
      };

      subjects.push(newSubject);
      this.saveSubjects(subjects);
      return newSubject;
    } catch (error) {
      if (error instanceof ValidationError || error instanceof ConflictError) {
        throw error;
      }
      throw handleError(error);
    }
  }

  static updateSubject(
    id: string,
    updates: Partial<Omit<Subject, 'id' | 'code' | 'color'>>
  ): Subject {
    try {
      const subjects = this.loadSubjects();
      const index = subjects.findIndex((s) => s.id === id);

      if (index === -1) {
        throw new ValidationError('Disciplina não encontrada', { id });
      }

      const currentSubject = subjects[index];
      const updatedSubject: Subject = {
        ...currentSubject,
        ...updates,
        code: generateSubjectCode(
          updates.days || currentSubject.days,
          updates.shift || currentSubject.shift,
          updates.timeSlots || currentSubject.timeSlots
        ),
      };

      this.validateSubjectData(updatedSubject, true);

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
      const filteredSubjects = subjects.filter((s) => s.id !== id);

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

  static getSubjectConflicts(
    subject: Omit<Subject, 'id' | 'code' | 'color'>,
    excludeId?: string
  ): ScheduleConflict[] {
    try {
      this.validateSubjectData(subject);
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
      const data = JSON.parse(jsonData);
      if (!Array.isArray(data)) {
        throw new ValidationError('Dados importados inválidos: formato incorreto');
      }
      StorageService.importData(jsonData);
      return true;
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
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
