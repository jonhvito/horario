import React, { createContext, useContext, useEffect } from 'react';
import { useThemeStore } from '../stores/useThemeStore';

interface ThemeContextType {
  darkMode: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { darkMode, toggleTheme } = useThemeStore();

  useEffect(() => {
    try {
      if (typeof document !== 'undefined') {
        if (darkMode) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    } catch (error) {
      console.error('Erro ao aplicar tema:', error);
    }
  }, [darkMode]);

  const value = React.useMemo(() => ({
    darkMode,
    toggleTheme,
  }), [darkMode, toggleTheme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme deve ser usado dentro de um ThemeProvider');
  }
  return context;
}; 