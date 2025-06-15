import React, { useState, useRef } from 'react';
import { Info } from 'lucide-react';
import { DAYS_MAP, SHIFTS_MAP, TIME_SLOTS } from '../utils/scheduleUtils';

export function Legend() {
  const [selectedShift, setSelectedShift] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  function handleSelectShift(code: string) {
    setSelectedShift(code);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setSelectedShift(null), 2000);
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex items-center space-x-2 mb-2">
        <Info className="h-5 w-5 text-ufpb-primary" />
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Legenda UFPB</h2>
      </div>

      <div className="space-y-4">
        {/* Dias da Semana */}
        <div>
          <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-1">Dias da Semana</h3>
          <table className="w-full text-sm border-separate border-spacing-1">
            <tbody>
              <tr>
                {Object.entries(DAYS_MAP)
                  .slice(0, 4)
                  .map(([code, name]) => (
                    <td
                      key={code}
                      className="bg-gray-100 dark:bg-gray-700 rounded-lg p-2 text-center align-middle"
                    >
                      <div className="font-mono text-xs text-gray-500 dark:text-gray-400">
                        {code}
                      </div>
                      <div className="text-gray-700 dark:text-gray-200 font-medium">{name}</div>
                    </td>
                  ))}
              </tr>
              <tr>
                {Object.entries(DAYS_MAP)
                  .slice(4)
                  .map(([code, name]) => (
                    <td
                      key={code}
                      className="bg-gray-100 dark:bg-gray-700 rounded-lg p-2 text-center align-middle"
                    >
                      <div className="font-mono text-xs text-gray-500 dark:text-gray-400">
                        {code}
                      </div>
                      <div className="text-gray-700 dark:text-gray-200 font-medium">{name}</div>
                    </td>
                  ))}
              </tr>
            </tbody>
          </table>
        </div>
        {/* Turnos */}
        <div>
          <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-1">Turnos</h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(SHIFTS_MAP).map(([code, name]) => (
              <button
                key={code}
                type="button"
                onClick={() => handleSelectShift(code)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ufpb-primary
                  ${
                    selectedShift === code
                      ? 'bg-ufpb-primary text-white shadow-lg ring-2 ring-ufpb-primary animate-pulse'
                      : 'bg-ufpb-primary/10 text-ufpb-primary dark:bg-ufpb-primary/20 dark:text-ufpb-primary hover:bg-ufpb-primary/20 dark:hover:bg-ufpb-primary/30'
                  }
                `}
                aria-pressed={selectedShift === code}
              >
                {name}
              </button>
            ))}
          </div>
        </div>
        {/* Horários por Turno */}
        <div>
          <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-1">Horários por Turno</h3>
          {Object.entries(TIME_SLOTS).map(([shift, slots]) => (
            <div
              key={shift}
              className={`mb-3 transition-all
              ${selectedShift === shift ? 'ring-4 ring-ufpb-primary ring-offset-2 shadow-2xl bg-ufpb-primary/20 dark:bg-ufpb-primary/30 animate-pulse' : ''}
            `}
            >
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                {SHIFTS_MAP[shift as keyof typeof SHIFTS_MAP]}
              </h4>
              <table className="w-full text-xs border-separate border-spacing-y-0.5 rounded-lg overflow-hidden">
                <thead>
                  <tr>
                    <th className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold px-2 py-1 rounded-tl-lg">
                      Nº
                    </th>
                    <th className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold px-2 py-1 rounded-tr-lg">
                      Horário
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {slots.map((slot, idx) => (
                    <tr
                      key={slot.id}
                      className={
                        idx % 2 === 0 ? 'bg-gray-50 dark:bg-gray-800' : 'bg-white dark:bg-gray-900'
                      }
                    >
                      <td className="font-mono px-2 py-1 text-center align-middle border border-gray-200 dark:border-gray-700 rounded-l-lg">
                        {slot.id}
                      </td>
                      <td className="px-2 py-1 text-gray-600 dark:text-gray-300 align-middle border border-gray-200 dark:border-gray-700 rounded-r-lg">
                        {slot.start} - {slot.end}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
