import { useState, useEffect } from 'react';

const STORAGE_KEY = 'selected_shifts';

export function useShiftFilter() {
  const [selectedShifts, setSelectedShifts] = useState<string[]>(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const savedShifts = localStorage.getItem(STORAGE_KEY);
      return savedShifts ? JSON.parse(savedShifts) : ['M', 'T', 'N'];
    }
    return ['M', 'T', 'N'];
  });

  useEffect(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedShifts));
    }
  }, [selectedShifts]);

  return [selectedShifts, setSelectedShifts] as const;
} 