import React, { useRef, useState } from 'react';
import { Download, Upload, Trash2, FileText, AlertCircle } from 'lucide-react';
import { SubjectService } from '../services/subjectService';
import { useSubjectsStore } from '../stores/useSubjectsStore';

interface ExportOptionsProps {
  scheduleRef: React.RefObject<HTMLDivElement>;
}

export function ExportOptions({ scheduleRef }: ExportOptionsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { subjects, setSubjects } = useSubjectsStore();
  const [error, setError] = useState<string | null>(null);

  const handleExportJSON = () => {
    try {
      const jsonData = SubjectService.exportSchedule();
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `horario-ufpb-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setError(null);
    } catch (err) {
      setError('Erro ao exportar horário. Tente novamente.');
      console.error('Erro ao exportar JSON:', err);
    }
  };

  const handleExportText = () => {
    try {
      const text = subjects.map(subject => {
        return `${subject.name} (${subject.code})\n` +
               `Local: ${subject.location}\n` +
               `Dias: ${subject.days.join(', ')}\n` +
               `Turno: ${subject.shift}\n` +
               `Horários: ${subject.timeSlots.join(', ')}\n\n`;
      }).join('');

      const blob = new Blob([text], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `horario-ufpb-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setError(null);
    } catch (err) {
      setError('Erro ao exportar horário. Tente novamente.');
      console.error('Erro ao exportar texto:', err);
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        if (SubjectService.importSchedule(content)) {
          setSubjects(SubjectService.loadSubjects());
          setError(null);
          alert('Horário importado com sucesso!');
        } else {
          setError('Erro ao importar horário. Verifique se o arquivo está no formato correto.');
        }
      } catch (err) {
        setError('Erro ao importar horário. Verifique se o arquivo está no formato correto.');
        console.error('Erro ao importar:', err);
      }
    };
    reader.onerror = () => {
      setError('Erro ao ler o arquivo. Tente novamente.');
    };
    reader.readAsText(file);
  };

  const handleClearSchedule = () => {
    if (window.confirm('Tem certeza que deseja limpar todo o horário? Esta ação não pode ser desfeita.')) {
      try {
        SubjectService.clearSchedule();
        setSubjects([]);
        setError(null);
      } catch (err) {
        setError('Erro ao limpar horário. Tente novamente.');
        console.error('Erro ao limpar horário:', err);
      }
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Opções de Exportação
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-md flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span>{error}</span>
        </div>
      )}

      <div className="space-y-3">
        <button
          onClick={handleExportJSON}
          className="w-full flex items-center justify-center px-4 py-2 bg-ufpb-primary text-white text-sm font-medium rounded-md hover:bg-ufpb-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ufpb-primary transition-colors"
        >
          <Download className="h-4 w-4 mr-2" />
          Exportar JSON
        </button>

        <button
          onClick={handleExportText}
          className="w-full flex items-center justify-center px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm font-medium rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
        >
          <FileText className="h-4 w-4 mr-2" />
          Exportar Texto
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full flex items-center justify-center px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm font-medium rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
        >
          <Upload className="h-4 w-4 mr-2" />
          Importar Horário
        </button>

        <button
          onClick={handleClearSchedule}
          className="w-full flex items-center justify-center px-4 py-2 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 text-sm font-medium rounded-md hover:bg-red-200 dark:hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Limpar Horário
        </button>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImport}
          accept=".json"
          className="hidden"
        />
      </div>
    </div>
  );
}