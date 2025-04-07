/**
 * Setup file for Jest tests
 * 
 * This file is run before each test file to set up the test environment.
 * It configures testing libraries and provides global utilities for tests.
 */

// Import testing libraries
require('@testing-library/jest-dom');

// Mock browser APIs that might not be available in the test environment
if (typeof window !== 'undefined') {
  // Mock localStorage
  if (!window.localStorage) {
    window.localStorage = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn()
    };
  }

  // Mock sessionStorage
  if (!window.sessionStorage) {
    window.sessionStorage = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn()
    };
  }

  // Mock performance API
  if (!window.performance) {
    window.performance = {
      now: jest.fn(() => Date.now()),
      mark: jest.fn(),
      measure: jest.fn(),
      getEntriesByType: jest.fn(() => []),
      getEntriesByName: jest.fn(() => [])
    };
  }

  // Mock fetch API if not available
  if (!window.fetch) {
    window.fetch = jest.fn(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
        text: () => Promise.resolve(''),
        blob: () => Promise.resolve(new Blob())
      })
    );
  }

  // Mock IntersectionObserver
  if (!window.IntersectionObserver) {
    window.IntersectionObserver = jest.fn().mockImplementation(() => ({
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: jest.fn()
    }));
  }

  // Mock MutationObserver
  if (!window.MutationObserver) {
    window.MutationObserver = jest.fn().mockImplementation(() => ({
      observe: jest.fn(),
      disconnect: jest.fn(),
      takeRecords: jest.fn()
    }));
  }

  // Mock ResizeObserver
  if (!window.ResizeObserver) {
    window.ResizeObserver = jest.fn().mockImplementation(() => ({
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: jest.fn()
    }));
  }
}

// Mock Node.js environment variables
process.env.NODE_ENV = 'test';

// Global test utilities
global.sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Custom Jest matchers
expect.extend({
  toBeWithinRange(received, floor, ceiling) {
    const pass = received >= floor && received <= ceiling;
    if (pass) {
      return {
        message: () => `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false,
      };
    }
  },
});

// Mock style and file imports
jest.mock('../__mocks__/styleMock.js', () => ({}), { virtual: true });
jest.mock('../__mocks__/fileMock.js', () => 'test-file-stub', { virtual: true });

// Console warnings suppression for cleaner test output
const originalConsoleWarn = console.warn;
console.warn = (...args) => {
  // Filter out specific warnings that clutter test output
  const suppressPatterns = [
    'ReactDOM.render is no longer supported',
    'forwardRef render functions do not support propTypes',
    'Warning: componentWill'
  ];
  
  if (!suppressPatterns.some(pattern => 
    args.some(arg => typeof arg === 'string' && arg.includes(pattern))
  )) {
    originalConsoleWarn(...args);
  }
}; 