const Debug = require('../utils/Debug');

class StorageService {
  constructor() {
    this.debug = new Debug('StorageService');
    this.storage = localStorage;
    this.prefix = 'ai_detector_';
  }

  // User preferences
  saveUserPreferences(preferences) {
    try {
      const key = this.prefix + 'preferences';
      this.storage.setItem(key, JSON.stringify(preferences));
      this.debug.log('User preferences saved successfully');
      return true;
    } catch (error) {
      this.debug.error('Failed to save user preferences:', error);
      return false;
    }
  }

  getUserPreferences() {
    try {
      const key = this.prefix + 'preferences';
      const data = this.storage.getItem(key);
      return data ? JSON.parse(data) : this.getDefaultPreferences();
    } catch (error) {
      this.debug.error('Failed to get user preferences:', error);
      return this.getDefaultPreferences();
    }
  }

  getDefaultPreferences() {
    return {
      theme: 'light',
      language: 'en',
      fontSize: 'medium',
      notifications: true,
      accessibility: {
        highContrast: false,
        reducedMotion: false
      }
    };
  }

  // Analysis history
  saveAnalysis(analysis) {
    try {
      const key = this.prefix + 'history';
      const history = this.getAnalysisHistory();
      
      // Add timestamp and unique ID
      analysis.timestamp = Date.now();
      analysis.id = this.generateUniqueId();
      
      // Add to beginning of array and limit to 50 entries
      history.unshift(analysis);
      if (history.length > 50) history.pop();
      
      this.storage.setItem(key, JSON.stringify(history));
      this.debug.log('Analysis saved to history');
      return true;
    } catch (error) {
      this.debug.error('Failed to save analysis:', error);
      return false;
    }
  }

  getAnalysisHistory() {
    try {
      const key = this.prefix + 'history';
      const data = this.storage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      this.debug.error('Failed to get analysis history:', error);
      return [];
    }
  }

  clearAnalysisHistory() {
    try {
      const key = this.prefix + 'history';
      this.storage.removeItem(key);
      this.debug.log('Analysis history cleared');
      return true;
    } catch (error) {
      this.debug.error('Failed to clear analysis history:', error);
      return false;
    }
  }

  // Cache management
  setCacheItem(key, value, expirationMinutes = 60) {
    try {
      const cacheKey = this.prefix + 'cache_' + key;
      const cacheData = {
        value: value,
        timestamp: Date.now(),
        expirationMinutes: expirationMinutes
      };
      
      this.storage.setItem(cacheKey, JSON.stringify(cacheData));
      this.debug.log(`Cache item set: ${key}`);
      return true;
    } catch (error) {
      this.debug.error('Failed to set cache item:', error);
      return false;
    }
  }

  getCacheItem(key) {
    try {
      const cacheKey = this.prefix + 'cache_' + key;
      const data = this.storage.getItem(cacheKey);
      
      if (!data) return null;
      
      const cacheData = JSON.parse(data);
      const now = Date.now();
      const expirationTime = cacheData.timestamp + (cacheData.expirationMinutes * 60 * 1000);
      
      if (now > expirationTime) {
        this.storage.removeItem(cacheKey);
        return null;
      }
      
      return cacheData.value;
    } catch (error) {
      this.debug.error('Failed to get cache item:', error);
      return null;
    }
  }

  clearCache() {
    try {
      const cachePrefix = this.prefix + 'cache_';
      Object.keys(this.storage)
        .filter(key => key.startsWith(cachePrefix))
        .forEach(key => this.storage.removeItem(key));
      
      this.debug.log('Cache cleared');
      return true;
    } catch (error) {
      this.debug.error('Failed to clear cache:', error);
      return false;
    }
  }

  // Utility methods
  generateUniqueId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  clearAll() {
    try {
      Object.keys(this.storage)
        .filter(key => key.startsWith(this.prefix))
        .forEach(key => this.storage.removeItem(key));
      
      this.debug.log('All storage cleared');
      return true;
    } catch (error) {
      this.debug.error('Failed to clear all storage:', error);
      return false;
    }
  }

  getStorageUsage() {
    try {
      let usage = {
        total: 0,
        items: {}
      };

      Object.keys(this.storage)
        .filter(key => key.startsWith(this.prefix))
        .forEach(key => {
          const size = this.storage.getItem(key).length * 2; // Approximate size in bytes
          usage.total += size;
          usage.items[key] = size;
        });

      return usage;
    } catch (error) {
      this.debug.error('Failed to get storage usage:', error);
      return null;
    }
  }
}

module.exports = { StorageService }; 