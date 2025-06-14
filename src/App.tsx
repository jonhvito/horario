/**
 * UFPB Schedule System
 * Copyright (c) 2024 João Victor
 * 
 * Este arquivo é parte do UFPB Schedule System.
 * O UFPB Schedule System é um software livre; você pode redistribuí-lo e/ou
 * modificá-lo sob os termos da Licença MIT.
 */

import React, { useRef } from 'react';
import { Subject } from './types/schedule';
import { SubjectForm } from './components/SubjectForm';
import { ScheduleGrid } from './components/ScheduleGrid';
import { SubjectList } from './components/SubjectList';
import { ExportOptions } from './components/ExportOptions';
import { Legend } from './components/Legend';
import { useSubjectsStore } from './stores/useSubjectsStore';
import { ThemeProvider } from './contexts/ThemeContext';
import { NotificationProvider, useNotification } from './contexts/NotificationContext';
import { MainLayout } from './layouts/MainLayout';
import { useLocalStorage } from './hooks/useLocalStorage';
import { AppError } from './utils/errors';

function AppContent() {
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingSubject, setEditingSubject] = React.useState<Subject | null>(null);
  const [activeTab, setActiveTab] = React.useState<'grid' | 'list'>('grid');
  const scheduleRef = useRef<HTMLDivElement>(null);

  const { subjects, addSubject, updateSubject, deleteSubject } = useSubjectsStore();
  const { showNotification } = useNotification();

  // Inicializar localStorage
  useLocalStorage();

  const handleSaveSubject = (subjectData: Omit<Subject, 'id' | 'code' | 'color'>) => {
    try {
      if (editingSubject) {
        updateSubject(editingSubject.id, subjectData);
        showNotification('Disciplina atualizada com sucesso!', 'success');
      } else {
        addSubject(subjectData);
        showNotification('Disciplina adicionada com sucesso!', 'success');
      }
      setIsFormOpen(false);
      setEditingSubject(null);
    } catch (error) {
      if (error instanceof AppError) {
        showNotification(error.message, 'error');
      } else {
        showNotification('Ocorreu um erro ao salvar a disciplina.', 'error');
      }
    }
  };

  const handleEditSubject = (subject: Subject) => {
    setEditingSubject(subject);
    setIsFormOpen(true);
  };

  const handleDeleteSubject = (subjectId: string) => {
    let confirmed = true;
    if (typeof window !== 'undefined' && typeof window.confirm === 'function') {
      confirmed = window.confirm('Tem certeza que deseja remover esta disciplina?');
    }
    if (confirmed) {
      try {
        deleteSubject(subjectId);
        showNotification('Disciplina removida com sucesso!', 'success');
      } catch (error) {
        if (error instanceof AppError) {
          showNotification(error.message, 'error');
        } else {
          showNotification('Ocorreu um erro ao remover a disciplina.', 'error');
        }
      }
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingSubject(null);
  };

  return (
    <MainLayout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onAddSubject={() => setIsFormOpen(true)}
    >
      <div ref={scheduleRef}>
        {activeTab === 'grid' ? (
          <ScheduleGrid
            subjects={subjects} 
            onEditSubject={handleEditSubject}
            onDeleteSubject={handleDeleteSubject}
          />
        ) : (
          <SubjectList
            subjects={subjects}
            onEditSubject={handleEditSubject}
            onDeleteSubject={handleDeleteSubject}
          />
        )}
      </div>

      <div className="space-y-6">
        <ExportOptions />
        <Legend />
      </div>

      <SubjectForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSave={handleSaveSubject}
        editingSubject={editingSubject}
      />
    </MainLayout>
  );
}

function App() {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <AppContent />
      </NotificationProvider>
    </ThemeProvider>
  );
}

export default App;