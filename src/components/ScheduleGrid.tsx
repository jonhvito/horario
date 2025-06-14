import React, { useMemo, useCallback } from 'react';
import { Subject } from '../types/schedule';
import { DAYS_MAP, SHIFTS_MAP, TIME_SLOTS } from '../utils/scheduleUtils';
import { ShiftFilter } from './ShiftFilter';
import { useShiftFilter } from '../hooks/useShiftFilter';

interface ScheduleGridProps {
  subjects: Subject[];
  onEditSubject: (subject: Subject) => void;
  onDeleteSubject: (subjectId: string) => void;
}

export const ScheduleGrid = React.memo(function ScheduleGrid({ 
  subjects, 
  onEditSubject, 
  onDeleteSubject 
}: ScheduleGridProps) {
  const [selectedShifts, setSelectedShifts] = useShiftFilter();

  // gridData[shift][day][slot] = Subject | null
  const gridData = useMemo(() => {
    const data: Record<string, Record<string, Record<number, Subject | null>>> = {};
    Object.keys(TIME_SLOTS).forEach(shift => {
      data[shift] = {};
      Object.keys(DAYS_MAP).forEach(day => {
        data[shift][day] = {};
        TIME_SLOTS[shift as 'M' | 'T' | 'N'].forEach(slot => {
          data[shift][day][slot.id] = null;
        });
      });
    });
    subjects.forEach(subject => {
      subject.days.forEach(day => {
        subject.timeSlots.forEach(slot => {
          data[subject.shift][String(day)][slot] = subject;
        });
      });
    });
    return data;
  }, [subjects]);

  const handleCellClick = useCallback((shift: string, day: string, slot: number, subject: Subject | null) => {
    if (subject) {
      onEditSubject(subject);
    }
  }, [onEditSubject]);

  const renderCell = useCallback((shift: string, day: string, slot: number, subject: Subject | null) => {
    const cellKey = `${shift}-${day}-${slot}`;
    const cellStyle = subject ? {
      backgroundColor: subject.color,
      cursor: 'pointer'
    } : {};
    return (
      <td
        key={cellKey}
        className="border border-gray-200 dark:border-gray-700 p-2 text-center align-middle relative group bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors min-h-[64px] min-w-[80px] sm:min-h-[72px] sm:min-w-[120px]"
        style={cellStyle}
      >
        {subject ? (
          <div className="text-white text-sm break-words flex flex-col items-center justify-center w-full h-full min-h-[48px]">
            <div className="font-bold w-full break-words">{subject.name}</div>
            <div className="w-full break-words">{subject.location}</div>
            <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEditSubject(subject);
                }}
                className="p-1 bg-white bg-opacity-20 rounded hover:bg-opacity-30 transition-colors"
                title="Editar disciplina"
              >
                ✏️
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteSubject(subject.id);
                }}
                className="p-1 bg-white bg-opacity-20 rounded hover:bg-opacity-30 transition-colors"
                title="Remover disciplina"
              >
                🗑️
              </button>
            </div>
          </div>
        ) : (
          <div 
            className="h-16 min-h-[48px] min-w-[80px] sm:min-h-[56px] sm:min-w-[120px] border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-md hover:border-ufpb-primary dark:hover:border-ufpb-primary transition-colors flex items-center justify-center"
            onClick={() => handleCellClick(shift, day, slot, subject)}
          />
        )}
      </td>
    );
  }, [handleCellClick, onEditSubject, onDeleteSubject]);

  return (
    <div className="space-y-4">
      <ShiftFilter
        selectedShifts={selectedShifts}
        onChange={setSelectedShifts}
      />
      
      <div className="overflow-x-auto -mx-4 sm:mx-0">
        <div className="min-w-full inline-block align-middle">
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0 z-10">
                <tr>
                  <th className="sticky left-0 z-20 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-2 text-gray-700 dark:text-gray-100">
                    Horário
                  </th>
                  {Object.entries(DAYS_MAP).map(([day, label]) => (
                    <th key={day} className="border border-gray-200 dark:border-gray-700 p-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-100">
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {Object.entries(TIME_SLOTS)
                  .filter(([shift]) => selectedShifts.includes(shift))
                  .map(([shift, slots]) => (
                    <React.Fragment key={shift}>
                      <tr>
                        <td
                          colSpan={Object.keys(DAYS_MAP).length + 1}
                          className="border border-gray-200 dark:border-gray-700 p-2 bg-gray-50 dark:bg-gray-900 font-bold text-gray-700 dark:text-gray-100 sticky top-[41px] z-10"
                        >
                          {SHIFTS_MAP[shift]}
                        </td>
                      </tr>
                      {slots.map(slot => (
                        <tr key={`${shift}-${slot.id}`}>
                          <td className="sticky left-0 z-20 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 p-2 text-gray-700 dark:text-gray-100">
                            <div className="text-sm">
                              <div>{slot.label}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {slot.start} - {slot.end}
                              </div>
                            </div>
                          </td>
                          {Object.keys(DAYS_MAP).map(day => (
                            renderCell(shift, day, slot.id, gridData[shift][day][slot.id])
                          ))}
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
});