// UIController.js - UI interaction and management module
import { LanguageManager } from './LanguageManager';
import { StorageService } from '../services/StorageService';
import { AnalyticsService } from '../services/AnalyticsService';
import { Debug } from '../utils/Debug';

const { marked } = require('marked');
const DOMPurify = require('dompurify');

export class UIController {
  constructor(aiDetector, storageService, analyticsService) {
    this.debug = new Debug('UIController');
    this.aiDetector = aiDetector;
    this.storage = storageService;
    this.analytics = analyticsService;
    
    // Cache DOM elements
    this.elements = {
      textInput: document.getElementById('textInput'),
      analyzeBtn: document.getElementById('analyzeBtn'),
      clearBtn: document.getElementById('clearBtn'),
      results: document.getElementById('results'),
      loading: document.getElementById('loadingIndicator'),
      error: document.getElementById('error'),
      aiProbability: document.getElementById('aiProbability'),
      confidenceScore: document.getElementById('confidenceScore'),
      detectedLanguage: document.getElementById('detectedLanguage'),
      textMetrics: document.getElementById('textMetrics'),
      themeToggle: document.getElementById('themeToggle'),
      languageSelect: document.getElementById('languageSelect'),
      settingsModal: document.getElementById('settingsModal'),
      saveSettings: document.getElementById('saveSettings'),
      closeSettings: document.getElementById('closeSettings')
    };

    this.preferences = this.storage.getUserPreferences();
    this.languageManager = new LanguageManager();
    this.setupMarkdownRenderer();
    this.initialize();
  }

  async initialize() {
    try {
      this.bindEventListeners();
      await this.loadUserPreferences();
      this.setupTheme();
      this.setupLanguage();
      this.setupAccessibility();
      this.debug.logger.info('UIController initialized successfully');
    } catch (error) {
      this.debug.logger.error('Error initializing UIController:', error);
      throw error;
    }
  }

  setupMarkdownRenderer() {
    marked.setOptions({
      renderer: new marked.Renderer(),
      gfm: true,
      breaks: true,
      sanitize: false,
      smartLists: true,
      smartypants: true
    });
  }

  bindEventListeners() {
    // Analyze text
    this.elements.analyzeBtn.addEventListener('click', () => this.handleAnalyze());
    this.elements.textInput.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.key === 'Enter') {
        this.handleAnalyze();
      }
    });

    // Clear text
    this.elements.clearBtn.addEventListener('click', () => this.handleClear());

    // Theme toggle
    this.elements.themeToggle.addEventListener('click', () => this.toggleTheme());

    // Language selection
    this.elements.languageSelect.addEventListener('change', (e) => 
      this.handleLanguageChange(e.target.value)
    );

    // Settings
    this.elements.saveSettings.addEventListener('click', () => this.saveSettings());
    this.elements.closeSettings.addEventListener('click', () => this.closeSettings());

    // Handle errors gracefully
    window.addEventListener('error', (e) => this.handleError(e));
    window.addEventListener('unhandledrejection', (e) => this.handleError(e));
  }

  async loadUserPreferences() {
    try {
      const preferences = await this.storage.getUserPreferences();
      if (preferences) {
        this.applyPreferences(preferences);
      }
    } catch (error) {
      this.debug.logger.error('Error loading user preferences:', error);
      // Continue with defaults
    }
  }

  applyPreferences(preferences) {
    try {
      const { theme, language, fontSize, accessibility } = preferences;
      
      if (theme) this.setTheme(theme);
      if (language) this.setLanguage(language);
      if (fontSize) this.setFontSize(fontSize);
      if (accessibility) this.setAccessibilityOptions(accessibility);
      
      this.debug.logger.info('User preferences applied');
    } catch (error) {
      this.debug.logger.error('Error applying user preferences:', error);
      throw error;
    }
  }

  setupTheme() {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const savedTheme = this.storage.getItem('theme');
    const theme = savedTheme || (prefersDark ? 'dark' : 'light');
    this.setTheme(theme);
  }

  setupLanguage() {
    const savedLang = this.storage.getItem('language');
    const browserLang = navigator.language.split('-')[0].toUpperCase();
    const language = savedLang || this.languageManager.getSupportedLanguage(browserLang) || 'ENG';
    this.setLanguage(language);
  }

  setupAccessibility() {
    try {
      // Add skip link for keyboard navigation
      this.addSkipLink();
      
      // Ensure proper ARIA labels
      this.setupAriaLabels();
      
      // Add keyboard shortcuts
      this.setupKeyboardShortcuts();
      
      this.debug.logger.info('Accessibility setup complete');
    } catch (error) {
      this.debug.logger.error('Error setting up accessibility:', error);
      throw error;
    }
  }

  async handleAnalyze() {
    const text = this.elements.textInput.value.trim();
    
    if (!text) {
      this.showError('Please enter some text to analyze.');
      return;
    }

    try {
      this.showLoading();
      this.analytics.trackEvent('analyze_text', { length: text.length });

      const startTime = performance.now();
      const results = await this.aiDetector.analyzeText(text);
      const endTime = performance.now();

      this.analytics.trackPerformance('analysis_time', endTime - startTime);
      this.displayResults(results);
    } catch (error) {
      this.debug.logger.error('Analysis failed:', error);
      this.showError('Failed to analyze text. Please try again.');
    } finally {
      this.hideLoading();
    }
  }

  displayResults(results) {
    this.hideError();
    
    // Update main metrics
    this.elements.aiProbability.textContent = 
      `${(results.aiProbability * 100).toFixed(1)}%`;
    this.elements.confidenceScore.textContent = 
      `${(results.confidence * 100).toFixed(1)}%`;
    this.elements.detectedLanguage.textContent = 
      results.language.name || results.language.code;

    // Update detailed metrics
    this.elements.textMetrics.innerHTML = this.generateMetricsHTML(results.metrics);

    // Show results
    this.elements.results.classList.remove('hidden');

    // Track successful analysis
    this.analytics.trackEvent('results_displayed', {
      aiProbability: results.aiProbability,
      confidence: results.confidence,
      language: results.language.code
    });
  }

  generateMetricsHTML(metrics) {
    return Object.entries(metrics)
      .map(([key, value]) => `
        <div class="metric">
          <h3>${this.formatMetricName(key)}</h3>
          <div class="metric-value">${this.formatMetricValue(value)}</div>
        </div>
      `)
      .join('');
  }

  formatMetricName(key) {
    return key
      .split(/(?=[A-Z])/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  formatMetricValue(value) {
    if (typeof value === 'number') {
      return value.toFixed(2);
    }
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    return value.toString();
  }

  handleClear() {
    this.elements.textInput.value = '';
    this.elements.results.classList.add('hidden');
    this.elements.error.classList.add('hidden');
    this.analytics.trackEvent('clear_text');
  }

  toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    this.preferences.theme = newTheme;
    this.storage.saveUserPreferences(this.preferences);
    this.analytics.trackEvent('theme_change', { theme: newTheme });
  }

  handleLanguageChange(language) {
    this.preferences.language = language;
    this.storage.saveUserPreferences(this.preferences);
    this.analytics.trackEvent('language_change', { language });
  }

  setTheme(theme) {
    document.body.dataset.theme = theme;
    this.storage.setItem('theme', theme);
  }

  setLanguage(language) {
    this.languageManager.setLanguage(language);
    this.storage.setItem('language', language);
  }

  setFontSize(size) {
    document.documentElement.style.fontSize = size;
    this.storage.setItem('fontSize', size);
  }

  addSkipLink() {
    const skipLink = document.createElement('a');
    skipLink.href = '#main';
    skipLink.className = 'skip-link';
    skipLink.textContent = 'Skip to main content';
    document.body.insertBefore(skipLink, document.body.firstChild);
  }

  setupAriaLabels() {
    const elements = document.querySelectorAll('[data-aria-label]');
    elements.forEach(el => {
      el.setAttribute('aria-label', el.dataset.ariaLabel);
    });
  }

  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Ctrl/Cmd + Enter to analyze
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        this.handleAnalyze();
      }
      // Ctrl/Cmd + S to save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        this.handleExport();
      }
    });
  }

  showLoading() {
    this.elements.loading.classList.remove('hidden');
    this.elements.analyzeBtn.disabled = true;
  }

  hideLoading() {
    this.elements.loading.classList.add('hidden');
    this.elements.analyzeBtn.disabled = false;
  }

  showError(message) {
    this.elements.error.textContent = message;
    this.elements.error.classList.remove('hidden');
    this.debug.logger.error(message);
  }

  hideError() {
    this.elements.error.classList.add('hidden');
  }

  handleError(error) {
    this.debug.logger.error('Unhandled error:', error);
    this.showError('An unexpected error occurred. Please try again.');
    this.analytics.trackEvent('error', {
      message: error.message,
      stack: error.stack
    });
  }

  async handleExport() {
    try {
      const text = this.elements.textInput.value;
      await this.storage.saveText(text);
      this.showNotification('Text saved successfully');
    } catch (error) {
      this.debug.logger.error('Error handling export:', error);
      this.showError('Error saving text');
    }
  }

  showNotification(message, type = 'info') {
    const toast = document.getElementById('notificationToast');
    if (!toast) return;

    const messageElement = toast.querySelector('p');
    if (messageElement) {
      messageElement.textContent = message;
    }

    toast.className = `notification-toast ${type}`;
    toast.setAttribute('aria-hidden', 'false');

    // Auto-hide after 5 seconds
    setTimeout(() => {
      this.hideNotification();
    }, 5000);
  }

  hideNotification() {
    const toast = document.getElementById('notificationToast');
    if (toast) {
      toast.setAttribute('aria-hidden', 'true');
    }
  }

  saveSettings() {
    const newPreferences = {
      ...this.preferences,
      fontSize: document.getElementById('fontSize').value,
      accessibility: {
        highContrast: document.getElementById('highContrast').checked,
        reducedMotion: document.getElementById('reducedMotion').checked
      }
    };

    this.preferences = newPreferences;
    this.storage.saveUserPreferences(newPreferences);
    this.applyPreferences(newPreferences);
    this.closeSettings();
    this.analytics.trackEvent('settings_saved', newPreferences);
  }

  closeSettings() {
    this.elements.settingsModal.classList.add('hidden');
  }
}

module.exports = { UIController }; 