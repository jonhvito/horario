import '@testing-library/jest-dom';
import { STORAGE_KEY, BACKUP_KEY } from '../src/services/storageService';

// Mock localStorage for tests
const localStorageMock = {
  storage: {},
  length: 0,
  key: jest.fn().mockImplementation((index: number) => {
    return Object.keys(localStorageMock.storage)[index] || null;
  }),
  getItem: jest.fn().mockImplementation((key: string) => {
    return localStorageMock.storage[key] || null;
  }),
  setItem: jest.fn().mockImplementation((key: string, value: string) => {
    localStorageMock.storage[key] = value;
    localStorageMock.length = Object.keys(localStorageMock.storage).length;
    return null;
  }),
  removeItem: jest.fn().mockImplementation((key: string) => {
    delete localStorageMock.storage[key];
    localStorageMock.length = Object.keys(localStorageMock.storage).length;
    return null;
  }),
  clear: jest.fn().mockImplementation(() => {
    localStorageMock.storage = {};
    localStorageMock.length = 0;
    return undefined;
  }),
} as Storage;

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// Mock sessionStorage for tests
Object.defineProperty(window, 'sessionStorage', {
  value: {
    getItem: jest.fn().mockReturnValue(null),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  },
  writable: true,
});

// Mock crypto for tests
Object.defineProperty(window, 'crypto', {
  value: {
    randomUUID: () => 'mocked-uuid',
    getRandomValues: (array) => {
      for (let i = 0; i < array.length; i++) {
        array[i] = Math.floor(Math.random() * 256);
      }
      return array;
    },
  },
  writable: true,
});
