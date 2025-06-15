import React, { useRef, useState, useEffect } from 'react';
import { Calendar, BookOpen, Moon, Sun, Plus } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface MainLayoutProps {
  children: React.ReactNode;
  activeTab: 'grid' | 'list';
  onTabChange: (tab: 'grid' | 'list') => void;
  onAddSubject: () => void;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  activeTab,
  onTabChange,
  onAddSubject,
}) => {
  const { darkMode, toggleTheme } = useTheme();
  const headerRef = useRef<HTMLHeadingElement>(null);
  const [showFab, setShowFab] = useState(false);

  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;
    if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
      const observer = new window.IntersectionObserver(
        ([entry]) => {
          setShowFab(!entry.isIntersecting);
        },
        { threshold: 0.01 }
      );
      observer.observe(header);
      return () => observer.disconnect();
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <header
        ref={headerRef}
        className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700 transition-colors static sm:sticky sm:top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between py-2 sm:py-4 gap-2 sm:gap-0">
            <div className="flex items-center justify-center w-full sm:w-auto space-x-3">
              <Calendar className="h-8 w-8 text-ufpb-primary" />
              <div className="text-center sm:text-left">
                <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  Sistema de Horários UFPB
                </h1>
              </div>
            </div>
            <div className="flex w-full items-center justify-around gap-2 mt-2 sm:hidden">
              <button
                onClick={onAddSubject}
                className="inline-flex items-center justify-center px-3 py-2 bg-ufpb-primary text-white text-sm font-medium rounded-md hover:bg-ufpb-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ufpb-primary transition-colors"
                aria-label="Adicionar disciplina"
              >
                <Plus className="h-4 w-4 mr-1" />
                Adicionar
              </button>
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full text-gray-500 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-ufpb-primary transition-colors flex items-center justify-center"
                aria-label={darkMode ? 'Ativar modo claro' : 'Ativar modo escuro'}
                type="button"
                style={{ minWidth: 40, minHeight: 40 }}
              >
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            </div>
            <div className="hidden sm:flex flex-row items-center justify-end w-full sm:w-auto space-x-2">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full text-gray-500 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-ufpb-primary transition-colors flex items-center justify-center"
                aria-label={darkMode ? 'Ativar modo claro' : 'Ativar modo escuro'}
                type="button"
                style={{ minWidth: 40, minHeight: 40 }}
              >
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <button
                onClick={onAddSubject}
                className="inline-flex items-center justify-center px-4 py-2 bg-ufpb-primary text-white text-sm font-medium rounded-md hover:bg-ufpb-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ufpb-primary transition-colors"
                aria-label="Adicionar disciplina"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Disciplina
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg transition-colors">
                <button
                  onClick={() => onTabChange('grid')}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === 'grid'
                      ? 'bg-white dark:bg-gray-900 text-ufpb-primary shadow-sm'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
                  }`}
                >
                  <Calendar className="h-4 w-4 inline mr-2" />
                  Grade de Horários
                </button>
                <button
                  onClick={() => onTabChange('list')}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === 'list'
                      ? 'bg-white dark:bg-gray-900 text-ufpb-primary shadow-sm'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
                  }`}
                >
                  <BookOpen className="h-4 w-4 inline mr-2" />
                  Lista de Disciplinas
                </button>
              </div>
            </div>

            {children}
          </div>
        </div>
        <button
          onClick={onAddSubject}
          className={`fixed bottom-6 right-6 z-50 bg-ufpb-primary text-white rounded-full shadow-lg p-4 flex items-center justify-center transition-all duration-300 hover:bg-ufpb-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ufpb-primary sm:hidden ${showFab ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
          aria-label="Adicionar disciplina"
        >
          <Plus className="h-6 w-6" />
        </button>
      </main>
    </div>
  );
};
