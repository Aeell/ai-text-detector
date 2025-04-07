// app.js - Main application entry point
import { AIDetector } from './AIDetector';
import { UIController } from './UIController';
import { LanguageManager } from './LanguageManager';
import { TextModel } from '../models/TextModel';
import { LanguageModel } from '../models/LanguageModel';
import { StorageService } from '../services/StorageService';
import { AnalyticsService } from '../services/AnalyticsService';
import { Debug } from '../utils/Debug';

class App {
  constructor() {
    this.debug = Debug;
    this.initialize();
  }

  async initialize() {
    try {
      // Initialize services
      this.storage = new StorageService();
      this.analytics = new AnalyticsService();
      this.languageManager = new LanguageManager();

      // Initialize models
      this.textModel = new TextModel();
      this.languageModel = new LanguageModel();

      // Initialize core modules
      this.aiDetector = new AIDetector(this.textModel, this.languageModel);
      this.uiController = new UIController();

      // Load user preferences
      await this.loadUserPreferences();

      // Setup event listeners
      this.setupEventListeners();

      // Track initialization
      this.analytics.trackEvent('app', 'initialize', 'success');
      this.debug.logger.info('Application initialized successfully');
    } catch (error) {
      this.debug.logger.error('Error initializing application:', error);
      this.handleError(error);
    }
  }

  async loadUserPreferences() {
    try {
      const preferences = await this.storage.getUserPreferences();
      
      // Apply theme
      document.documentElement.dataset.theme = preferences.theme;
      
      // Apply language
      await this.languageManager.setLanguage(preferences.language);
      
      // Apply accessibility settings
      this.applyAccessibilitySettings(preferences.accessibility);
      
      this.debug.logger.info('User preferences loaded successfully');
    } catch (error) {
      this.debug.logger.error('Error loading user preferences:', error);
      // Continue with defaults
    }
  }

  applyAccessibilitySettings(settings) {
    try {
      const { highContrast, fontSize, reducedMotion, textToSpeech } = settings;
      
      // Apply high contrast
      document.documentElement.classList.toggle('high-contrast', highContrast);
      
      // Apply font size
      document.documentElement.style.fontSize = fontSize;
      
      // Apply reduced motion
      document.documentElement.classList.toggle('reduced-motion', reducedMotion);
      
      // Setup text-to-speech if enabled
      if (textToSpeech) {
        this.setupTextToSpeech();
      }
      
      this.debug.logger.info('Accessibility settings applied successfully');
    } catch (error) {
      this.debug.logger.error('Error applying accessibility settings:', error);
    }
  }

  setupTextToSpeech() {
    try {
      if ('speechSynthesis' in window) {
        this.speechSynthesis = window.speechSynthesis;
        this.debug.logger.info('Text-to-speech initialized successfully');
      } else {
        throw new Error('Text-to-speech not supported');
      }
    } catch (error) {
      this.debug.logger.error('Error setting up text-to-speech:', error);
    }
  }

  setupEventListeners() {
    try {
      // Handle text analysis
      document.getElementById('analyzeBtn')?.addEventListener('click', () => {
        this.handleAnalysis();
      });

      // Handle text comparison
      document.getElementById('compareBtn')?.addEventListener('click', () => {
        this.handleComparison();
      });

      // Handle settings changes
      document.getElementById('settingsForm')?.addEventListener('change', (event) => {
        this.handleSettingsChange(event);
      });

      // Handle theme toggle
      document.getElementById('themeToggle')?.addEventListener('click', () => {
        this.handleThemeToggle();
      });

      // Handle language change
      document.getElementById('langSelect')?.addEventListener('change', (event) => {
        this.handleLanguageChange(event);
      });

      // Handle keyboard shortcuts
      document.addEventListener('keydown', (event) => {
        this.handleKeyboardShortcut(event);
      });

      this.debug.logger.info('Event listeners setup successfully');
    } catch (error) {
      this.debug.logger.error('Error setting up event listeners:', error);
    }
  }

  async handleAnalysis() {
    try {
      const text = document.getElementById('inputText')?.value;
      if (!text) {
        throw new Error('No text provided');
      }

      // Start performance tracking
      this.analytics.startPerformanceMark('analysis');

      // Show loading state
      this.uiController.showLoading();

      // Perform analysis
      const result = await this.aiDetector.analyzeText(text);

      // Update UI with results
      this.uiController.displayResults(result);

      // Track analysis
      this.analytics.trackAnalysis(result);

      // Save analysis result
      await this.storage.saveAnalysisResult(result);

      // End performance tracking
      this.analytics.endPerformanceMark('analysis');

      this.debug.logger.info('Text analysis completed successfully');
    } catch (error) {
      this.debug.logger.error('Error analyzing text:', error);
      this.handleError(error);
    } finally {
      this.uiController.hideLoading();
    }
  }

  async handleComparison() {
    try {
      const text1 = document.getElementById('text1')?.value;
      const text2 = document.getElementById('text2')?.value;

      if (!text1 || !text2) {
        throw new Error('Both texts are required for comparison');
      }

      // Start performance tracking
      this.analytics.startPerformanceMark('comparison');

      // Show loading state
      this.uiController.showLoading();

      // Perform comparison
      const result = await this.aiDetector.compareTexts(text1, text2);

      // Update UI with results
      this.uiController.displayComparisonResults(result);

      // Track comparison
      this.analytics.trackEvent('comparison', 'complete', null, result.similarity);

      // End performance tracking
      this.analytics.endPerformanceMark('comparison');

      this.debug.logger.info('Text comparison completed successfully');
    } catch (error) {
      this.debug.logger.error('Error comparing texts:', error);
      this.handleError(error);
    } finally {
      this.uiController.hideLoading();
    }
  }

  async handleSettingsChange(event) {
    try {
      const { name, value, type, checked } = event.target;
      const preferences = await this.storage.getUserPreferences();

      // Update preference value
      if (type === 'checkbox') {
        preferences.accessibility[name] = checked;
      } else {
        preferences[name] = value;
      }

      // Save updated preferences
      await this.storage.setUserPreferences(preferences);

      // Apply changes
      if (name === 'theme') {
        document.documentElement.dataset.theme = value;
      } else if (name in preferences.accessibility) {
        this.applyAccessibilitySettings(preferences.accessibility);
      }

      // Track settings change
      this.analytics.trackEvent('settings', 'change', name, value);

      this.debug.logger.info(`Setting "${name}" updated successfully`);
    } catch (error) {
      this.debug.logger.error('Error updating settings:', error);
      this.handleError(error);
    }
  }

  handleThemeToggle() {
    try {
      const currentTheme = document.documentElement.dataset.theme;
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

      // Update theme
      document.documentElement.dataset.theme = newTheme;

      // Save preference
      this.storage.setUserPreferences({
        ...this.storage.getUserPreferences(),
        theme: newTheme
      });

      // Track theme change
      this.analytics.trackEvent('theme', 'change', newTheme);

      this.debug.logger.info(`Theme changed to ${newTheme}`);
    } catch (error) {
      this.debug.logger.error('Error toggling theme:', error);
      this.handleError(error);
    }
  }

  async handleLanguageChange(event) {
    try {
      const language = event.target.value;

      // Update language
      await this.languageManager.setLanguage(language);

      // Save preference
      await this.storage.setUserPreferences({
        ...await this.storage.getUserPreferences(),
        language
      });

      // Track language change
      this.analytics.trackEvent('language', 'change', language);

      this.debug.logger.info(`Language changed to ${language}`);
    } catch (error) {
      this.debug.logger.error('Error changing language:', error);
      this.handleError(error);
    }
  }

  handleKeyboardShortcut(event) {
    try {
      // Ctrl/Cmd + Enter to analyze
      if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        event.preventDefault();
        this.handleAnalysis();
      }

      // Ctrl/Cmd + Shift + C to compare
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'C') {
        event.preventDefault();
        this.handleComparison();
      }

      // Ctrl/Cmd + S to save
      if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault();
        this.handleSave();
      }
    } catch (error) {
      this.debug.logger.error('Error handling keyboard shortcut:', error);
    }
  }

  async handleSave() {
    try {
      const text = document.getElementById('inputText')?.value;
      if (!text) return;

      // Save text
      await this.storage.saveText(text);

      // Show notification
      this.uiController.showNotification('Text saved successfully');

      // Track save
      this.analytics.trackEvent('text', 'save');

      this.debug.logger.info('Text saved successfully');
    } catch (error) {
      this.debug.logger.error('Error saving text:', error);
      this.handleError(error);
    }
  }

  handleError(error) {
    // Log error
    this.debug.logger.error('Application error:', error);

    // Track error
    this.analytics.trackError(error);

    // Show error message to user
    this.uiController.showError(error.message);
  }
}

// Initialize application
const app = new App();

// Export for testing
export default app; 