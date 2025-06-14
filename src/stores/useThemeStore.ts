import { create } from 'zustand';

interface ThemeState {
  darkMode: boolean;
  toggleTheme: () => void;
  setDarkMode: (darkMode: boolean) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  darkMode: false,
  
  toggleTheme: () => 
    set((state) => ({ 
      darkMode: !state.darkMode 
    })),
    
  setDarkMode: (darkMode) => set({ darkMode }),
})); 