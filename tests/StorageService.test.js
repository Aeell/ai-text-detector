const { StorageService } = require('../src/js/services/StorageService');

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn(key => store[key]),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn(key => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    })
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('StorageService', () => {
  let storageService;

  beforeEach(() => {
    localStorageMock.clear();
    storageService = new StorageService();
  });

  describe('User Preferences', () => {
    it('should save and retrieve user preferences', () => {
      const preferences = {
        theme: 'dark',
        language: 'es',
        fontSize: 'large',
        notifications: false,
        accessibility: {
          highContrast: true,
          reducedMotion: true
        }
      };

      const saved = storageService.saveUserPreferences(preferences);
      expect(saved).toBe(true);

      const retrieved = storageService.getUserPreferences();
      expect(retrieved).toEqual(preferences);
    });

    it('should return default preferences when none are saved', () => {
      const defaults = storageService.getDefaultPreferences();
      const preferences = storageService.getUserPreferences();
      expect(preferences).toEqual(defaults);
    });

    it('should handle invalid JSON in storage', () => {
      localStorageMock.setItem('ai_detector_preferences', 'invalid json');
      const preferences = storageService.getUserPreferences();
      expect(preferences).toEqual(storageService.getDefaultPreferences());
    });
  });

  describe('Analysis History', () => {
    it('should save and retrieve analysis history', () => {
      const analysis = {
        text: 'Sample text',
        aiProbability: 0.7,
        confidence: 0.8,
        language: 'en'
      };

      const saved = storageService.saveAnalysis(analysis);
      expect(saved).toBe(true);

      const history = storageService.getAnalysisHistory();
      expect(history).toHaveLength(1);
      expect(history[0]).toMatchObject(analysis);
      expect(history[0].timestamp).toBeDefined();
      expect(history[0].id).toBeDefined();
    });

    it('should limit history to 50 entries', () => {
      for (let i = 0; i < 60; i++) {
        storageService.saveAnalysis({ text: `Analysis ${i}` });
      }

      const history = storageService.getAnalysisHistory();
      expect(history).toHaveLength(50);
      expect(history[0].text).toBe('Analysis 59');
    });

    it('should clear analysis history', () => {
      storageService.saveAnalysis({ text: 'Sample' });
      expect(storageService.getAnalysisHistory()).toHaveLength(1);

      const cleared = storageService.clearAnalysisHistory();
      expect(cleared).toBe(true);
      expect(storageService.getAnalysisHistory()).toHaveLength(0);
    });
  });

  describe('Cache Management', () => {
    it('should set and get cache items', () => {
      const key = 'testKey';
      const value = { data: 'test data' };
      
      const saved = storageService.setCacheItem(key, value, 30);
      expect(saved).toBe(true);

      const retrieved = storageService.getCacheItem(key);
      expect(retrieved).toEqual(value);
    });

    it('should handle expired cache items', () => {
      jest.useFakeTimers();

      const key = 'testKey';
      const value = { data: 'test data' };
      
      storageService.setCacheItem(key, value, 1); // 1 minute expiration

      // Advance time by 2 minutes
      jest.advanceTimersByTime(2 * 60 * 1000);

      const retrieved = storageService.getCacheItem(key);
      expect(retrieved).toBeNull();

      jest.useRealTimers();
    });

    it('should clear all cache items', () => {
      storageService.setCacheItem('key1', 'value1');
      storageService.setCacheItem('key2', 'value2');

      const cleared = storageService.clearCache();
      expect(cleared).toBe(true);

      expect(storageService.getCacheItem('key1')).toBeNull();
      expect(storageService.getCacheItem('key2')).toBeNull();
    });
  });

  describe('Storage Usage', () => {
    it('should calculate storage usage', () => {
      storageService.saveAnalysis({ text: 'Sample analysis' });
      storageService.setCacheItem('testKey', 'test value');

      const usage = storageService.getStorageUsage();
      expect(usage).toBeDefined();
      expect(usage.total).toBeGreaterThan(0);
      expect(Object.keys(usage.items).length).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle storage errors gracefully', () => {
      // Mock localStorage to throw error
      localStorageMock.setItem.mockImplementationOnce(() => {
        throw new Error('Storage full');
      });

      const saved = storageService.saveUserPreferences({ theme: 'dark' });
      expect(saved).toBe(false);
    });

    it('should handle missing storage gracefully', () => {
      // Remove localStorage
      Object.defineProperty(window, 'localStorage', {
        value: undefined
      });

      const newStorageService = new StorageService();
      const preferences = newStorageService.getUserPreferences();
      expect(preferences).toEqual(newStorageService.getDefaultPreferences());
    });
  });
}); 