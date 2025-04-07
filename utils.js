// utils.js - Helper functions for AI Text Detector

/**
 * Collection of utility functions for the AI Text Detector
 */
const utils = {
  /**
   * Safely get element by ID with error handling
   * @param {string} id - Element ID
   * @returns {HTMLElement|null} - The element or null if not found
   */
  getElement: function(id) {
    const element = document.getElementById(id);
    if (!element && window.AIDetectorDebug && window.AIDetectorDebug.config.enabled) {
      window.AIDetectorDebug.logger.warn(`Element with ID "${id}" not found`);
    }
    return element;
  },
  
  /**
   * Create a DOM element with attributes and content
   * @param {string} tag - HTML tag name
   * @param {Object} attributes - Element attributes
   * @param {string|HTMLElement|Array} content - Element content
   * @returns {HTMLElement} - The created element
   */
  createElement: function(tag, attributes = {}, content = null) {
    const element = document.createElement(tag);
    
    // Set attributes
    Object.entries(attributes).forEach(([key, value]) => {
      if (key === 'class' || key === 'className') {
        element.className = value;
      } else if (key === 'style' && typeof value === 'object') {
        Object.entries(value).forEach(([prop, val]) => {
          element.style[prop] = val;
        });
      } else {
        element.setAttribute(key, value);
      }
    });
    
    // Set content
    if (content !== null) {
      if (typeof content === 'string') {
        element.innerHTML = content;
      } else if (content instanceof HTMLElement) {
        element.appendChild(content);
      } else if (Array.isArray(content)) {
        content.forEach(item => {
          if (typeof item === 'string') {
            element.innerHTML += item;
          } else if (item instanceof HTMLElement) {
            element.appendChild(item);
          }
        });
      }
    }
    
    return element;
  },
  
  /**
   * Format a number as a percentage
   * @param {number} value - Value to format
   * @param {number} decimals - Number of decimal places
   * @returns {string} - Formatted percentage
   */
  formatPercent: function(value, decimals = 0) {
    return value.toFixed(decimals) + '%';
  },
  
  /**
   * Safely store data in localStorage with error handling
   * @param {string} key - Storage key
   * @param {any} value - Value to store
   * @returns {boolean} - Success status
   */
  storeData: function(key, value) {
    try {
      const serialized = typeof value === 'object' ? JSON.stringify(value) : String(value);
      localStorage.setItem(key, serialized);
      return true;
    } catch (error) {
      if (window.AIDetectorDebug && window.AIDetectorDebug.config.enabled) {
        window.AIDetectorDebug.logger.error(`Error storing data: ${error.message}`);
      }
      return false;
    }
  },
  
  /**
   * Safely retrieve data from localStorage with error handling
   * @param {string} key - Storage key
   * @param {any} defaultValue - Default value if key not found
   * @returns {any} - Retrieved value or default
   */
  retrieveData: function(key, defaultValue = null) {
    try {
      const value = localStorage.getItem(key);
      if (value === null) return defaultValue;
      
      // Try to parse as JSON, return as string if not valid JSON
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    } catch (error) {
      if (window.AIDetectorDebug && window.AIDetectorDebug.config.enabled) {
        window.AIDetectorDebug.logger.error(`Error retrieving data: ${error.message}`);
      }
      return defaultValue;
    }
  },
  
  /**
   * Debounce function to limit execution rate
   * @param {Function} func - Function to debounce
   * @param {number} wait - Wait time in milliseconds
   * @returns {Function} - Debounced function
   */
  debounce: function(func, wait = 300) {
    let timeout;
    return function(...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  },
  
  /**
   * Copy text to clipboard
   * @param {string} text - Text to copy
   * @returns {Promise<boolean>} - Success status
   */
  copyToClipboard: async function(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      if (window.AIDetectorDebug && window.AIDetectorDebug.config.enabled) {
        window.AIDetectorDebug.logger.error(`Error copying to clipboard: ${error.message}`);
      }
      
      // Fallback method
      try {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        return true;
      } catch {
        return false;
      }
    }
  },
  
  /**
   * Format a date in a localized way
   * @param {Date} date - Date to format
   * @param {string} locale - Locale code
   * @returns {string} - Formatted date
   */
  formatDate: function(date, locale = 'en-US') {
    return new Date(date).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  },
  
  /**
   * Check if the device is mobile
   * @returns {boolean} - True if mobile device
   */
  isMobileDevice: function() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  },
  
  /**
   * Get the user's preferred language
   * @returns {string} - Language code
   */
  getUserLanguage: function() {
    // First check localStorage
    const savedLang = this.retrieveData('aiDetectorLang');
    if (savedLang) return savedLang;
    
    // Then check browser language
    const browserLang = navigator.language || navigator.userLanguage;
    if (browserLang) {
      const langCode = browserLang.split('-')[0].toUpperCase();
      
      // Map browser language codes to our supported languages
      const langMap = {
        'EN': 'ENG',
        'CS': 'CZE',
        'DE': 'DE',
        'FR': 'FR',
        'ES': 'ES',
        'UK': 'UK',
        'RU': 'RU'
      };
      
      return langMap[langCode] || 'ENG';
    }
    
    // Default to English
    return 'ENG';
  },
  
  /**
   * Generate a unique ID
   * @returns {string} - Unique ID
   */
  generateId: function() {
    return 'id_' + Math.random().toString(36).substr(2, 9);
  },
  
  /**
   * Safely parse JSON with error handling
   * @param {string} json - JSON string
   * @param {any} defaultValue - Default value if parsing fails
   * @returns {any} - Parsed object or default value
   */
  safeJsonParse: function(json, defaultValue = {}) {
    try {
      return JSON.parse(json);
    } catch (error) {
      if (window.AIDetectorDebug && window.AIDetectorDebug.config.enabled) {
        window.AIDetectorDebug.logger.error(`Error parsing JSON: ${error.message}`);
      }
      return defaultValue;
    }
  },
  
  /**
   * Check if a feature is supported in the browser
   * @param {string} feature - Feature to check
   * @returns {boolean} - True if supported
   */
  isFeatureSupported: function(feature) {
    const features = {
      'localStorage': typeof localStorage !== 'undefined',
      'clipboard': navigator && navigator.clipboard,
      'serviceWorker': 'serviceWorker' in navigator,
      'webShare': navigator && navigator.share,
      'darkMode': window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    };
    
    return features[feature] || false;
  }
};

// Export the utils object
if (typeof module !== 'undefined' && module.exports) {
  module.exports = utils;
} else {
  // Browser environment
  window.AIUtils = utils;
}
