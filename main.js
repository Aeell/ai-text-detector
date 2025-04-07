// main.js - Entry point for AI Text Detector application

// Import required modules
import { AIDetector } from './ai-detector.js';
import { UIController } from './ui-controller.js';
import { Utils } from './utils.js';
import { Debug } from './debug.js';

// Import CSS
import './main.css';
import './dark-theme.css';
import './responsive.css';

// Register service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('ServiceWorker registration successful');
        
        // Handle updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New version available
              if (confirm('New version available! Reload to update?')) {
                window.location.reload();
              }
            }
          });
        });
      })
      .catch(error => {
        console.error('ServiceWorker registration failed:', error);
      });
  });
}

// Initialize IndexedDB
let db;

async function initDB() {
  try {
    db = await new Promise((resolve, reject) => {
      const request = indexedDB.open('AIDetectorDB', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = event => {
        const db = event.target.result;
        
        if (!db.objectStoreNames.contains('pending')) {
          db.createObjectStore('pending', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('results')) {
          db.createObjectStore('results', { keyPath: 'id' });
        }
      };
    });
    
    console.log('IndexedDB initialized');
  } catch (error) {
    console.error('Error initializing IndexedDB:', error);
  }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);

/**
 * Initialize the application
 */
function initializeApp() {
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
  
  const debouncedAnalysis = Utils.debounce(async () => {
    if (inputText.value.trim().length > 50) {
      try {
        const result = await analyzeText(inputText.value);
        const ui = new UIController();
        ui.displayResults(result);
      } catch (error) {
        console.error('Error in real-time analysis:', error);
      }
    }
  }, 1000);
  
  inputText.addEventListener('input', debouncedAnalysis);
}

/**
 * Check user's dark mode preference
 */
function checkDarkModePreference() {
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    if (!localStorage.getItem('theme')) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
      updateThemeIcon('dark');
    }
  }
}

// Initialize theme
function initTheme() {
  const theme = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', theme);
  updateThemeIcon(theme);
}

// Update theme icon
function updateThemeIcon(theme) {
  const themeIcon = document.querySelector('#themeToggle i');
  if (themeIcon) {
    themeIcon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
  }
}

// Toggle theme
function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  updateThemeIcon(newTheme);
}

// Initialize application with offline support
async function initApp() {
  try {
    // Initialize IndexedDB
    await initDB();
    
    // Initialize theme
    initTheme();
    
    // Add theme toggle listener
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', toggleTheme);
    }
    
    // Initialize UI components
    const ui = new UIController();
    const detector = new AIDetector();
    
    // Initialize debug mode if needed
    if (window.AIDetectorDebug) {
      window.AIDetectorDebug.init();
    }
    
    // Set initial language based on user preference
    const userLang = Utils.getUserLanguage();
    const langSelect = document.getElementById('langSelect');
    if (langSelect) {
      langSelect.value = userLang;
    }
    
    // Initialize UI with user's preferred language
    ui.switchLang(userLang);
    
    // Add event listeners for text input
    setupRealTimeAnalysis();
    
    // Check for dark mode preference
    checkDarkModePreference();
    
    // Add analyze button listener
    const analyzeBtn = document.getElementById('analyzeBtn');
    if (analyzeBtn) {
      analyzeBtn.addEventListener('click', async () => {
        const text = document.getElementById('inputText').value;
        try {
          const result = await analyzeText(text);
          ui.displayResults(result);
        } catch (error) {
          console.error('Error analyzing text:', error);
          ui.showError('Error analyzing text. Please try again.');
        }
      });
    }
    
    // Add compare button listener
    const compareBtn = document.getElementById('compareBtn');
    if (compareBtn) {
      compareBtn.addEventListener('click', () => {
        const text1 = document.getElementById('inputText').value;
        const text2 = document.getElementById('compareText').value;
        const result = detector.compareTexts(text1, text2);
        ui.displayCompareResults(result);
      });
    }
    
    console.log('AI Text Detector initialized successfully');
  } catch (error) {
    console.error('Error initializing application:', error);
    document.body.innerHTML = '<h1>Error loading application. Please try refreshing the page.</h1>';
  }
}

// Helper function to analyze text
async function analyzeText(text) {
  if (!navigator.onLine) {
    throw new Error('Offline');
  }
  
  const detector = new AIDetector();
  return detector.analyzeTextDetailed(text);
}

// Store analysis request for offline processing
async function storeOfflineAnalysis(text) {
  const analysis = {
    id: Date.now(),
    text,
    timestamp: Date.now()
  };
  
  const transaction = db.transaction(['pending'], 'readwrite');
  const store = transaction.objectStore('pending');
  
  await store.add(analysis);
  
  // Request background sync
  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    const registration = await navigator.serviceWorker.ready;
    await registration.sync.register('analyze-text');
  }
}

// Performance monitoring
const performanceMetrics = {
  firstPaint: 0,
  firstContentfulPaint: 0,
  domInteractive: 0,
  loadComplete: 0
};

// Measure performance metrics
function measurePerformance() {
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.name === 'first-paint') {
        performanceMetrics.firstPaint = entry.startTime;
      }
      if (entry.name === 'first-contentful-paint') {
        performanceMetrics.firstContentfulPaint = entry.startTime;
      }
    }
  });
  
  observer.observe({ entryTypes: ['paint'] });
  
  window.addEventListener('DOMContentLoaded', () => {
    performanceMetrics.domInteractive = performance.now();
  });
  
  window.addEventListener('load', () => {
    performanceMetrics.loadComplete = performance.now();
    logPerformanceMetrics();
  });
}

// Log performance metrics
function logPerformanceMetrics() {
  console.log('Performance Metrics:', {
    'First Paint': Math.round(performanceMetrics.firstPaint) + 'ms',
    'First Contentful Paint': Math.round(performanceMetrics.firstContentfulPaint) + 'ms',
    'DOM Interactive': Math.round(performanceMetrics.domInteractive) + 'ms',
    'Load Complete': Math.round(performanceMetrics.loadComplete) + 'ms'
  });
}

// Initialize performance monitoring
measurePerformance();

// Optimize resource loading
function optimizeResourceLoading() {
  // Preload critical resources
  const preloadLinks = [
    { rel: 'preload', as: 'style', href: '/main.css' },
    { rel: 'preload', as: 'script', href: '/ai-detector.js' },
    { rel: 'preload', as: 'font', href: '/fonts/main-font.woff2', crossorigin: 'anonymous' }
  ];
  
  preloadLinks.forEach(link => {
    const linkEl = document.createElement('link');
    Object.assign(linkEl, link);
    document.head.appendChild(linkEl);
  });
  
  // Lazy load non-critical resources
  const lazyResources = [
    { type: 'script', src: '/analytics.js' },
    { type: 'script', src: '/feedback.js' },
    { type: 'style', href: '/print.css', media: 'print' }
  ];
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        loadResource(entry.target.dataset.resource);
        observer.unobserve(entry.target);
      }
    });
  });
  
  lazyResources.forEach(resource => {
    const placeholder = document.createElement('div');
    placeholder.dataset.resource = JSON.stringify(resource);
    document.body.appendChild(placeholder);
    observer.observe(placeholder);
  });
}

// Load a resource dynamically
function loadResource(resourceJson) {
  const resource = JSON.parse(resourceJson);
  const element = document.createElement(resource.type === 'script' ? 'script' : 'link');
  
  if (resource.type === 'script') {
    element.src = resource.src;
    element.async = true;
  } else {
    element.rel = 'stylesheet';
    element.href = resource.href;
    if (resource.media) element.media = resource.media;
  }
  
  document.head.appendChild(element);
}

// Initialize optimizations
optimizeResourceLoading();

// Create and export the AITextDetector object
const AITextDetector = {
  initApp,
  initTheme,
  toggleTheme,
  analyzeText,
  Utils,
  AIDetector,
  UIController
};

// Expose to window object
if (typeof window !== 'undefined') {
  window.AITextDetector = AITextDetector;
  window.initApp = initApp;
}

export default AITextDetector;
