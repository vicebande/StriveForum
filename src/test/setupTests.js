import { jest } from '@jest/globals';
import '@testing-library/jest-dom';

const createMockStorage = () => {
  const storage = {};
  return {
    getItem: jest.fn(key => storage[key] ?? null),
    setItem: jest.fn((key, value) => {
      storage[key] = value;
    }),
    removeItem: jest.fn(key => {
      delete storage[key];
    }),
    clear: jest.fn(() => {
      Object.keys(storage).forEach(key => {
        delete storage[key];
      });
    }),
    length: jest.fn(() => Object.keys(storage).length),
    key: jest.fn(index => Object.keys(storage)[index]),
    storage
  };
};

global.localStorage = createMockStorage();
global.window.localStorage = global.localStorage;

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
});
