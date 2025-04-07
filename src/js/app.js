console.log("--- app.js: Start execution ---");

// app.js - Main application entry point
const { AIDetector } = require('./AIDetector');
const { UIController } = require('./UIController');
const { LanguageManager } = require('./LanguageManager');
const { TextModel } = require('./models/TextModel');
const { LanguageModel } = require('./models/LanguageModel');
const { StorageService } = require('./services/StorageService');
const { AnalyticsService } = require('./services/AnalyticsService');
const { Debug } = require('./utils/Debug');
const ErrorBoundary = require('./utils/ErrorBoundary');
const { lazyLoad, prefetch } = require('./utils/lazyLoad');

class App {
  constructor() {
    this.debug = new Debug('App');
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
      this.uiController = new UIController(this.aiDetector, this.storage, this.analytics);

      // Setup error boundaries
      this.setupErrorBoundaries();

      // Check service worker status
      this.checkServiceWorkerStatus();

      // Prefetch modules for later use
      this.prefetchModules();

      // Load user preferences
      await this.loadUserPreferences();

      // Setup event listeners
      this.setupEventListeners();

      // Initialize UI
      this.uiController.init();

      // Track initialization
      this.analytics.trackEvent('app_initialized');
      this.debug.log('Application initialized successfully');
      
      // Register performance metrics
      if ('performance' in window && 'mark' in window.performance) {
        window.performance.mark('app_initialized');
        window.performance.measure('initialization_time', 'navigationStart', 'app_initialized');
      }
    } catch (error) {
      this.debug.error('Error initializing application:', error);
      this.handleError(error);
    }
  }

  setupErrorBoundaries() {
    try {
      const criticalSections = [
        { id: 'results', name: 'Results Section' },
        { id: 'textInput', name: 'Input Section' },
        { id: 'settingsModal', name: 'Settings Modal' }
      ];
      
      criticalSections.forEach(({ id, name }) => {
        const element = document.getElementById(id);
        if (element) {
          new ErrorBoundary(element, {
            onError: (error, componentStack) => {
              const errorDetails = {
                message: error.message,
                stack: error.stack,
                componentStack: componentStack,
                sectionId: id,
                sectionName: name,
                url: window.location.href,
                timestamp: new Date().toISOString()
              };
              this.debug.error(`Error caught by ErrorBoundary in ${name}:`, errorDetails);
              this.analytics.trackError(error, `boundary_${id}`, errorDetails);
            },
            onReset: () => {
              this.debug.log(`Error boundary for ${name} reset`);
              this.analytics.trackEvent('error_boundary_reset', { section: id });
            }
          });
        }
      });
      
      this.debug.log('Error boundaries setup successfully');
    } catch (error) {
      this.debug.error('Error setting up error boundaries:', error);
    }
  }

  checkServiceWorkerStatus() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready
        .then(registration => {
          this.debug.log('Service worker is active', registration.active.scriptURL);
          this.analytics.trackEvent('service_worker_active');
        })
        .catch(error => {
          this.debug.error('Service worker not ready:', error);
        });
        
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        this.debug.log('Service worker controller changed - new version activated');
        this.analytics.trackEvent('service_worker_updated');
      });
    } else {
      this.debug.log('Service workers not supported');
    }
  }

  prefetchModules() {
    try {
      if (window.requestIdleCallback) {
        window.requestIdleCallback(() => {
          this.debug.log('Prefetching modules during idle time');
          
          // Prefetch non-critical components
          prefetch(() => import('./components/Comparison'));
          prefetch(() => import('./utils/Exporter'));
          
          this.analytics.trackEvent('modules_prefetched');
        });
      } else {
        setTimeout(() => {
          this.debug.log('Prefetching modules');
          
          // Prefetch non-critical components
          prefetch(() => import('./components/Comparison'));
          prefetch(() => import('./utils/Exporter'));
          
          this.analytics.trackEvent('modules_prefetched');
        }, 3000);
      }
    } catch (error) {
      this.debug.error('Error prefetching modules:', error);
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
      
      this.debug.log('User preferences loaded successfully');
    } catch (error) {
      this.debug.error('Error loading user preferences:', error);
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
      
      this.debug.log('Accessibility settings applied successfully');
    } catch (error) {
      this.debug.error('Error applying accessibility settings:', error);
    }
  }

  setupTextToSpeech() {
    try {
      if ('speechSynthesis' in window) {
        this.speechSynthesis = window.speechSynthesis;
        this.debug.log('Text-to-speech initialized successfully');
      } else {
        throw new Error('Text-to-speech not supported');
      }
    } catch (error) {
      this.debug.error('Error setting up text-to-speech:', error);
    }
  }

  setupEventListeners() {
    try {
      // Use event delegation for better performance
      document.addEventListener('click', (event) => {
        // Handle analyze button
        if (event.target.id === 'analyzeBtn') {
          this.handleAnalysis();
        }
        
        // Handle compare button
        if (event.target.id === 'compareBtn') {
          this.handleComparison();
        }
        
        // Handle theme toggle
        if (event.target.id === 'themeToggle') {
          this.handleThemeToggle();
        }
        
        // Handle save button
        if (event.target.id === 'saveBtn') {
          this.handleSave();
        }
      });
      
      // Handle settings changes
      document.getElementById('settingsForm')?.addEventListener('change', (event) => {
        this.handleSettingsChange(event);
      });
      
      // Handle language change
      document.getElementById('languageSelect')?.addEventListener('change', (event) => {
        this.handleLanguageChange(event);
      });
      
      // Handle keyboard shortcuts
      document.addEventListener('keydown', (event) => {
        this.handleKeyboardShortcut(event);
      });
      
      // Handle online/offline status
      window.addEventListener('online', () => {
        this.debug.log('Application is online');
        this.analytics.trackEvent('app_online');
        document.body.classList.remove('offline');
      });
      
      window.addEventListener('offline', () => {
        this.debug.log('Application is offline');
        this.analytics.trackEvent('app_offline');
        document.body.classList.add('offline');
      });

      this.debug.log('Event listeners setup successfully');
    } catch (error) {
      this.debug.error('Error setting up event listeners:', error);
    }
  }

  // Wrap this method with error boundary logic
  async handleAnalysis() {
    return ErrorBoundary.wrap(async () => {
      const text = document.getElementById('textInput')?.value;
      if (!text) {
        throw new Error('No text provided');
      }

      // Start performance tracking
      if ('performance' in window) {
        window.performance.mark('analysis_start');
      }

      // Show loading state
      this.uiController.showLoading();

      try {
        // Perform analysis
        const result = await this.aiDetector.analyzeText(text);

        // Update UI with results
        this.uiController.displayResults(result);

        // Track analysis
        this.analytics.trackEvent('text_analyzed', {
          textLength: text.length,
          aiProbability: result.aiProbability
        });

        // End performance tracking
        if ('performance' in window) {
          window.performance.mark('analysis_end');
          window.performance.measure('analysis_time', 'analysis_start', 'analysis_end');
        }

        this.debug.log('Text analysis completed successfully');
      } catch (error) {
        this.debug.error('Error analyzing text:', error);
        this.handleError(error);
      } finally {
        this.uiController.hideLoading();
      }
    }, (error) => this.handleError(error));
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

      this.debug.log('Text comparison completed successfully');
    } catch (error) {
      this.debug.error('Error comparing texts:', error);
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

      this.debug.log(`Setting "${name}" updated successfully`);
    } catch (error) {
      this.debug.error('Error updating settings:', error);
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

      this.debug.log(`Theme changed to ${newTheme}`);
    } catch (error) {
      this.debug.error('Error toggling theme:', error);
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

      this.debug.log(`Language changed to ${language}`);
    } catch (error) {
      this.debug.error('Error changing language:', error);
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
      this.debug.error('Error handling keyboard shortcut:', error);
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

      this.debug.log('Text saved successfully');
    } catch (error) {
      this.debug.error('Error saving text:', error);
      this.handleError(error);
    }
  }

  handleError(error) {
    try {
      // Log error
      this.debug.error('Application error:', error);
      
      // Track error
      this.analytics.trackError(error);
      
      // Show error to user
      const errorContainer = document.getElementById('error');
      if (errorContainer) {
        errorContainer.textContent = 'An error occurred: ' + (error.message || 'Unknown error');
        errorContainer.classList.remove('hidden');
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
          errorContainer.classList.add('hidden');
        }, 5000);
      }
    } catch (secondaryError) {
      // Last resort error logging
      console.error('Error handling error:', secondaryError);
      console.error('Original error:', error);
    }
  }
}

// Create and export a singleton instance
const app = new App();
module.exports = { app }; 