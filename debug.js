// debug.js - Debugging functionality for AI Text Detector
// This module provides debugging tools for development and troubleshooting

/**
 * Debug configuration object
 */
const debugConfig = {
  enabled: false,
  logLevel: 'info', // 'error', 'warn', 'info', 'debug', 'verbose'
  showTimestamps: true,
  traceAIDetection: false,
  traceDOMEvents: false,
  performanceMonitoring: false,
  visualizeAlgorithm: false
};

/**
 * Debug logger with different log levels
 */
const debugLogger = {
  error: function(message, data) {
    if (!debugConfig.enabled) return;
    const prefix = debugConfig.showTimestamps ? `[${new Date().toISOString()}] [ERROR] ` : '[ERROR] ';
    console.error(prefix + message, data !== undefined ? data : '');
  },
  
  warn: function(message, data) {
    if (!debugConfig.enabled || !['warn', 'info', 'debug', 'verbose'].includes(debugConfig.logLevel)) return;
    const prefix = debugConfig.showTimestamps ? `[${new Date().toISOString()}] [WARN] ` : '[WARN] ';
    console.warn(prefix + message, data !== undefined ? data : '');
  },
  
  info: function(message, data) {
    if (!debugConfig.enabled || !['info', 'debug', 'verbose'].includes(debugConfig.logLevel)) return;
    const prefix = debugConfig.showTimestamps ? `[${new Date().toISOString()}] [INFO] ` : '[INFO] ';
    console.info(prefix + message, data !== undefined ? data : '');
  },
  
  debug: function(message, data) {
    if (!debugConfig.enabled || !['debug', 'verbose'].includes(debugConfig.logLevel)) return;
    const prefix = debugConfig.showTimestamps ? `[${new Date().toISOString()}] [DEBUG] ` : '[DEBUG] ';
    console.debug(prefix + message, data !== undefined ? data : '');
  },
  
  verbose: function(message, data) {
    if (!debugConfig.enabled || debugConfig.logLevel !== 'verbose') return;
    const prefix = debugConfig.showTimestamps ? `[${new Date().toISOString()}] [VERBOSE] ` : '[VERBOSE] ';
    console.debug(prefix + message, data !== undefined ? data : '');
  },
  
  group: function(label) {
    if (!debugConfig.enabled) return;
    console.group(label);
  },
  
  groupEnd: function() {
    if (!debugConfig.enabled) return;
    console.groupEnd();
  },
  
  table: function(data) {
    if (!debugConfig.enabled) return;
    console.table(data);
  }
};

/**
 * Performance monitoring utilities
 */
const performanceMonitor = {
  timers: {},
  
  startTimer: function(label) {
    if (!debugConfig.enabled || !debugConfig.performanceMonitoring) return;
    this.timers[label] = performance.now();
    debugLogger.debug(`Timer started: ${label}`);
  },
  
  endTimer: function(label) {
    if (!debugConfig.enabled || !debugConfig.performanceMonitoring || !this.timers[label]) return;
    const duration = performance.now() - this.timers[label];
    debugLogger.info(`Timer ${label}: ${duration.toFixed(2)}ms`);
    delete this.timers[label];
    return duration;
  },
  
  measure: function(label, callback) {
    if (!debugConfig.enabled || !debugConfig.performanceMonitoring) {
      return callback();
    }
    
    this.startTimer(label);
    const result = callback();
    this.endTimer(label);
    return result;
  }
};

/**
 * AI Detection algorithm tracing
 */
const aiDetectionTracer = {
  traceAnalysis: function(text, analysisResults) {
    if (!debugConfig.enabled || !debugConfig.traceAIDetection) return;
    
    debugLogger.group('AI Detection Analysis');
    debugLogger.info('Text length: ' + text.length + ' characters');
    debugLogger.info('Word count: ' + analysisResults.wordCount);
    debugLogger.info('Sentence count: ' + analysisResults.sentenceCount);
    debugLogger.info('Average sentence length: ' + analysisResults.avgSentenceLength.toFixed(2) + ' words');
    debugLogger.info('Unique words ratio: ' + (analysisResults.uniqueWords / analysisResults.wordCount).toFixed(2));
    debugLogger.info('Sentence length variance: ' + analysisResults.sentenceLengthVariance.toFixed(2));
    debugLogger.info('Transition phrases count: ' + analysisResults.transitionPhrases);
    
    debugLogger.debug('Score components:', {
      baseline: 20,
      sentenceLength: (analysisResults.avgSentenceLength > 8 && analysisResults.avgSentenceLength < 16) ? 25 : 0,
      repetition: (analysisResults.repetitionScore < 0.3) ? 20 : 0,
      variance: (analysisResults.sentenceLengthVariance < 15) ? 20 : 0,
      transitions: (analysisResults.transitionPhrases > 1) ? 20 : 0,
      textLength: (analysisResults.wordCount > 100 && analysisResults.sentenceCount < 15) ? 15 : 0
    });
    
    debugLogger.info('Final AI score: ' + analysisResults.aiScore + '%');
    debugLogger.groupEnd();
  },
  
  visualizeResults: function(analysisResults) {
    if (!debugConfig.enabled || !debugConfig.visualizeAlgorithm) return;
    
    // Create a simple visualization of the score components
    const scoreComponents = [
      { name: 'Baseline', value: 20 },
      { name: 'Sentence Length', value: (analysisResults.avgSentenceLength > 8 && analysisResults.avgSentenceLength < 16) ? 25 : 0 },
      { name: 'Repetition', value: (analysisResults.repetitionScore < 0.3) ? 20 : 0 },
      { name: 'Variance', value: (analysisResults.sentenceLengthVariance < 15) ? 20 : 0 },
      { name: 'Transitions', value: (analysisResults.transitionPhrases > 1) ? 20 : 0 },
      { name: 'Text Length', value: (analysisResults.wordCount > 100 && analysisResults.sentenceCount < 15) ? 15 : 0 }
    ];
    
    debugLogger.table(scoreComponents);
  }
};

/**
 * DOM event tracing
 */
const domEventTracer = {
  init: function() {
    if (!debugConfig.enabled || !debugConfig.traceDOMEvents) return;
    
    const eventTypes = ['click', 'input', 'change', 'submit'];
    const selector = 'button, input, select, textarea, form';
    
    document.addEventListener('click', (e) => {
      if (e.target.matches(selector)) {
        const elementInfo = this.getElementInfo(e.target);
        debugLogger.debug(`Click event on ${elementInfo}`);
      }
    }, true);
    
    document.addEventListener('input', (e) => {
      if (e.target.matches(selector)) {
        const elementInfo = this.getElementInfo(e.target);
        debugLogger.verbose(`Input event on ${elementInfo}`);
      }
    }, true);
    
    document.addEventListener('change', (e) => {
      if (e.target.matches(selector)) {
        const elementInfo = this.getElementInfo(e.target);
        const value = e.target.type === 'password' ? '********' : e.target.value;
        debugLogger.debug(`Change event on ${elementInfo}, value: ${value}`);
      }
    }, true);
    
    document.addEventListener('submit', (e) => {
      const elementInfo = this.getElementInfo(e.target);
      debugLogger.info(`Form submission: ${elementInfo}`);
    }, true);
    
    debugLogger.info('DOM event tracing initialized');
  },
  
  getElementInfo: function(element) {
    let info = element.tagName.toLowerCase();
    if (element.id) info += `#${element.id}`;
    if (element.className) info += `.${element.className.replace(/\s+/g, '.')}`;
    return info;
  }
};

/**
 * Error tracking and reporting
 */
const errorTracker = {
  init: function() {
    if (!debugConfig.enabled) return;
    
    window.addEventListener('error', (event) => {
      debugLogger.error(`Uncaught error: ${event.message}`, {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error
      });
    });
    
    window.addEventListener('unhandledrejection', (event) => {
      debugLogger.error(`Unhandled promise rejection: ${event.reason}`, event.reason);
    });
    
    debugLogger.info('Error tracking initialized');
  },
  
  trackTry: function(func, errorMessage = 'Error in function execution') {
    try {
      return func();
    } catch (error) {
      debugLogger.error(`${errorMessage}: ${error.message}`, error);
      return null;
    }
  }
};

/**
 * Debug UI controls
 */
const debugUI = {
  init: function() {
    if (this.isDebugMode()) {
      this.createDebugPanel();
      debugConfig.enabled = true;
      debugLogger.info('Debug mode activated');
      errorTracker.init();
      domEventTracer.init();
    }
  },
  
  isDebugMode: function() {
    return window.location.hash.includes('debug') || localStorage.getItem('aiDetectorDebug') === 'true';
  },
  
  createDebugPanel: function() {
    const panel = document.createElement('div');
    panel.id = 'debug-panel';
    panel.style.cssText = `
      position: fixed;
      bottom: 0;
      right: 0;
      width: 300px;
      background: rgba(0, 0, 0, 0.8);
      color: #00ff00;
      font-family: monospace;
      font-size: 12px;
      padding: 10px;
      z-index: 9999;
      max-height: 400px;
      overflow-y: auto;
      border-top-left-radius: 5px;
    `;
    
    const header = document.createElement('div');
    header.innerHTML = '<h3 style="margin: 0 0 10px 0; color: #fff;">AI Detector Debug Panel</h3>';
    panel.appendChild(header);
    
    // Log level selector
    const logLevelContainer = document.createElement('div');
    logLevelContainer.style.margin = '5px 0';
    logLevelContainer.innerHTML = `
      <label for="debug-log-level">Log Level: </label>
      <select id="debug-log-level">
        <option value="error">Error</option>
        <option value="warn">Warning</option>
        <option value="info" selected>Info</option>
        <option value="debug">Debug</option>
        <option value="verbose">Verbose</option>
      </select>
    `;
    panel.appendChild(logLevelContainer);
    
    // Debug options
    const optionsContainer = document.createElement('div');
    optionsContainer.style.margin = '5px 0';
    
    const createCheckbox = (id, label, checked = false) => {
      const container = document.createElement('div');
      container.innerHTML = `
        <input type="checkbox" id="${id}" ${checked ? 'checked' : ''}>
        <label for="${id}">${label}</label>
      `;
      return container;
    };
    
    optionsContainer.appendChild(createCheckbox('debug-timestamps', 'Show Timestamps', true));
    optionsContainer.appendChild(createCheckbox('debug-trace-ai', 'Trace AI Detection'));
    optionsContainer.appendChild(createCheckbox('debug-trace-dom', 'Trace DOM Events'));
    optionsContainer.appendChild(createCheckbox('debug-performance', 'Performance Monitoring'));
    optionsContainer.appendChild(createCheckbox('debug-visualize', 'Visualize Algorithm'));
    
    panel.appendChild(optionsContainer);
    
    // Apply button
    const applyButton = document.createElement('button');
    applyButton.textContent = 'Apply Settings';
    applyButton.style.cssText = `
      background: #00aa00;
      color: white;
      border: none;
      padding: 5px 10px;
      margin: 5px 0;
      cursor: pointer;
      border-radius: 3px;
    `;
    panel.appendChild(applyButton);
    
    // Close button
    const closeButton = document.createElement('button');
    closeButton.textContent = 'Close Panel';
    closeButton.style.cssText = `
      background: #aa0000;
      color: white;
      border: none;
      padding: 5px 10px;
      margin: 5px 0 5px 5px;
      cursor: pointer;
      border-radius: 3px;
    `;
    panel.appendChild(closeButton);
    
    document.body.appendChild(panel);
    
    // Event listeners
    applyButton.addEventListener('click', () => {
      debugConfig.logLevel = document.getElementById('debug-log-level').value;
      debugConfig.showTimestamps = document.getElementById('debug-timestamps').checked;
      debugConfig.traceAIDetection = document.getElementById('debug-trace-ai').checked;
      debugConfig.traceDOMEvents = document.getElementById('debug-trace-dom').checked;
      debugConfig.performanceMonitoring = document.getElementById('debug-performance').checked;
      debugConfig.visualizeAlgorithm = document.getElementById('debug-visualize').checked;
      
      localStorage.setItem('aiDetectorDebugConfig', JSON.stringify(debugConfig));
      debugLogger.info('Debug settings updated', debugConfig);
      
      if (debugConfig.traceDOMEvents) {
        domEventTracer.init();
      }
    });
    
    closeButton.addEventListener('click', () => {
      panel.style.display = 'none';
    });
    
    // Load saved settings
    const savedConfig = localStorage.getItem('aiDetectorDebugConfig');
    if (savedConfig) {
      try {
        const config = JSON.parse(savedConfig);
        document.getElementById('debug-log-level').value = config.logLevel || 'info';
        document.getElementById('debug-timestamps').checked = config.showTimestamps !== false;
        document.getElementById('debug-trace-ai').checked = !!config.traceAIDetection;
        document.getElementById('debug-trace-dom').checked = !!config.traceDOMEvents;
        document.getElementById('debug-performance').checked = !!config.performanceMonitoring;
        document.getElementById('debug-visualize').checked = !!config.visualizeAlgorithm;
        
        // Apply loaded settings
        Object.assign(debugConfig, config);
      } catch (e) {
        console.error('Error loading debug settings', e);
      }
    }
  }
};

/**
 * Enhanced AI detection function with debugging
 */
function analyzeTextWithDebug(text) {
  if (debugConfig.enabled && debugConfig.performanceMonitoring) {
    return performanceMonitor.measure('analyzeText', () => {
      const result = analyzeTextInternal(text);
      if (debugConfig.traceAIDetection) {
        aiDetectionTracer.traceAnalysis(text, result);
        if (debugConfig.visualizeAlgorithm) {
          aiDetectionTracer.visualizeResults(result);
        }
      }
      return result.aiScore;
    });
  } else {
    return analyzeTextInternal(text).aiScore;
  }
}

/**
 * Internal implementation of the text analysis with detailed return values
 */
function analyzeTextInternal(text) {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = text.split(/\s+/).filter(w => w.length > 0);
  const avgSentenceLength = sentences.reduce((sum, s) => sum + s.split(" ").length, 0) / sentences.length || 0;
  const wordCount = words.length;
  const uniqueWords = new Set(words.map(w => w.toLowerCase())).size;
  const repetitionScore = (wordCount - uniqueWords) / wordCount;
  const sentenceLengthVariance = sentences.map(s => s.split(" ").length)
    .reduce((sum, len, _, arr) => sum + Math.pow(len - avgSentenceLength, 2), 0) / sentences.length || 0;
  const transitionPhrases = ["for example", "in conclusion", "finally", "first", "second", "another", "například", "závěrem"]
    .reduce((count, phrase) => count + (text.toLowerCase().split(phrase).length - 1), 0);

  let aiScore = 20; // Baseline
  if (avgSentenceLength > 8 && avgSentenceLength < 16) aiScore += 25;
  if (repetitionScore < 0.3) aiScore += 20;
  if (sentenceLengthVariance < 15) aiScore += 20;
  if (transitionPhrases > 1) aiScore += 20;
  if (wordCount > 100 && sentences.length < 15) aiScore += 15;

  return {
    aiScore: Math.min(Math.round(aiScore), 100),
    wordCount,
    sentenceCount: sentences.length,
    avgSentenceLength,
    uniqueWords,
    repetitionScore,
    sentenceLengthVariance,
    transitionPhrases
  };
}

// Initialize debug UI when the page loads
document.addEventListener('DOMContentLoaded', () => {
  debugUI.init();
});

// Export the debug module
window.AIDetectorDebug = {
  logger: debugLogger,
  performance: performanceMonitor,
  errorTracker: errorTracker,
  aiTracer: aiDetectionTracer,
  domTracer: domEventTracer,
  config: debugConfig,
  analyzeText: analyzeTextWithDebug,
  
  // Helper to enable debug mode programmatically
  enable: function(options = {}) {
    debugConfig.enabled = true;
    Object.assign(debugConfig, options);
    localStorage.setItem('aiDetectorDebug', 'true');
    localStorage.setItem('aiDetectorDebugConfig', JSON.stringify(debugConfig));
    debugLogger.info('Debug mode enabled programmatically', debugConfig);
    errorTracker.init();
    if (debugConfig.traceDOMEvents) {
      domEventTracer.init();
    }
  },
  
  // Helper to disable debug mode
  disable: function() {
    debugConfig.enabled = false;
    localStorage.removeItem('aiDetectorDebug');
    console.info('Debug mode disabled');
  }
};
