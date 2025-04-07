/**
 * Utility for lazy loading components and modules
 */

/**
 * Dynamically imports a module when needed
 * @param {Function} importCallback - Function that returns a dynamic import (e.g., () => import('../components/Chart'))
 * @param {Function} loadingCallback - Optional callback to execute while loading
 * @returns {Promise} - Promise that resolves with the imported module
 */
function lazyLoad(importCallback, loadingCallback = null) {
  if (loadingCallback) {
    loadingCallback(true);
  }
  
  return importCallback()
    .then(module => {
      if (loadingCallback) {
        loadingCallback(false);
      }
      return module;
    })
    .catch(error => {
      console.error('Error lazy loading module:', error);
      if (loadingCallback) {
        loadingCallback(false);
      }
      throw error;
    });
}

/**
 * Creates a placeholder element that loads the actual component when in viewport
 * @param {string} elementType - HTML element type for the placeholder
 * @param {Function} importCallback - Function that returns a dynamic import
 * @param {Object} options - Configuration options
 * @returns {HTMLElement} - Placeholder element
 */
function createLazyElement(elementType, importCallback, options = {}) {
  const {
    className = '',
    loadingText = 'Loading...',
    errorText = 'Failed to load component',
    threshold = 0.1, // IntersectionObserver threshold
    placeholderHeight = '200px',
  } = options;
  
  // Create placeholder element
  const placeholder = document.createElement(elementType);
  placeholder.className = className + ' lazy-placeholder';
  placeholder.style.minHeight = placeholderHeight;
  placeholder.textContent = loadingText;
  
  // Set up IntersectionObserver to load when in viewport
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Stop observing once in viewport
        observer.unobserve(placeholder);
        
        // Load the component
        lazyLoad(importCallback)
          .then(module => {
            // Replace placeholder with actual component
            const parent = placeholder.parentNode;
            if (parent) {
              if (typeof module.default === 'function') {
                const component = module.default(placeholder.dataset);
                parent.replaceChild(component, placeholder);
              } else {
                placeholder.innerHTML = '';
                placeholder.appendChild(module.default);
                placeholder.classList.remove('lazy-placeholder');
              }
            }
          })
          .catch(() => {
            placeholder.textContent = errorText;
            placeholder.classList.add('error');
          });
      }
    });
  }, { threshold });
  
  // Start observing
  setTimeout(() => {
    observer.observe(placeholder);
  }, 0);
  
  return placeholder;
}

/**
 * Prefetches a module in the background during idle time
 * @param {Function} importCallback - Function that returns a dynamic import
 */
function prefetch(importCallback) {
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(() => {
      importCallback().catch(() => {});
    });
  } else {
    setTimeout(() => {
      importCallback().catch(() => {});
    }, 1000);
  }
}

module.exports = {
  lazyLoad,
  createLazyElement,
  prefetch
}; 