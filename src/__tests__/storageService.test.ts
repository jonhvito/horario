import { jest } from '@jest/globals';
import { StorageService } from '../services/storageService';
import { ValidationError, StorageError } from '../utils/errors';
import { Subject } from '../types/schedule';

describe('StorageService', () => {
  const mockSubject: Subject = {
    id: '123',
    name: 'Cálculo I',
    code: '24M12',
    location: 'CAE 108',
    days: [2, 4],
    shift: 'M',
    timeSlots: [1, 2],
    professor: '',
    color: '#ef4444'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('saveData', () => {
    it('saves data successfully', () => {
      StorageService.saveData([mockSubject]);
      expect(localStorage.setItem).toHaveBeenCalledWith('schedule_data', JSON.stringify([mockSubject]));
    });

    it('throws ValidationError for invalid data', () => {
      expect(() => StorageService.saveData([{ ...mockSubject, id: undefined } as any])).toThrow(ValidationError);
    });

    it('throws StorageError when localStorage is not available', () => {
      localStorage.setItem.mockImplementation(() => {
        throw new Error('Storage error');
      });
      expect(() => StorageService.saveData([mockSubject])).toThrow(StorageError);
    });
  });

  describe('loadData', () => {
    it('loads data successfully', () => {
      localStorage.getItem.mockReturnValue(JSON.stringify([mockSubject]));
      const loadedData = StorageService.loadData();
      expect(loadedData).toEqual([mockSubject]);
      expect(localStorage.getItem).toHaveBeenCalledWith('schedule_data');
    });

    it('returns empty array when no data exists', () => {
      localStorage.getItem.mockReturnValue(null);
      const loadedData = StorageService.loadData();
      expect(loadedData).toEqual([]);
    });

    it('throws ValidationError for corrupted data', () => {
      localStorage.getItem.mockReturnValue('invalid-json');
      expect(() => StorageService.loadData()).toThrow(ValidationError);
    });

    it('throws StorageError when localStorage is not available', () => {
      localStorage.getItem.mockImplementation(() => {
        throw new Error('Storage error');
      });
      expect(() => StorageService.loadData()).toThrow(StorageError);
    });
  });

  describe('clearData', () => {
    it('clears data successfully', () => {
      StorageService.clearData();
      expect(localStorage.removeItem).toHaveBeenCalledWith('schedule_data');
      expect(localStorage.removeItem).toHaveBeenCalledWith('schedule_backup');
    });

    it('throws StorageError when localStorage is not available', () => {
      localStorage.removeItem.mockImplementation(() => {
        throw new Error('Storage error');
      });
      expect(() => StorageService.clearData()).toThrow(StorageError);
    });
  });

  describe('exportData', () => {
    it('exports data successfully', () => {
      localStorage.getItem.mockReturnValue(JSON.stringify([mockSubject]));
      const exported = StorageService.exportData();
      expect(exported).toBe(JSON.stringify([mockSubject]));
    });

    it('throws StorageError when localStorage is not available', () => {
      localStorage.getItem.mockImplementation(() => {
        throw new Error('Storage error');
      });
      expect(() => StorageService.exportData()).toThrow(StorageError);
    });
  });

  describe('importData', () => {
    it('imports data successfully', () => {
      const jsonData = JSON.stringify([mockSubject]);
      StorageService.importData(jsonData);
      expect(localStorage.setItem).toHaveBeenCalledWith('schedule_data', jsonData);
    });

    it('throws ValidationError for invalid data', () => {
      expect(() => StorageService.importData('invalid-json')).toThrow(ValidationError);
    });

    it('throws StorageError when localStorage is not available', () => {
      localStorage.setItem.mockImplementation(() => {
        throw new Error('Storage error');
      });
      expect(() => StorageService.importData(JSON.stringify([mockSubject]))).toThrow(StorageError);
    });
  });

  describe('restoreBackup', () => {
    it('restores backup successfully', () => {
      const backup = {
        timestamp: Date.now(),
        data: btoa(JSON.stringify([mockSubject]))
      };
      localStorage.getItem.mockReturnValue(JSON.stringify([backup]));
      StorageService.restoreBackup(backup.timestamp);
      expect(localStorage.setItem).toHaveBeenCalledWith('schedule_data', JSON.stringify([mockSubject]));
    });

    it('throws ValidationError when backup is not found', () => {
      localStorage.getItem.mockReturnValue(JSON.stringify([]));
      expect(() => StorageService.restoreBackup(123)).toThrow(ValidationError);
    });

    it('throws ValidationError for corrupted backup data', () => {
      const backup = {
        timestamp: Date.now(),
        data: 'invalid-base64'
      };
      localStorage.getItem.mockReturnValue(JSON.stringify([backup]));
      expect(() => StorageService.restoreBackup(backup.timestamp)).toThrow(ValidationError);
    });

    it('throws StorageError when localStorage is not available', () => {
      localStorage.getItem.mockImplementation(() => {
        throw new Error('Storage error');
      });
      expect(() => StorageService.restoreBackup(123)).toThrow(StorageError);
    });
  });

  describe('getAvailableBackups', () => {
    it('returns available backups', () => {
      const backup = {
        timestamp: Date.now(),
        data: btoa(JSON.stringify([mockSubject]))
      };
      localStorage.getItem.mockReturnValue(JSON.stringify([backup]));
      const backups = StorageService.getAvailableBackups();
      expect(backups).toHaveLength(1);
      expect(backups[0]).toHaveProperty('timestamp', backup.timestamp);
      expect(backups[0]).toHaveProperty('date');
    });

    it('returns empty array when no backups exist', () => {
      localStorage.getItem.mockReturnValue(null);
      const backups = StorageService.getAvailableBackups();
      expect(backups).toEqual([]);
    });

    it('returns empty array when localStorage is not available', () => {
      localStorage.getItem.mockImplementation(() => {
        throw new Error('Storage error');
      });
      const backups = StorageService.getAvailableBackups();
      expect(backups).toEqual([]);
    });
  });
}); 