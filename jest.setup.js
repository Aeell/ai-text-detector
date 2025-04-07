// Mock browser APIs
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IndexedDB
const indexedDB = {
  open: jest.fn(),
};

Object.defineProperty(window, 'indexedDB', {
  writable: true,
  value: indexedDB,
});

// Mock service worker registration
Object.defineProperty(window.navigator, 'serviceWorker', {
  writable: true,
  value: {
    register: jest.fn().mockResolvedValue({}),
    ready: Promise.resolve({}),
  },
}); 