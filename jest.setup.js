const { TextEncoder, TextDecoder } = require('util');

// Mock do DOMException
class DOMException extends Error {
  constructor(message, name) {
    super(message);
    this.name = name;
  }
}

// Mock do localStorage
class LocalStorageMock {
  constructor() {
    this.store = new Map();
  }

  clear() {
    this.store.clear();
  }

  getItem(key) {
    return this.store.get(key) || null;
  }

  setItem(key, value) {
    this.store.set(key, value);
  }

  removeItem(key) {
    this.store.delete(key);
  }
}

// Mock do crypto
const crypto = {
  randomUUID: () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
};

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
global.DOMException = DOMException;
global.localStorage = new LocalStorageMock();
global.crypto = crypto; 