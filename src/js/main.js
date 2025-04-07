/**
 * AI Text Detector - Main Application
 * This is the entry point for the application that initializes all modules
 * and handles the startup process.
 */

// Import core modules
const { AIDetector } = require('./AIDetector');
const { UIController } = require('./UIController');
const { LanguageManager } = require('./LanguageManager');

// Import service modules
const { StorageService } = require('./services/StorageService');
const { AnalyticsService } = require('./services/AnalyticsService');

// Import model modules
const { TextModel } = require('./models/TextModel');
const { LanguageModel } = require('./models/LanguageModel');

// Import utilities
const { Debug } = require('./utils/Debug');

/**
 * Application initialization
 */
document.addEventListener('DOMContentLoaded', async () => {
  // Initialize debug with environment-specific settings
  const debug = new Debug({
    level: process.env.NODE_ENV === 'production' ? 'error' : 'debug',
    prefix: 'AI-DETECTOR',
    enableTimestamps: true,
    enableStorage: process.env.NODE_ENV !== 'production'
  });

  debug.info('Initializing AI Text Detector application');

  try {
    // Initialize Storage Service
    debug.info('Initializing Storage Service');
    const storageService = new StorageService();
    const userPreferences = storageService.getUserPreferences();

    // Initialize Language Manager
    debug.info('Initializing Language Manager');
    const languageManager = new LanguageManager();
    await languageManager.setLanguage(userPreferences.language || 'en');

    // Initialize Analytics Service (respecting user preferences)
    debug.info('Initializing Analytics Service');
    const analyticsService = new AnalyticsService({
      enabled: userPreferences.allowAnalytics !== false,
      anonymizeIP: true,
      endpoint: process.env.ANALYTICS_ENDPOINT || 'https://analytics.ai-detector.example/collect'
    });

    // Set user consent for analytics
    analyticsService.setUserConsent(userPreferences.allowAnalytics !== false);

    // Initialize Models
    debug.info('Initializing Text and Language Models');
    const textModel = new TextModel();
    const languageModel = new LanguageModel();

    // Initialize AI Detector
    debug.info('Initializing AI Detector');
    const aiDetector = new AIDetector(textModel, languageModel, storageService, debug);
    
    // Load necessary models
    debug.info('Loading AI detection models');
    await aiDetector.loadModels();

    // Initialize UI Controller
    debug.info('Initializing UI Controller');
    const uiController = new UIController(aiDetector, storageService, analyticsService);
    uiController.init();

    // Track application load performance
    analyticsService.trackPerformance();

    // Start analytics session if enabled
    if (analyticsService.isEnabled()) {
      analyticsService.startSession();
      analyticsService.trackEvent({
        category: 'Application',
        action: 'Startup',
        label: `Language: ${userPreferences.language || 'en'}, Theme: ${userPreferences.theme || 'light'}`
      });
    }

    debug.info('Application initialized successfully');

    // Expose API for debugging in development mode
    if (process.env.NODE_ENV !== 'production') {
      window.aiTextDetector = {
        debug,
        aiDetector,
        uiController,
        languageManager,
        storageService,
        analyticsService
      };
      debug.info('Debug API exposed to window.aiTextDetector');
    }

  } catch (error) {
    debug.error('Failed to initialize application:', error);
    
    // Display error message to user
    const errorElement = document.getElementById('error-section');
    if (errorElement) {
      errorElement.classList.remove('hidden');
      const errorMessage = document.querySelector('.error-message');
      if (errorMessage) {
        errorMessage.textContent = 'Failed to initialize the application. Please refresh the page or try again later.';
      }
    }
  }
});

/**
 * Handle application shutdown
 */
window.addEventListener('beforeunload', () => {
  // Get instances if they exist
  const debug = window.aiTextDetector?.debug;
  const analyticsService = window.aiTextDetector?.analyticsService;

  // End analytics session if it exists and is enabled
  if (analyticsService && analyticsService.isEnabled()) {
    analyticsService.endSession();
  }

  if (debug) {
    debug.info('Application shutting down');
  }
});

/**
 * Error handling for uncaught exceptions
 */
window.addEventListener('error', (event) => {
  const debug = window.aiTextDetector?.debug;
  const analyticsService = window.aiTextDetector?.analyticsService;

  if (debug) {
    debug.error('Uncaught error:', event.error);
  }

  if (analyticsService && analyticsService.isEnabled()) {
    analyticsService.trackError(event.error);
  }
}); 