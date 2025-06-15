import { create } from 'zustand';
import { Subject } from '../types/schedule';
import { SubjectService } from '../services/subjectService';
import { ValidationError, ConflictError, StorageError } from '../utils/errors';

interface SubjectsState {
  subjects: Subject[];
  addSubject: (subject: Omit<Subject, 'id' | 'code' | 'color'>) => void;
  updateSubject: (id: string, subject: Omit<Subject, 'id' | 'code' | 'color'>) => void;
  deleteSubject: (subjectId: string) => void;
  setSubjects: (subjects: Subject[]) => void;
  refreshSubjects: () => void;
  error: string | null;
}

export const useSubjectsStore = create<SubjectsState>((set) => ({
  subjects: SubjectService.loadSubjects(),
  error: null,
  
  addSubject: (subjectData) => {
    try {
      const newSubject = SubjectService.addSubject(subjectData);
      set((state) => ({ 
        subjects: [...state.subjects, newSubject],
        error: null
      }));
    } catch (error) {
      if (error instanceof ValidationError || 
          error instanceof ConflictError || 
          error instanceof StorageError) {
        set({ error: error.message });
      } else {
        set({ error: 'Erro ao adicionar disciplina' });
      }
      throw error;
    }
  },
    
  updateSubject: (id, subjectData) => {
    try {
      const updatedSubject = SubjectService.updateSubject(id, subjectData);
      set((state) => ({
        subjects: state.subjects.map((s) => 
          s.id === id ? updatedSubject : s
        ),
        error: null
      }));
    } catch (error) {
      if (error instanceof ValidationError || 
          error instanceof ConflictError || 
          error instanceof StorageError) {
        set({ error: error.message });
      } else {
        set({ error: 'Erro ao atualizar disciplina' });
      }
      throw error;
    }
  },
    
  deleteSubject: (subjectId) => {
    try {
      SubjectService.deleteSubject(subjectId);
      set((state) => ({
        subjects: state.subjects.filter((s) => s.id !== subjectId),
        error: null
      }));
    } catch (error) {
      if (error instanceof ValidationError || 
          error instanceof StorageError) {
        set({ error: error.message });
      } else {
        set({ error: 'Erro ao remover disciplina' });
      }
      throw error;
    }
  },
    
  setSubjects: (subjects) => set({ subjects, error: null }),

  refreshSubjects: () => {
    try {
      const subjects = SubjectService.loadSubjects();
      set({ subjects, error: null });
    } catch (error) {
      if (error instanceof StorageError) {
        set({ error: error.message });
      } else {
        set({ error: 'Erro ao carregar disciplinas' });
      }
      throw error;
    }
  }
})); 