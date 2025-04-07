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
  visualizeAlgorithm: false,
  moduleLoadingDebug: true,
  networkDebug: true
};

/**
 * Debug logger with different log levels
 */
const debugLogger = {
  error: function(message, data, stack) {
    if (!debugConfig.enabled) return;
    const prefix = debugConfig.showTimestamps ? `[${new Date().toISOString()}] [ERROR] ` : '[ERROR] ';
    console.error(prefix + message, data !== undefined ? data : '', stack || new Error().stack);
    this.saveToLocalStorage('error', message, data, stack);
  },
  
  warn: function(message, data) {
    if (!debugConfig.enabled || !['warn', 'info', 'debug', 'verbose'].includes(debugConfig.logLevel)) return;
    const prefix = debugConfig.showTimestamps ? `[${new Date().toISOString()}] [WARN] ` : '[WARN] ';
    console.warn(prefix + message, data !== undefined ? data : '');
    this.saveToLocalStorage('warn', message, data);
  },
  
  info: function(message, data) {
    if (!debugConfig.enabled || !['info', 'debug', 'verbose'].includes(debugConfig.logLevel)) return;
    const prefix = debugConfig.showTimestamps ? `[${new Date().toISOString()}] [INFO] ` : '[INFO] ';
    console.info(prefix + message, data !== undefined ? data : '');
    this.saveToLocalStorage('info', message, data);
  },
  
  debug: function(message, data) {
    if (!debugConfig.enabled || !['debug', 'verbose'].includes(debugConfig.logLevel)) return;
    const prefix = debugConfig.showTimestamps ? `[${new Date().toISOString()}] [DEBUG] ` : '[DEBUG] ';
    console.debug(prefix + message, data !== undefined ? data : '');
    this.saveToLocalStorage('debug', message, data);
  },
  
  verbose: function(message, data) {
    if (!debugConfig.enabled || debugConfig.logLevel !== 'verbose') return;
    const prefix = debugConfig.showTimestamps ? `[${new Date().toISOString()}] [VERBOSE] ` : '[VERBOSE] ';
    console.debug(prefix + message, data !== undefined ? data : '');
    this.saveToLocalStorage('verbose', message, data);
  },
  
  saveToLocalStorage: function(level, message, data, stack) {
    try {
      const logs = JSON.parse(localStorage.getItem('aiDetectorLogs') || '[]');
      logs.push({
        timestamp: new Date().toISOString(),
        level,
        message,
        data: data ? JSON.stringify(data) : undefined,
        stack
      });
      
      // Keep only last 100 logs
      if (logs.length > 100) {
        logs.shift();
      }
      
      localStorage.setItem('aiDetectorLogs', JSON.stringify(logs));
    } catch (error) {
      console.error('Error saving log to localStorage:', error);
    }
  }
};

/**
 * Module loading tracker
 */
const moduleTracker = {
  loadedModules: new Set(),
  moduleErrors: new Map(),
  
  trackModuleLoad: function(moduleName) {
    this.loadedModules.add(moduleName);
    debugLogger.info(`Module loaded: ${moduleName}`);
  },
  
  trackModuleError: function(moduleName, error) {
    this.moduleErrors.set(moduleName, error);
    debugLogger.error(`Module load error: ${moduleName}`, error);
  },
  
  getModuleStatus: function() {
    return {
      loaded: Array.from(this.loadedModules),
      errors: Object.fromEntries(this.moduleErrors)
    };
  }
};

/**
 * Network request tracker
 */
const networkTracker = {
  requests: new Map(),
  
  trackRequest: function(url, options = {}) {
    const requestId = Math.random().toString(36).substr(2, 9);
    this.requests.set(requestId, {
      url,
      options,
      startTime: Date.now(),
      status: 'pending'
    });
    return requestId;
  },
  
  trackResponse: function(requestId, response) {
    const request = this.requests.get(requestId);
    if (request) {
      request.endTime = Date.now();
      request.duration = request.endTime - request.startTime;
      request.status = response.ok ? 'success' : 'error';
      request.statusCode = response.status;
      debugLogger.debug(`Request completed: ${request.url}`, request);
    }
  },
  
  trackError: function(requestId, error) {
    const request = this.requests.get(requestId);
    if (request) {
      request.endTime = Date.now();
      request.duration = request.endTime - request.startTime;
      request.status = 'error';
      request.error = error;
      debugLogger.error(`Request failed: ${request.url}`, error);
    }
  }
};

/**
 * Performance monitoring
 */
const performanceMonitor = {
  metrics: new Map(),
  
  startMeasure: function(name) {
    if (!debugConfig.performanceMonitoring) return;
    performance.mark(`${name}-start`);
  },
  
  endMeasure: function(name) {
    if (!debugConfig.performanceMonitoring) return;
    performance.mark(`${name}-end`);
    performance.measure(name, `${name}-start`, `${name}-end`);
    
    const entries = performance.getEntriesByName(name);
    if (entries.length > 0) {
      this.metrics.set(name, entries[0].duration);
      debugLogger.debug(`Performance measurement - ${name}:`, `${entries[0].duration.toFixed(2)}ms`);
    }
  },
  
  getMetrics: function() {
    return Object.fromEntries(this.metrics);
  }
};

/**
 * Error boundary for catching and handling runtime errors
 */
const errorBoundary = {
  errors: [],
  
  handleError: function(error, componentStack) {
    this.errors.push({
      timestamp: new Date().toISOString(),
      error: error.message,
      stack: error.stack,
      componentStack
    });
    
    debugLogger.error('Runtime error caught:', error, componentStack);
    
    // Try to recover UI
    this.attemptRecovery();
  },
  
  attemptRecovery: function() {
    try {
      // Reset UI state
      const app = document.querySelector('.app-content');
      if (app) {
        app.classList.remove('loaded');
        setTimeout(() => {
          app.classList.add('loaded');
        }, 100);
      }
      
      // Re-initialize if needed
      if (window.AITextDetector && window.AITextDetector.initApp) {
        window.AITextDetector.initApp();
      }
    } catch (error) {
      debugLogger.error('Recovery attempt failed:', error);
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
      this.setupErrorHandling();
      this.setupNetworkTracking();
    }
  },
  
  isDebugMode: function() {
    return window.location.hash.includes('debug') || 
           localStorage.getItem('aiDetectorDebug') === 'true' ||
           process.env.NODE_ENV === 'development';
  },
  
  setupErrorHandling: function() {
    window.onerror = (message, source, lineno, colno, error) => {
      debugLogger.error('Global error:', { message, source, lineno, colno }, error?.stack);
      return false;
    };
    
    window.onunhandledrejection = (event) => {
      debugLogger.error('Unhandled promise rejection:', event.reason);
      return false;
    };
  },
  
  setupNetworkTracking: function() {
    if (debugConfig.networkDebug) {
      const originalFetch = window.fetch;
      window.fetch = async function(...args) {
        const requestId = networkTracker.trackRequest(args[0]);
        try {
          const response = await originalFetch.apply(this, args);
          networkTracker.trackResponse(requestId, response);
          return response;
        } catch (error) {
          networkTracker.trackError(requestId, error);
          throw error;
        }
      };
    }
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
    
    // Add controls and info sections
    this.addDebugControls(panel);
    
    document.body.appendChild(panel);
  },
  
  addDebugControls: function(panel) {
    // Log level selector
    const logLevelContainer = this.createLogLevelSelector();
    panel.appendChild(logLevelContainer);
    
    // Debug options
    const optionsContainer = this.createDebugOptions();
    panel.appendChild(optionsContainer);
    
    // Module status
    const moduleStatus = this.createModuleStatus();
    panel.appendChild(moduleStatus);
    
    // Performance metrics
    const perfMetrics = this.createPerformanceMetrics();
    panel.appendChild(perfMetrics);
    
    // Error log
    const errorLog = this.createErrorLog();
    panel.appendChild(errorLog);
  },
  
  createLogLevelSelector: function() {
    const container = document.createElement('div');
    container.style.margin = '5px 0';
    container.innerHTML = `
      <label for="debug-log-level">Log Level: </label>
      <select id="debug-log-level">
        <option value="error">Error</option>
        <option value="warn">Warning</option>
        <option value="info" selected>Info</option>
        <option value="debug">Debug</option>
        <option value="verbose">Verbose</option>
      </select>
    `;
    
    container.querySelector('select').addEventListener('change', (e) => {
      debugConfig.logLevel = e.target.value;
    });
    
    return container;
  },
  
  createDebugOptions: function() {
    const container = document.createElement('div');
    container.style.margin = '5px 0';
    
    const options = [
      { id: 'showTimestamps', label: 'Show Timestamps' },
      { id: 'traceAIDetection', label: 'Trace AI Detection' },
      { id: 'traceDOMEvents', label: 'Trace DOM Events' },
      { id: 'performanceMonitoring', label: 'Performance Monitoring' },
      { id: 'moduleLoadingDebug', label: 'Module Loading Debug' },
      { id: 'networkDebug', label: 'Network Debug' }
    ];
    
    options.forEach(option => {
      const label = document.createElement('label');
      label.style.display = 'block';
      label.style.margin = '2px 0';
      
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.id = option.id;
      checkbox.checked = debugConfig[option.id];
      checkbox.addEventListener('change', (e) => {
        debugConfig[option.id] = e.target.checked;
      });
      
      label.appendChild(checkbox);
      label.appendChild(document.createTextNode(` ${option.label}`));
      container.appendChild(label);
    });
    
    return container;
  },
  
  createModuleStatus: function() {
    const container = document.createElement('div');
    container.style.margin = '5px 0';
    container.innerHTML = '<h4>Module Status</h4>';
    
    const status = moduleTracker.getModuleStatus();
    const statusTable = document.createElement('table');
    statusTable.style.width = '100%';
    
    const headerRow = document.createElement('tr');
    const moduleHeader = document.createElement('th');
    moduleHeader.style.width = '50%';
    moduleHeader.style.textAlign = 'left';
    moduleHeader.innerHTML = 'Module';
    headerRow.appendChild(moduleHeader);
    
    const statusHeader = document.createElement('th');
    statusHeader.style.width = '50%';
    statusHeader.style.textAlign = 'left';
    statusHeader.innerHTML = 'Status';
    headerRow.appendChild(statusHeader);
    
    statusTable.appendChild(headerRow);
    
    status.loaded.forEach(module => {
      const row = document.createElement('tr');
      const moduleCell = document.createElement('td');
      moduleCell.style.padding = '5px';
      moduleCell.innerHTML = module;
      row.appendChild(moduleCell);
      
      const statusCell = document.createElement('td');
      statusCell.style.padding = '5px';
      statusCell.style.textAlign = 'left';
      statusCell.innerHTML = 'Loaded';
      row.appendChild(statusCell);
      
      statusTable.appendChild(row);
    });
    
    status.errors.forEach((error, module) => {
      const row = document.createElement('tr');
      const moduleCell = document.createElement('td');
      moduleCell.style.padding = '5px';
      moduleCell.innerHTML = module;
      row.appendChild(moduleCell);
      
      const statusCell = document.createElement('td');
      statusCell.style.padding = '5px';
      statusCell.style.textAlign = 'left';
      statusCell.innerHTML = error instanceof Error ? error.message : error;
      row.appendChild(statusCell);
      
      statusTable.appendChild(row);
    });
    
    container.appendChild(statusTable);
    
    return container;
  },
  
  createPerformanceMetrics: function() {
    const container = document.createElement('div');
    container.style.margin = '5px 0';
    container.innerHTML = '<h4>Performance Metrics</h4>';
    
    const metrics = performanceMonitor.getMetrics();
    const metricsTable = document.createElement('table');
    metricsTable.style.width = '100%';
    
    const headerRow = document.createElement('tr');
    const metricHeader = document.createElement('th');
    metricHeader.style.width = '50%';
    metricHeader.style.textAlign = 'left';
    metricHeader.innerHTML = 'Metric';
    headerRow.appendChild(metricHeader);
    
    const valueHeader = document.createElement('th');
    valueHeader.style.width = '50%';
    valueHeader.style.textAlign = 'left';
    valueHeader.innerHTML = 'Value';
    headerRow.appendChild(valueHeader);
    
    metricsTable.appendChild(headerRow);
    
    Object.entries(metrics).forEach(([metric, value]) => {
      const row = document.createElement('tr');
      const metricCell = document.createElement('td');
      metricCell.style.padding = '5px';
      metricCell.innerHTML = metric;
      row.appendChild(metricCell);
      
      const valueCell = document.createElement('td');
      valueCell.style.padding = '5px';
      valueCell.style.textAlign = 'left';
      valueCell.innerHTML = value.toFixed(2) + 'ms';
      row.appendChild(valueCell);
      
      metricsTable.appendChild(row);
    });
    
    container.appendChild(metricsTable);
    
    return container;
  },
  
  createErrorLog: function() {
    const container = document.createElement('div');
    container.style.margin = '5px 0';
    container.innerHTML = '<h4>Error Log</h4>';
    
    const errorLog = document.createElement('textarea');
    errorLog.style.width = '100%';
    errorLog.style.height = '100px';
    errorLog.style.resize = 'none';
    errorLog.value = this.getErrorLog();
    errorLog.readOnly = true;
    
    container.appendChild(errorLog);
    
    return container;
  },
  
  getErrorLog: function() {
    const logs = JSON.parse(localStorage.getItem('aiDetectorLogs') || '[]');
    return logs.map(log => {
      return `${log.timestamp} - ${log.level.toUpperCase()}: ${log.message}
${log.data ? `Data: ${log.data}` : ''}
${log.stack ? `Stack: ${log.stack}` : ''}`;
    }).join('\n\n');
  }
};

// Export debug functionality
const Debug = {
  config: debugConfig,
  logger: debugLogger,
  moduleTracker,
  networkTracker,
  performanceMonitor,
  errorBoundary,
  ui: debugUI
};

// Initialize debug mode if needed
if (typeof window !== 'undefined') {
  window.AIDetectorDebug = Debug;
}

export default Debug;
