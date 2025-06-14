import { useEffect } from 'react';
import { useSubjectsStore } from '../stores/useSubjectsStore';
import { useThemeStore } from '../stores/useThemeStore';
import { SubjectService } from '../services/subjectService';

export const useLocalStorage = () => {
  const { subjects, setSubjects } = useSubjectsStore();
  const { darkMode, setDarkMode } = useThemeStore();

  // Carregar dados do localStorage
  useEffect(() => {
    const loadedSubjects = SubjectService.loadSubjects();
    setSubjects(loadedSubjects);

    if (typeof window !== 'undefined' && window.localStorage) {
      const theme = localStorage.getItem('theme');
      if (theme === 'dark') {
        setDarkMode(true);
        if (typeof document !== 'undefined') {
          document.documentElement.classList.add('dark');
        }
      }
    }
  }, [setSubjects, setDarkMode]);

  // Salvar disciplinas no localStorage
  useEffect(() => {
    SubjectService.saveSubjects(subjects);
  }, [subjects]);

  // Salvar tema no localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      if (darkMode) {
        if (typeof document !== 'undefined') {
          document.documentElement.classList.add('dark');
        }
        localStorage.setItem('theme', 'dark');
      } else {
        if (typeof document !== 'undefined') {
          document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme', 'light');
      }
    }
  }, [darkMode]);
}; 