import { useEffect } from 'react';
import { useSubjectsStore } from '../stores/useSubjectsStore';
import { useThemeStore } from '../stores/useThemeStore';
import { SubjectService } from '../services/subjectService';

export const useLocalStorage = () => {
  const { subjects, setSubjects } = useSubjectsStore();
  const { darkMode, setDarkMode } = useThemeStore();

  // Carregar dados do localStorage
  useEffect(() => {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      const loadedSubjects = SubjectService.loadSubjects();
      setSubjects(loadedSubjects);
    } catch (error) {
      // Se der erro, limpar localStorage e inicializar vazio
      localStorage.removeItem('schedule_data');
      localStorage.removeItem('schedule_backup');
      setSubjects([]);
      // Opcional: notificar o usuário
      // alert('Dados corrompidos foram removidos. Começando do zero.');
    }

    const theme = localStorage.getItem('theme');
    if (theme === 'dark') {
      setDarkMode(true);
      if (typeof document !== 'undefined') {
        document.documentElement.classList.add('dark');
      }
    }
  }, [setSubjects, setDarkMode]);

  // Salvar disciplinas no localStorage
  useEffect(() => {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      SubjectService.saveSubjects(subjects);
    } catch (error) {
      // Se der erro ao salvar, não faz nada (ou pode notificar)
    }
  }, [subjects]);

  // Salvar tema no localStorage
  useEffect(() => {
    if (typeof window === 'undefined' || !window.localStorage) return;
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
  }, [darkMode]);
}; 