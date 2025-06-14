import { create } from 'zustand';
import { Subject } from '../types/schedule';
import { SubjectService } from '../services/subjectService';

interface SubjectsState {
  subjects: Subject[];
  addSubject: (subject: Omit<Subject, 'id' | 'code' | 'color'>) => void;
  updateSubject: (id: string, subject: Omit<Subject, 'id' | 'code' | 'color'>) => void;
  deleteSubject: (subjectId: string) => void;
  setSubjects: (subjects: Subject[]) => void;
  refreshSubjects: () => void;
}

export const useSubjectsStore = create<SubjectsState>((set) => ({
  subjects: SubjectService.loadSubjects(),
  
  addSubject: (subjectData) => {
    const newSubject = SubjectService.addSubject(subjectData);
    set((state) => ({ 
      subjects: [...state.subjects, newSubject] 
    }));
  },
    
  updateSubject: (id, subjectData) => {
    const updatedSubject = SubjectService.updateSubject(id, subjectData);
    set((state) => ({
      subjects: state.subjects.map((s) => 
        s.id === id ? updatedSubject : s
      ),
    }));
  },
    
  deleteSubject: (subjectId) => {
    SubjectService.deleteSubject(subjectId);
    set((state) => ({
      subjects: state.subjects.filter((s) => s.id !== subjectId),
    }));
  },
    
  setSubjects: (subjects) => set({ subjects }),

  refreshSubjects: () => {
    const subjects = SubjectService.loadSubjects();
    set({ subjects });
  }
})); 