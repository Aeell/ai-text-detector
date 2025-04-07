const { AIDetector } = require('./AIDetector');
const { UIController } = require('./UIController');
const { LanguageModel } = require('./models/LanguageModel');
const { TextModel } = require('./models/TextModel');
const { StorageService } = require('./services/StorageService');
const { AnalyticsService } = require('./services/AnalyticsService');
const { Debug } = require('./utils/Debug');
const ErrorBoundary = require('./utils/ErrorBoundary');
const { lazyLoad, prefetch } = require('./utils/lazyLoad');

// Initialize debug
const debug = new Debug('Main');

// Initialize services
const storage = new StorageService();
const analytics = new AnalyticsService();

// Initialize models
const languageModel = new LanguageModel();
const textModel = new TextModel();

// Initialize main components
const aiDetector = new AIDetector(textModel, languageModel);
const ui = new UIController(aiDetector, storage, analytics);

// Define app global error handler
function handleGlobalError(error) {
  debug.error('Global error caught:', error);
  analytics.trackError(error, 'global');
  
  // Show user-friendly error message
  const errorContainer = document.getElementById('error');
  if (errorContainer) {
    errorContainer.textContent = 'An unexpected error occurred. Please refresh the page and try again.';
    errorContainer.classList.remove('hidden');
  }
  
  // Log to console for debugging
  console.error('Unhandled error:', error);
}

// Handle global errors
window.addEventListener('error', (event) => {
  handleGlobalError(event.error || new Error('Unknown error'));
  event.preventDefault();
});

// Handle promise rejections
window.addEventListener('unhandledrejection', (event) => {
  handleGlobalError(event.reason || new Error('Unhandled promise rejection'));
  event.preventDefault();
});

// Prefetch modules that might be needed later during idle time
function prefetchModules() {
  if (window.requestIdleCallback) {
    window.requestIdleCallback(() => {
      debug.log('Prefetching additional modules during idle time');
      prefetch(() => import('./utils/Exporter'));
      prefetch(() => import('./components/Comparison'));
    });
  }
}

// Start the application
document.addEventListener('DOMContentLoaded', () => {
  try {
    debug.log('Initializing application...');
    
    // Initialize analytics
    analytics.init();
    analytics.trackEvent('app_start');

    // Load user preferences
    const preferences = storage.getUserPreferences();
    ui.applyPreferences(preferences);

    // Set up error boundaries for critical UI components
    setupErrorBoundaries();
    
    // Initialize UI
    ui.init();
    
    // Prefetch other modules for future use
    prefetchModules();
    
    // Register performance metrics
    if ('performance' in window && 'mark' in window.performance) {
      window.performance.mark('app_initialized');
      window.performance.measure('initialization_time', 'navigationStart', 'app_initialized');
    }
    
    debug.log('Application initialized successfully');
  } catch (error) {
    debug.error('Failed to initialize application:', error);
    handleGlobalError(error);
  }
});

// Setup error boundaries for critical UI sections
function setupErrorBoundaries() {
  const sections = [
    { id: 'results', name: 'Results Section' },
    { id: 'textInput', name: 'Input Section' },
    { id: 'settingsModal', name: 'Settings Modal' }
  ];
  
  sections.forEach(({ id, name }) => {
    const element = document.getElementById(id);
    if (element) {
      new ErrorBoundary(element, {
        onError: (error) => {
          debug.error(`Error in ${name}:`, error);
          analytics.trackError(error, `boundary_${id}`);
        },
        onReset: () => {
          debug.log(`Error boundary for ${name} reset`);
          analytics.trackEvent('error_boundary_reset', { section: id });
        }
      });
    }
  });
}

// Export modules for external use
module.exports = {
  AIDetector,
  UIController,
  LanguageModel,
  TextModel,
  StorageService,
  AnalyticsService,
  Debug,
  ErrorBoundary
}; 