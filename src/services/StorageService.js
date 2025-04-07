// StorageService.js - Data persistence and user preferences management
import { Debug } from '../utils/Debug';

export class StorageService {
  constructor() {
    this.debug = Debug;
    this.storagePrefix = 'ai_text_detector_';
    this.initialize();
  }

  initialize() {
    try {
      this.checkStorageAvailability();
      this.debug.logger.info('StorageService initialized successfully');
    } catch (error) {
      this.debug.logger.error('Error initializing StorageService:', error);
      throw error;
    }
  }

  checkStorageAvailability() {
    try {
      const testKey = `${this.storagePrefix}test`;
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch (error) {
      this.debug.logger.error('Local storage is not available:', error);
      throw new Error('Local storage is not available');
    }
  }

  getItem(key) {
    try {
      const fullKey = `${this.storagePrefix}${key}`;
      const item = localStorage.getItem(fullKey);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      this.debug.logger.error(`Error getting item ${key}:`, error);
      return null;
    }
  }

  setItem(key, value) {
    try {
      const fullKey = `${this.storagePrefix}${key}`;
      localStorage.setItem(fullKey, JSON.stringify(value));
      this.debug.logger.debug(`Item ${key} saved successfully`);
    } catch (error) {
      this.debug.logger.error(`Error setting item ${key}:`, error);
      throw error;
    }
  }

  removeItem(key) {
    try {
      const fullKey = `${this.storagePrefix}${key}`;
      localStorage.removeItem(fullKey);
      this.debug.logger.debug(`Item ${key} removed successfully`);
    } catch (error) {
      this.debug.logger.error(`Error removing item ${key}:`, error);
      throw error;
    }
  }

  clear() {
    try {
      // Only clear items with our prefix
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.storagePrefix)) {
          localStorage.removeItem(key);
        }
      });
      this.debug.logger.info('Storage cleared successfully');
    } catch (error) {
      this.debug.logger.error('Error clearing storage:', error);
      throw error;
    }
  }

  async getUserPreferences() {
    try {
      const preferences = this.getItem('preferences');
      if (!preferences) {
        // Set default preferences
        const defaultPreferences = {
          theme: 'light',
          language: 'ENG',
          fontSize: '16px',
          accessibility: {
            highContrast: false,
            reducedMotion: false,
            textToSpeech: false
          }
        };
        await this.setUserPreferences(defaultPreferences);
        return defaultPreferences;
      }
      return preferences;
    } catch (error) {
      this.debug.logger.error('Error getting user preferences:', error);
      throw error;
    }
  }

  async setUserPreferences(preferences) {
    try {
      await this.setItem('preferences', preferences);
      this.debug.logger.info('User preferences updated successfully');
    } catch (error) {
      this.debug.logger.error('Error setting user preferences:', error);
      throw error;
    }
  }

  async saveText(text) {
    try {
      const timestamp = new Date().toISOString();
      const savedTexts = this.getItem('saved_texts') || [];
      
      savedTexts.unshift({
        id: this.generateId(),
        text,
        timestamp
      });

      // Keep only last 10 saved texts
      if (savedTexts.length > 10) {
        savedTexts.pop();
      }

      await this.setItem('saved_texts', savedTexts);
      this.debug.logger.debug('Text saved successfully');
    } catch (error) {
      this.debug.logger.error('Error saving text:', error);
      throw error;
    }
  }

  async getSavedTexts() {
    try {
      return this.getItem('saved_texts') || [];
    } catch (error) {
      this.debug.logger.error('Error getting saved texts:', error);
      throw error;
    }
  }

  async saveAnalysisResult(result) {
    try {
      const timestamp = new Date().toISOString();
      const savedResults = this.getItem('analysis_results') || [];
      
      savedResults.unshift({
        id: this.generateId(),
        ...result,
        timestamp
      });

      // Keep only last 20 results
      if (savedResults.length > 20) {
        savedResults.pop();
      }

      await this.setItem('analysis_results', savedResults);
      this.debug.logger.debug('Analysis result saved successfully');
    } catch (error) {
      this.debug.logger.error('Error saving analysis result:', error);
      throw error;
    }
  }

  async getAnalysisResults() {
    try {
      return this.getItem('analysis_results') || [];
    } catch (error) {
      this.debug.logger.error('Error getting analysis results:', error);
      throw error;
    }
  }

  generateId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  async exportData() {
    try {
      const data = {
        preferences: await this.getUserPreferences(),
        savedTexts: await this.getSavedTexts(),
        analysisResults: await this.getAnalysisResults(),
        timestamp: new Date().toISOString()
      };

      return JSON.stringify(data, null, 2);
    } catch (error) {
      this.debug.logger.error('Error exporting data:', error);
      throw error;
    }
  }

  async importData(jsonData) {
    try {
      const data = JSON.parse(jsonData);
      
      // Validate data structure
      if (!this.validateImportData(data)) {
        throw new Error('Invalid import data structure');
      }

      // Import each data type
      if (data.preferences) {
        await this.setUserPreferences(data.preferences);
      }
      if (data.savedTexts) {
        await this.setItem('saved_texts', data.savedTexts);
      }
      if (data.analysisResults) {
        await this.setItem('analysis_results', data.analysisResults);
      }

      this.debug.logger.info('Data imported successfully');
    } catch (error) {
      this.debug.logger.error('Error importing data:', error);
      throw error;
    }
  }

  validateImportData(data) {
    // Basic structure validation
    if (typeof data !== 'object') return false;
    
    // Check required properties
    const requiredProps = ['preferences', 'savedTexts', 'analysisResults', 'timestamp'];
    return requiredProps.every(prop => prop in data);
  }

  getStorageUsage() {
    try {
      let totalSize = 0;
      const keys = Object.keys(localStorage);
      
      keys.forEach(key => {
        if (key.startsWith(this.storagePrefix)) {
          totalSize += localStorage.getItem(key).length * 2; // UTF-16 characters = 2 bytes
        }
      });

      return {
        used: totalSize,
        total: 5 * 1024 * 1024, // 5MB typical localStorage limit
        percentage: (totalSize / (5 * 1024 * 1024)) * 100
      };
    } catch (error) {
      this.debug.logger.error('Error calculating storage usage:', error);
      throw error;
    }
  }
} 