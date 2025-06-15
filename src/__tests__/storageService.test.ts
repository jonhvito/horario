import { jest } from '@jest/globals';
import { StorageService } from '../services/storageService';
import { Subject } from '../types/schedule';
import { ValidationError, StorageError } from '../utils/errors';
import { STORAGE_KEY, BACKUP_KEY } from '../services/storageService';

describe('StorageService', () => {
  const mockSubject: Subject = {
    id: 'abc123-def', // ✅ ID válido conforme nova regra
    name: 'Math',
    code: 'MAT123',
    location: 'Room 101',
    color: '#ef4444',
    days: [1, 3],
    shift: 'M',
    timeSlots: [1, 2],
    professor: 'John Doe',
  };

  const mockData = {
    subjects: [mockSubject],
    schedule: {
      Monday: [1, 2],
      Tuesday: [3, 4],
      Wednesday: [1, 2],
      Thursday: [3, 4],
    },
  };

  let originalStorage: Storage;

  function mockLocalStorage(overrides = {}) {
    const defaultMock = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    };
    Object.defineProperty(window, 'localStorage', {
      value: { ...defaultMock, ...overrides },
      writable: true,
    });
  }

  beforeEach(() => {
    jest.clearAllMocks();
    originalStorage = localStorage;
  });

  afterEach(() => {
    Object.defineProperty(window, 'localStorage', {
      value: originalStorage,
      writable: true,
    });
  });

  describe('saveData', () => {
    it('should save data to localStorage', () => {
      const setItem = jest.fn();
      mockLocalStorage({ setItem });

      StorageService.saveData([mockSubject]);
      expect(setItem).toHaveBeenCalledWith(STORAGE_KEY, JSON.stringify([mockSubject]));
    });

    it('should handle empty data', () => {
      const setItem = jest.fn();
      mockLocalStorage({ setItem });

      StorageService.saveData([]);
      expect(setItem).toHaveBeenCalledWith(STORAGE_KEY, JSON.stringify([]));
    });

    it('throws ValidationError for invalid data', () => {
      const invalidSubject = { ...mockSubject, id: '!!!' };
      expect(() => StorageService.saveData([invalidSubject as unknown as Subject])).toThrow(
        ValidationError
      );
    });

    it('throws StorageError when localStorage.setItem fails', () => {
      mockLocalStorage({
        setItem: () => {
          throw new Error('Storage error');
        },
      });
      expect(() => StorageService.saveData([mockSubject])).toThrow(StorageError);
    });
  });

  describe('loadData', () => {
    it('should load data from localStorage', () => {
      mockLocalStorage({
        getItem: (key: string) => (key === STORAGE_KEY ? JSON.stringify([mockSubject]) : null),
      });

      const result = StorageService.loadData();
      expect(result).toEqual([mockSubject]);
    });

    it('returns empty array when no data exists', () => {
      mockLocalStorage({
        getItem: jest.fn().mockReturnValue(null),
      });

      const result = StorageService.loadData();
      expect(result).toEqual([]);
    });

    it('throws ValidationError for invalid JSON', () => {
      mockLocalStorage({
        getItem: jest.fn().mockReturnValue('invalid json'),
      });

      expect(() => StorageService.loadData()).toThrow(ValidationError);
    });

    it('throws StorageError when localStorage.getItem fails', () => {
      mockLocalStorage({
        getItem: () => {
          throw new Error('Storage error');
        },
      });

      expect(() => StorageService.loadData()).toThrow(StorageError);
    });
  });

  describe('clearData', () => {
    it('should clear localStorage', () => {
      const removeItem = jest.fn();
      mockLocalStorage({ removeItem });

      StorageService.clearData();

      expect(removeItem).toHaveBeenCalledWith(STORAGE_KEY);
      expect(removeItem).toHaveBeenCalledWith(BACKUP_KEY);
    });

    it('throws StorageError when localStorage.removeItem fails', () => {
      mockLocalStorage({
        removeItem: () => {
          throw new Error('Storage error');
        },
      });

      expect(() => StorageService.clearData()).toThrow(StorageError);
    });
  });

  describe('exportData', () => {
    it('exports data successfully', () => {
      mockLocalStorage({
        getItem: jest.fn().mockReturnValue(JSON.stringify([mockSubject])),
      });

      const exported = StorageService.exportData();
      expect(exported).toBe(JSON.stringify([mockSubject]));
    });

    it('throws StorageError on getItem failure', () => {
      mockLocalStorage({
        getItem: () => {
          throw new Error('Storage error');
        },
      });

      expect(() => StorageService.exportData()).toThrow(StorageError);
    });
  });

  describe('importData', () => {
    it('imports data successfully', () => {
      const setItem = jest.fn();
      mockLocalStorage({ setItem });

      const jsonData = JSON.stringify([mockSubject]);
      StorageService.importData(jsonData);
      expect(setItem).toHaveBeenCalledWith(STORAGE_KEY, jsonData);
    });

    it('throws ValidationError for invalid data', () => {
      mockLocalStorage();
      expect(() => StorageService.importData('invalid-json')).toThrow(ValidationError);
    });

    it('throws ValidationError when data is structurally invalid', () => {
      const invalid = [{ ...mockSubject, id: '!!!' }];
      mockLocalStorage();
      expect(() => StorageService.importData(JSON.stringify(invalid))).toThrow(ValidationError);
    });
  });

  describe('restoreBackup', () => {
    it('restores backup successfully', () => {
      const backup = {
        timestamp: Date.now(),
        data: btoa(JSON.stringify([mockSubject])),
      };
      const setItem = jest.fn();
      mockLocalStorage({
        getItem: () => JSON.stringify([backup]),
        setItem,
      });

      StorageService.restoreBackup(backup.timestamp);
      expect(setItem).toHaveBeenCalledWith(STORAGE_KEY, JSON.stringify([mockSubject]));
    });

    it('throws ValidationError when backup not found', () => {
      mockLocalStorage({
        getItem: () => JSON.stringify([]),
      });

      expect(() => StorageService.restoreBackup(123)).toThrow(ValidationError);
    });

    it('throws ValidationError for corrupted backup data', () => {
      const backup = {
        timestamp: Date.now(),
        data: 'invalid-base64',
      };
      mockLocalStorage({
        getItem: () => JSON.stringify([backup]),
      });

      expect(() => StorageService.restoreBackup(backup.timestamp)).toThrow(ValidationError);
    });

    it('throws StorageError when getItem fails', () => {
      mockLocalStorage({
        getItem: () => {
          throw new Error('Storage error');
        },
      });

      expect(() => StorageService.restoreBackup(123)).toThrow(StorageError);
    });
  });

  describe('getAvailableBackups', () => {
    it('returns available backups', () => {
      const backup = {
        timestamp: Date.now(),
        data: btoa(JSON.stringify([mockSubject])),
      };
      mockLocalStorage({
        getItem: () => JSON.stringify([backup]),
      });

      const backups = StorageService.getAvailableBackups();
      expect(backups).toHaveLength(1);
      expect(backups[0]).toHaveProperty('timestamp', backup.timestamp);
      expect(backups[0]).toHaveProperty('date');
    });

    it('returns empty array when no backups exist', () => {
      mockLocalStorage({
        getItem: () => null,
      });

      const backups = StorageService.getAvailableBackups();
      expect(backups).toEqual([]);
    });

    it('returns empty array when getItem fails', () => {
      mockLocalStorage({
        getItem: () => {
          throw new Error('Storage error');
        },
      });

      const backups = StorageService.getAvailableBackups();
      expect(backups).toEqual([]);
    });
  });
});
