import { jest } from '@jest/globals';
import { SubjectService } from '../services/subjectService';
import { ValidationError, ConflictError, StorageError } from '../utils/errors';
import { StorageService } from '../services/storageService';

// Simula um banco de dados em memória para os mocks
let mockDB: any[] = [];

describe('SubjectService', () => {
  const mockSubject = {
    name: 'Cálculo I',
    location: 'CAE 108',
    days: [2, 4],
    shift: 'M' as const,
    timeSlots: [1, 2],
    professor: ''
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockDB = [];
    jest.spyOn(StorageService, 'loadData').mockImplementation(() => [...mockDB]);
    jest.spyOn(StorageService, 'saveData').mockImplementation((data) => { mockDB = [...data]; });
    jest.spyOn(StorageService, 'clearData').mockImplementation(() => { mockDB = []; });
    jest.spyOn(StorageService, 'exportData').mockImplementation(() => JSON.stringify(mockDB));
    jest.spyOn(StorageService, 'importData').mockImplementation((json) => {
      try {
        const data = JSON.parse(json);
        mockDB = Array.isArray(data) ? data : [];
        StorageService.saveData(mockDB);
      } catch {
        // não faz nada
      }
    });
    jest.spyOn(StorageService, 'restoreBackup').mockImplementation(() => {});
    jest.spyOn(StorageService, 'getAvailableBackups').mockReturnValue([]);
  });

  describe('addSubject', () => {
    it('should add a new subject successfully', () => {
      const subject = SubjectService.addSubject(mockSubject);
      expect(subject).toMatchObject({
        ...mockSubject,
        id: expect.any(String),
        code: expect.any(String),
        color: expect.any(String)
      });
      expect(StorageService.saveData).toHaveBeenCalled();
    });

    it('should throw ConflictError when there is a schedule conflict', () => {
      (StorageService.loadData as jest.Mock).mockReturnValue([mockSubject]);
      expect(() => SubjectService.addSubject(mockSubject)).toThrow(ConflictError);
    });

    it('should throw StorageError when storage fails', () => {
      (StorageService.loadData as jest.Mock).mockImplementation(() => {
        throw new Error('Storage error');
      });
      expect(() => SubjectService.addSubject(mockSubject)).toThrow(StorageError);
    });
  });

  describe('updateSubject', () => {
    const existingSubject = {
      ...mockSubject,
      id: '123',
      code: 'TEST',
      color: '#000000'
    };

    beforeEach(() => {
      (StorageService.loadData as jest.Mock).mockReturnValue([existingSubject]);
    });

    it('should update an existing subject successfully', () => {
      const updates = { name: 'Cálculo II' };
      const updated = SubjectService.updateSubject(existingSubject.id, updates);
      expect(updated.name).toBe('Cálculo II');
      expect(StorageService.saveData).toHaveBeenCalled();
    });

    it('should throw ValidationError when subject is not found', () => {
      expect(() => SubjectService.updateSubject('non-existent-id', { name: 'New Name' }))
        .toThrow(ValidationError);
    });

    it('should throw ConflictError when update creates a conflict', () => {
      const subject2 = {
        ...mockSubject,
        name: 'Cálculo II',
        days: [3, 5],
        id: '456',
        code: 'TEST2',
        color: '#000001'
      };
      (StorageService.loadData as jest.Mock).mockReturnValue([existingSubject, subject2]);

      expect(() => SubjectService.updateSubject(subject2.id, { days: [2, 4] }))
        .toThrow(ConflictError);
    });

    it('should throw StorageError when storage fails', () => {
      (StorageService.loadData as jest.Mock).mockImplementation(() => {
        throw new Error('Storage error');
      });
      expect(() => SubjectService.updateSubject(existingSubject.id, { name: 'New Name' }))
        .toThrow(StorageError);
    });
  });

  describe('deleteSubject', () => {
    const existingSubject = {
      ...mockSubject,
      id: '123',
      code: 'TEST',
      color: '#000000'
    };

    beforeEach(() => {
      (StorageService.loadData as jest.Mock).mockReturnValue([existingSubject]);
    });

    it('should delete a subject successfully', () => {
      SubjectService.deleteSubject(existingSubject.id);
      expect(StorageService.saveData).toHaveBeenCalledWith([]);
    });

    it('should throw ValidationError when subject is not found', () => {
      expect(() => SubjectService.deleteSubject('non-existent-id'))
        .toThrow(ValidationError);
    });

    it('should throw StorageError when storage fails', () => {
      (StorageService.loadData as jest.Mock).mockImplementation(() => {
        throw new Error('Storage error');
      });
      expect(() => SubjectService.deleteSubject(existingSubject.id))
        .toThrow(StorageError);
    });
  });

  describe('getSubjectConflicts', () => {
    it('should return empty array when there are no conflicts', () => {
      const conflicts = SubjectService.getSubjectConflicts(mockSubject);
      expect(conflicts).toHaveLength(0);
    });

    it('should return conflicts when they exist', () => {
      (StorageService.loadData as jest.Mock).mockReturnValue([mockSubject]);
      const conflicts = SubjectService.getSubjectConflicts(mockSubject);
      expect(conflicts).toHaveLength(4); // Two time slots for each of the two days
    });

    it('should throw StorageError when storage fails', () => {
      (StorageService.loadData as jest.Mock).mockImplementation(() => {
        throw new Error('Storage error');
      });
      expect(() => SubjectService.getSubjectConflicts(mockSubject))
        .toThrow(StorageError);
    });
  });

  describe('exportSchedule and importSchedule', () => {
    const existingSubject = {
      ...mockSubject,
      id: '123',
      code: 'TEST',
      color: '#000000'
    };

    beforeEach(() => {
      (StorageService.loadData as jest.Mock).mockReturnValue([existingSubject]);
    });

    it('should export and import schedule successfully', () => {
      const exported = SubjectService.exportSchedule();
      SubjectService.clearSchedule();
      const imported = SubjectService.importSchedule(exported);
      expect(imported).toBe(true);
      expect(StorageService.saveData).toHaveBeenCalled();
    });

    it('should return false when importing invalid data', () => {
      expect(SubjectService.importSchedule('invalid-json')).toBe(false);
    });

    it('should throw StorageError when storage fails', () => {
      jest.spyOn(StorageService, 'exportData').mockImplementation(() => { throw new Error('Storage error'); });
      expect(() => SubjectService.exportSchedule()).toThrow(StorageError);
    });
  });

  it('should add a new subject', () => {
    const subject = {
      name: 'Cálculo I',
      location: 'CAE 108',
      days: [2, 4],
      shift: 'M' as const,
      timeSlots: [1, 2],
      professor: ''
    };

    const addedSubject = SubjectService.addSubject(subject);
    expect(addedSubject).toMatchObject({
      ...subject,
      id: expect.any(String),
      code: expect.any(String),
      color: expect.any(String)
    });
  });

  it('should get all subjects', () => {
    const subject1 = {
      name: 'Cálculo I',
      location: 'CAE 108',
      days: [2, 4],
      shift: 'M' as const,
      timeSlots: [1, 2],
      professor: ''
    };

    const subject2 = {
      name: 'Física I',
      location: 'CAE 109',
      days: [3, 5],
      shift: 'M' as const,
      timeSlots: [3, 4],
      professor: ''
    };

    SubjectService.addSubject(subject1);
    SubjectService.addSubject(subject2);

    const subjects = SubjectService.loadSubjects();
    expect(subjects).toHaveLength(2);
    expect(subjects[0]).toMatchObject(subject1);
    expect(subjects[1]).toMatchObject(subject2);
  });

  it('should update a subject', () => {
    const subject = {
      name: 'Cálculo I',
      location: 'CAE 108',
      days: [2, 4],
      shift: 'M' as const,
      timeSlots: [1, 2],
      professor: ''
    };

    const addedSubject = SubjectService.addSubject(subject);
    const updatedSubject = {
      ...subject,
      name: 'Cálculo II',
      professor: 'João Silva'
    };

    SubjectService.updateSubject(addedSubject.id, updatedSubject);
    const subjects = SubjectService.loadSubjects();
    expect(subjects[0]).toMatchObject(updatedSubject);
  });

  it('should delete a subject', () => {
    const subject = {
      name: 'Cálculo I',
      location: 'CAE 108',
      days: [2, 4],
      shift: 'M' as const,
      timeSlots: [1, 2],
      professor: ''
    };

    const addedSubject = SubjectService.addSubject(subject);
    SubjectService.deleteSubject(addedSubject.id);
    const subjects = SubjectService.loadSubjects();
    expect(subjects).toHaveLength(0);
  });

  it('should detect conflicts between subjects', () => {
    const subject1 = {
      name: 'Cálculo I',
      location: 'CAE 108',
      days: [2, 4],
      shift: 'M' as const,
      timeSlots: [1, 2],
      professor: ''
    };

    const subject2 = {
      name: 'Física I',
      location: 'CAE 109',
      days: [2, 4],
      shift: 'M' as const,
      timeSlots: [1, 2],
      professor: ''
    };

    SubjectService.addSubject(subject1);
    const conflicts = SubjectService.getSubjectConflicts(subject2);
    expect(conflicts).toHaveLength(4);
  });

  it('should not detect conflicts for different shifts', () => {
    const subject1 = {
      name: 'Cálculo I',
      location: 'CAE 108',
      days: [2, 4],
      shift: 'M' as const,
      timeSlots: [1, 2],
      professor: ''
    };

    const subject2 = {
      name: 'Física I',
      location: 'CAE 109',
      days: [2, 4],
      shift: 'T' as const,
      timeSlots: [1, 2],
      professor: ''
    };

    SubjectService.addSubject(subject1);
    const conflicts = SubjectService.getSubjectConflicts(subject2);
    expect(conflicts).toHaveLength(0);
  });

  it('should not detect conflicts for different days', () => {
    const subject1 = {
      name: 'Cálculo I',
      location: 'CAE 108',
      days: [2, 4],
      shift: 'M' as const,
      timeSlots: [1, 2],
      professor: ''
    };

    const subject2 = {
      name: 'Física I',
      location: 'CAE 109',
      days: [3, 5],
      shift: 'M' as const,
      timeSlots: [1, 2],
      professor: ''
    };

    SubjectService.addSubject(subject1);
    const conflicts = SubjectService.getSubjectConflicts(subject2);
    expect(conflicts).toHaveLength(0);
  });

  it('should not detect conflicts for different time slots', () => {
    const subject1 = {
      name: 'Cálculo I',
      location: 'CAE 108',
      days: [2, 4],
      shift: 'M' as const,
      timeSlots: [1, 2],
      professor: ''
    };

    const subject2 = {
      name: 'Física I',
      location: 'CAE 109',
      days: [2, 4],
      shift: 'M' as const,
      timeSlots: [3, 4],
      professor: ''
    };

    SubjectService.addSubject(subject1);
    const conflicts = SubjectService.getSubjectConflicts(subject2);
    expect(conflicts).toHaveLength(0);
  });
}); 