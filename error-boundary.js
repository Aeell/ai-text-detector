// error-boundary.js - Error handling for AI Text Detector

class ErrorBoundary {
  constructor() {
    this.errors = [];
    this.errorListeners = new Set();
    
    // Global error handling
    window.addEventListener('error', this.handleError.bind(this));
    window.addEventListener('unhandledrejection', this.handlePromiseError.bind(this));
  }
  
  /**
   * Handle synchronous errors
   * @param {ErrorEvent} event - Error event
   */
  handleError(event) {
    const error = {
      type: 'sync',
      message: event.message,
      filename: event.filename,
      lineNumber: event.lineno,
      columnNumber: event.colno,
      stack: event.error?.stack,
      timestamp: new Date().toISOString()
    };
    
    this.logError(error);
    this.notifyListeners(error);
    
    // Prevent default error handling
    event.preventDefault();
  }
  
  /**
   * Handle promise rejection errors
   * @param {PromiseRejectionEvent} event - Promise rejection event
   */
  handlePromiseError(event) {
    const error = {
      type: 'async',
      message: event.reason?.message || 'Promise rejected',
      stack: event.reason?.stack,
      timestamp: new Date().toISOString()
    };
    
    this.logError(error);
    this.notifyListeners(error);
    
    // Prevent default error handling
    event.preventDefault();
  }
  
  /**
   * Log error to storage and console
   * @param {Object} error - Error object
   */
  logError(error) {
    this.errors.push(error);
    
    // Limit stored errors
    if (this.errors.length > 50) {
      this.errors.shift();
    }
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error caught by boundary:', error);
    }
    
    // Store in IndexedDB for later analysis
    this.storeError(error);
  }
  
  /**
   * Store error in IndexedDB
   * @param {Object} error - Error object
   */
  async storeError(error) {
    try {
      const db = await this.openDB();
      const transaction = db.transaction(['errors'], 'readwrite');
      const store = transaction.objectStore('errors');
      await store.add(error);
    } catch (err) {
      console.error('Failed to store error:', err);
    }
  }
  
  /**
   * Open IndexedDB connection
   * @returns {Promise<IDBDatabase>}
   */
  openDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('ErrorLog', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = event => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('errors')) {
          db.createObjectStore('errors', { keyPath: 'timestamp' });
        }
      };
    });
  }
  
  /**
   * Add error listener
   * @param {Function} listener - Error listener callback
   */
  addListener(listener) {
    this.errorListeners.add(listener);
  }
  
  /**
   * Remove error listener
   * @param {Function} listener - Error listener callback
   */
  removeListener(listener) {
    this.errorListeners.delete(listener);
  }
  
  /**
   * Notify all error listeners
   * @param {Object} error - Error object
   */
  notifyListeners(error) {
    this.errorListeners.forEach(listener => {
      try {
        listener(error);
      } catch (err) {
        console.error('Error in error listener:', err);
      }
    });
  }
  
  /**
   * Get all stored errors
   * @returns {Array} Array of errors
   */
  getErrors() {
    return [...this.errors];
  }
  
  /**
   * Clear all stored errors
   */
  clearErrors() {
    this.errors = [];
  }
}

// Create singleton instance
const errorBoundary = new ErrorBoundary();

// Export singleton
export default errorBoundary; 