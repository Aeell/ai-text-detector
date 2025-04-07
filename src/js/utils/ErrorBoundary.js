/**
 * Error Boundary implementation for vanilla JavaScript
 * Inspired by React's Error Boundaries concept
 */

class ErrorBoundary {
  /**
   * Create a new error boundary
   * @param {HTMLElement} container - The DOM element to wrap with error handling
   * @param {Object} options - Configuration options
   */
  constructor(container, options = {}) {
    this.container = container;
    this.originalContent = container.innerHTML;
    this.fallbackUI = options.fallbackUI || this._defaultFallbackUI;
    this.onError = options.onError || ((error) => console.error('Error caught by ErrorBoundary:', error));
    this.onReset = options.onReset || (() => {});
    this.hasError = false;
    
    // Store original event handlers to restore later if needed
    this._originalHandlers = new Map();
    
    // Wrap all event handlers on direct children
    this._wrapEventHandlers();
  }
  
  /**
   * Default UI to show when an error occurs
   * @param {Error} error - The error that was caught
   * @returns {string} - HTML string for the fallback UI
   * @private
   */
  _defaultFallbackUI(error) {
    return `
      <div class="error-boundary">
        <h2>Something went wrong.</h2>
        <p>We're sorry, but there was a problem processing your request.</p>
        <details>
          <summary>Technical details</summary>
          <pre>${error.message}</pre>
        </details>
        <button class="error-boundary-retry">Try Again</button>
      </div>
    `;
  }
  
  /**
   * Wrap all event handlers on direct children with error catching
   * @private
   */
  _wrapEventHandlers() {
    const elements = this.container.querySelectorAll('*');
    elements.forEach(element => {
      // Get all attributes that might be event handlers
      const attributes = element.attributes;
      for (let i = 0; i < attributes.length; i++) {
        const attr = attributes[i];
        if (attr.name.startsWith('on')) {
          const eventType = attr.name.slice(2).toLowerCase();
          
          // Store the original handler if it exists
          if (typeof element[attr.name] === 'function') {
            this._originalHandlers.set(element, {
              eventType,
              handler: element[attr.name]
            });
            
            // Replace with wrapped handler
            element[attr.name] = this._wrapHandler(element[attr.name]);
          }
        }
      }
    });
    
    // Add global event listener for retry button
    this.container.addEventListener('click', (e) => {
      if (e.target.closest('.error-boundary-retry')) {
        this.reset();
      }
    });
  }
  
  /**
   * Wrap a function with try-catch to handle errors
   * @param {Function} fn - The function to wrap
   * @returns {Function} - Wrapped function
   * @private
   */
  _wrapHandler(fn) {
    return (...args) => {
      try {
        return fn(...args);
      } catch (error) {
        this._handleError(error);
        return false; // Prevent default
      }
    };
  }
  
  /**
   * Handle an error by showing fallback UI and calling error callback
   * @param {Error} error - The error that was caught
   * @private
   */
  _handleError(error) {
    if (!this.hasError) {
      this.hasError = true;
      
      // Save the original content for reset
      if (!this.originalContent) {
        this.originalContent = this.container.innerHTML;
      }
      
      // Show fallback UI
      this.container.innerHTML = this.fallbackUI(error);
      
      // Call onError callback
      this.onError(error);
      
      // Report to telemetry/analytics if available
      if (window.AnalyticsService) {
        window.AnalyticsService.trackError(error);
      }
    }
  }
  
  /**
   * Reset the error boundary to its original state
   */
  reset() {
    if (this.hasError) {
      this.hasError = false;
      
      // Restore original content
      this.container.innerHTML = this.originalContent;
      
      // Re-wrap event handlers
      this._wrapEventHandlers();
      
      // Call onReset callback
      this.onReset();
    }
  }
  
  /**
   * Manually trigger error boundary for testing
   * @param {Error} error - The error to trigger
   */
  triggerError(error) {
    this._handleError(error);
  }
  
  /**
   * Static method to wrap a function with error boundary logic
   * @param {Function} fn - The function to wrap
   * @param {Function} errorCallback - Callback for when an error occurs
   * @returns {Function} - Wrapped function
   */
  static wrap(fn, errorCallback) {
    return (...args) => {
      try {
        return fn(...args);
      } catch (error) {
        if (errorCallback) {
          errorCallback(error);
        } else {
          console.error('Error caught by ErrorBoundary.wrap:', error);
        }
        return null;
      }
    };
  }
}

module.exports = ErrorBoundary; 