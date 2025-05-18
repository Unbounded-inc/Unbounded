import '@testing-library/jest-dom';
import { vi } from 'vitest';

global.fetch = vi.fn();

// Full mock for localStorage to satisfy the Storage interface
Object.defineProperty(global, 'localStorage', {
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
    key: vi.fn(),
    length: 0,
  },
  writable: true,
});