// main.js - Entry point for AI Text Detector application

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  // Initialize the application
  initializeApp();
});

/**
 * Initialize the application
 */
function initializeApp() {
  // Load CSS files
  loadStylesheet('/css/main.css');
  loadStylesheet('/css/dark-theme.css');
  loadStylesheet('/css/responsive.css');
  
  // Initialize debug mode if needed
  if (window.AIDetectorDebug) {
    window.AIDetectorDebug.init();
  }
  
  // Set initial language based on user preference
  if (window.AIUtils) {
    const userLang = window.AIUtils.getUserLanguage();
    if (document.getElementById('langSelect')) {
      document.getElementById('langSelect').value = userLang;
    }
    
    // Initialize UI with user's preferred language
    if (window.UIController && window.UIController.switchLang) {
      window.UIController.switchLang(userLang);
    }
  }
  
  // Add event listeners for text input to enable real-time analysis
  setupRealTimeAnalysis();
  
  // Check for dark mode preference
  checkDarkModePreference();
  
  // Log initialization complete
  if (window.AIDetectorDebug && window.AIDetectorDebug.logger) {
    window.AIDetectorDebug.logger.info('AI Text Detector initialized successfully');
  }
}

/**
 * Load a stylesheet dynamically
 * @param {string} path - Path to the stylesheet
 */
function loadStylesheet(path) {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.type = 'text/css';
  link.href = path;
  document.head.appendChild(link);
}

/**
 * Set up real-time analysis for text input
 */
function setupRealTimeAnalysis() {
  const inputText = document.getElementById('inputText');
  if (!inputText) return;
  
  // Use debounce to prevent excessive analysis
  if (window.AIUtils && window.AIUtils.debounce) {
    const debouncedAnalysis = window.AIUtils.debounce(function() {
      if (inputText.value.trim().length > 50) {
        if (window.UIController && window.UIController.detectAI) {
          window.UIController.detectAI();
        }
      }
    }, 1000);
    
    inputText.addEventListener('input', debouncedAnalysis);
  }
}

/**
 * Check user's dark mode preference
 */
function checkDarkModePreference() {
  // Check if dark mode is preferred by the system
  if (window.AIUtils && window.AIUtils.isFeatureSupported('darkMode')) {
    // Only apply if user hasn't already set a preference
    if (!window.AIUtils.retrieveData('aiDetectorTheme')) {
      document.documentElement.classList.add('dark-theme');
      document.body.classList.add('dark-theme');
      
      // Update theme toggle button if it exists
      if (window.UIController && window.UIController.updateThemeToggleText) {
        window.UIController.updateThemeToggleText();
      }
    }
  }
}
