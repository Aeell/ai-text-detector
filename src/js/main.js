/**
 * AI Text Detector - Main Application
 * This is the entry point for the application that initializes all modules
 * and handles the startup process.
 */

console.log("--- main.js: Start execution ---");

// Import main application class instance.
// This automatically triggers the initialization in app.js
// because app.js ends with `const app = new App();`
const { app } = require('./app');

// Import main CSS file for Webpack to process and bundle.
require('../css/styles.css');

// Log to confirm main.js execution (useful for debugging)
console.log('main.js executed, app initialization should be complete via app.js import.');

// Optionally expose the app instance globally ONLY during development
if (process.env.NODE_ENV !== 'production') {
  window.aiTextDetectorApp = app;
  console.log('App instance exposed to window.aiTextDetectorApp for development debugging.');
}

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

// Application is already initialized by importing app.js
console.log('Main.js loaded, application should be initialized.');

// Add any other necessary global setup here 