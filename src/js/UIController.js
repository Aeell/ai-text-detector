// UIController.js - UI interaction and management module
import { LanguageManager } from './LanguageManager';
import { StorageService } from '../services/StorageService';
import { AnalyticsService } from '../services/AnalyticsService';
import { Debug } from '../utils/Debug';

export class UIController {
  constructor() {
    this.languageManager = new LanguageManager();
    this.storage = new StorageService();
    this.analytics = new AnalyticsService();
    this.debug = Debug;
    this.initialize();
  }

  async initialize() {
    try {
      this.setupEventListeners();
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

  setupEventListeners() {
    try {
      // Text input handling
      const textInput = document.getElementById('inputText');
      if (textInput) {
        textInput.addEventListener('input', this.handleTextInput.bind(this));
        textInput.addEventListener('paste', this.handlePaste.bind(this));
      }

      // Analysis button
      const analyzeBtn = document.getElementById('analyzeBtn');
      if (analyzeBtn) {
        analyzeBtn.addEventListener('click', this.handleAnalyze.bind(this));
      }

      // Compare functionality
      const compareBtn = document.getElementById('compareBtn');
      if (compareBtn) {
        compareBtn.addEventListener('click', this.handleCompare.bind(this));
      }

      // Language selection
      const langSelect = document.getElementById('langSelect');
      if (langSelect) {
        langSelect.addEventListener('change', this.handleLanguageChange.bind(this));
      }

      // Theme toggle
      const themeToggle = document.getElementById('themeToggle');
      if (themeToggle) {
        themeToggle.addEventListener('click', this.handleThemeToggle.bind(this));
      }

      // Export options
      const exportBtn = document.getElementById('exportBtn');
      if (exportBtn) {
        exportBtn.addEventListener('click', this.handleExport.bind(this));
      }

      // Share functionality
      const shareBtn = document.getElementById('shareBtn');
      if (shareBtn) {
        shareBtn.addEventListener('click', this.handleShare.bind(this));
      }

      this.debug.logger.info('Event listeners setup complete');
    } catch (error) {
      this.debug.logger.error('Error setting up event listeners:', error);
      throw error;
    }
  }

  async loadUserPreferences() {
    try {
      const preferences = await this.storage.getUserPreferences();
      if (preferences) {
        this.applyUserPreferences(preferences);
      }
    } catch (error) {
      this.debug.logger.error('Error loading user preferences:', error);
      // Continue with defaults
    }
  }

  applyUserPreferences(preferences) {
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

  async handleTextInput(event) {
    try {
      const text = event.target.value;
      this.updateWordCount(text);
      await this.autoSave(text);
      this.analytics.trackTextInput(text.length);
    } catch (error) {
      this.debug.logger.error('Error handling text input:', error);
      this.showError('Error processing text input');
    }
  }

  async handleAnalyze() {
    try {
      const text = document.getElementById('inputText')?.value;
      if (!text) {
        this.showError('Please enter text to analyze');
        return;
      }

      this.showLoading();
      const results = await this.analyzeText(text);
      this.displayResults(results);
      this.analytics.trackAnalysis(results);
    } catch (error) {
      this.debug.logger.error('Error handling analysis:', error);
      this.showError('Error analyzing text');
    } finally {
      this.hideLoading();
    }
  }

  displayResults(results) {
    try {
      const { aiProbability, confidence, analysis } = results;
      
      // Update UI elements
      this.updateProbabilityDisplay(aiProbability, confidence);
      this.updateAnalysisDetails(analysis);
      this.highlightAIPatterns(analysis);
      
      // Show results section
      document.getElementById('results')?.classList.remove('hidden');
      
      this.debug.logger.info('Results displayed successfully');
    } catch (error) {
      this.debug.logger.error('Error displaying results:', error);
      this.showError('Error displaying results');
    }
  }

  updateProbabilityDisplay(probability, confidence) {
    const probabilityEl = document.getElementById('aiProbability');
    const confidenceEl = document.getElementById('confidence');
    
    if (probabilityEl) {
      probabilityEl.textContent = `${probability}%`;
      probabilityEl.className = this.getProbabilityClass(probability);
    }
    
    if (confidenceEl) {
      confidenceEl.textContent = `Confidence: ${confidence}%`;
    }
  }

  getProbabilityClass(probability) {
    if (probability >= 80) return 'high-probability';
    if (probability >= 50) return 'medium-probability';
    return 'low-probability';
  }

  showError(message) {
    const errorEl = document.getElementById('error');
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.classList.remove('hidden');
      setTimeout(() => errorEl.classList.add('hidden'), 5000);
    }
  }

  showLoading() {
    const loader = document.getElementById('loader');
    if (loader) loader.classList.remove('hidden');
  }

  hideLoading() {
    const loader = document.getElementById('loader');
    if (loader) loader.classList.add('hidden');
  }

  async autoSave(text) {
    try {
      await this.storage.saveText(text);
    } catch (error) {
      this.debug.logger.error('Error auto-saving text:', error);
      // Silent fail - don't interrupt user
    }
  }

  updateWordCount(text) {
    const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
    const wordCountEl = document.getElementById('wordCount');
    if (wordCountEl) {
      wordCountEl.textContent = `Words: ${wordCount}`;
    }
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
} 