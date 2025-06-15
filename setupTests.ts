import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Define os tipos globais para os mocks
declare global {
  interface Window {
    crypto: {
      subtle: any;
      getRandomValues: (array: Uint8Array) => Uint8Array;
      randomUUID: () => string;
    };
  }
}

// Mock do crypto.randomUUID
if (!window.crypto) {
  Object.defineProperty(window, 'crypto', {
    value: {
      subtle: {},
      getRandomValues: (array: Uint8Array) => array,
      randomUUID: () => '123e4567-e89b-12d3-a456-426614174000',
    },
    configurable: true,
    writable: true,
  });
}
if (!window.crypto.randomUUID) {
  window.crypto.randomUUID = () => '123e4567-e89b-12d3-a456-426614174000';
}
if (!(global as any).crypto) {
  (global as any).crypto = window.crypto;
} else if (!(global as any).crypto.randomUUID) {
  (global as any).crypto.randomUUID = () => '123e4567-e89b-12d3-a456-426614174000';
}

// Mock do localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock do ResizeObserver
class ResizeObserverMock implements ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

window.ResizeObserver = ResizeObserverMock as any;

// Mock do IntersectionObserver
class IntersectionObserverMock implements IntersectionObserver {
  root: Element | null = null;
  rootMargin: string = '0px';
  thresholds: number[] = [0];
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

window.IntersectionObserver = IntersectionObserverMock as any;

// Mock do matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Limpar mocks após cada teste
afterEach(() => {
  vi.clearAllMocks();
  vi.resetModules();
  localStorageMock.getItem.mockReset();
  localStorageMock.setItem.mockReset();
  localStorageMock.removeItem.mockReset();
  localStorageMock.clear.mockReset();
});
