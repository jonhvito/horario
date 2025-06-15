import React, { useState, useMemo } from 'react';
import { Edit2, Trash2, Clock, Search } from 'lucide-react';
import { Subject } from '../types/schedule';
import { DAYS_MAP, TIME_SLOTS } from '../utils/scheduleUtils';
import { ShiftFilter } from './ShiftFilter';
import { useShiftFilter } from '../hooks/useShiftFilter';

interface SubjectListProps {
  subjects: Subject[];
  onEditSubject: (subject: Subject) => void;
  onDeleteSubject: (subjectId: string) => void;
}

export function SubjectList({ subjects, onEditSubject, onDeleteSubject }: SubjectListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedShifts, setSelectedShifts] = useShiftFilter();

  const filteredSubjects = useMemo(() => {
    return subjects
      .filter((subject) => selectedShifts.includes(subject.shift))
      .filter(
        (subject) =>
          subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          subject.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
          subject.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
          subject.professor.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (subject.scheduleCode &&
            subject.scheduleCode.toLowerCase().includes(searchTerm.toLowerCase()))
      );
  }, [subjects, searchTerm, selectedShifts]);

  const formatDays = (days: number[]) => {
    return days.map((day) => DAYS_MAP[day]).join(', ');
  };

  const formatTimeSlots = (slots: number[], shift: 'M' | 'T' | 'N') => {
    return slots
      .map((slot) => {
        const timeSlot = TIME_SLOTS[shift].find((ts) => ts.id === slot);
        return `${slot}º (${timeSlot?.start} - ${timeSlot?.end})`;
      })
      .join(', ');
  };

  if (subjects.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
        <Clock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          Nenhuma disciplina cadastrada
        </h3>
        <p className="text-gray-500 dark:text-gray-300">
          Adicione sua primeira disciplina para começar a montar seu horário
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <ShiftFilter selectedShifts={selectedShifts} onChange={setSelectedShifts} />

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div className="p-4 sm:p-6 border-b bg-gray-50 dark:bg-gray-900">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Disciplinas Cadastradas ({filteredSubjects.length})
            </h2>
            <div className="w-full sm:w-auto relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="search"
                  placeholder="Buscar disciplina..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-ufpb-primary focus:border-transparent transition-colors"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {filteredSubjects.map((subject) => (
            <div
              key={subject.id}
              className="p-4 sm:p-6 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    {subject.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {subject.code} - {subject.location}
                  </p>
                  {subject.professor && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Professor: {subject.professor}
                    </p>
                  )}
                  {subject.scheduleCode && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Código do Horário: {subject.scheduleCode}
                    </p>
                  )}
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {formatDays(subject.days)} - {formatTimeSlots(subject.timeSlots, subject.shift)}
                  </p>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => onEditSubject(subject)}
                    className="p-2 text-gray-600 dark:text-gray-300 hover:text-ufpb-primary dark:hover:text-ufpb-primary transition-colors"
                    title="Editar disciplina"
                  >
                    <Edit2 className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => onDeleteSubject(subject.id)}
                    className="p-2 text-gray-600 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-500 transition-colors"
                    title="Remover disciplina"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
