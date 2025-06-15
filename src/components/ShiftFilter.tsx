import React from 'react';
import { SHIFTS_MAP } from '../utils/scheduleUtils';

interface ShiftFilterProps {
  selectedShifts: string[];
  onChange: (shifts: string[]) => void;
}

export function ShiftFilter({ selectedShifts, onChange }: ShiftFilterProps) {
  const handleShiftToggle = (shift: string) => {
    if (selectedShifts.includes(shift)) {
      onChange(selectedShifts.filter((s) => s !== shift));
    } else {
      onChange([...selectedShifts, shift]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2">
        Mostrar turnos:
      </span>
      {Object.entries(SHIFTS_MAP).map(([shift, label]) => (
        <button
          key={shift}
          onClick={() => handleShiftToggle(shift)}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors
            ${
              selectedShifts.includes(shift)
                ? 'bg-ufpb-primary text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
