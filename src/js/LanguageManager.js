// LanguageManager.js - Language detection and management module
import { Debug } from '../utils/Debug';

export class LanguageManager {
  constructor() {
    this.debug = Debug;
    this.currentLanguage = 'ENG';
    this.supportedLanguages = new Set(['ENG', 'ESP', 'FRA', 'DEU', 'ITA', 'POR', 'RUS', 'CHN', 'JPN', 'KOR']);
    this.translations = {};
    this.initialize();
  }

  async initialize() {
    try {
      await this.loadTranslations();
      this.debug.logger.info('LanguageManager initialized successfully');
    } catch (error) {
      this.debug.logger.error('Error initializing LanguageManager:', error);
      throw error;
    }
  }

  async loadTranslations() {
    try {
      // Load translations for all supported languages
      for (const lang of this.supportedLanguages) {
        this.translations[lang] = await import(`../locales/${lang.toLowerCase()}.json`);
      }
      this.debug.logger.info('Translations loaded successfully');
    } catch (error) {
      this.debug.logger.error('Error loading translations:', error);
      throw error;
    }
  }

  setLanguage(language) {
    try {
      const normalizedLang = language.toUpperCase();
      if (!this.supportedLanguages.has(normalizedLang)) {
        throw new Error(`Language ${language} is not supported`);
      }
      
      this.currentLanguage = normalizedLang;
      this.updateUILanguage();
      this.debug.logger.info(`Language set to ${normalizedLang}`);
    } catch (error) {
      this.debug.logger.error('Error setting language:', error);
      throw error;
    }
  }

  updateUILanguage() {
    try {
      const elements = document.querySelectorAll('[data-i18n]');
      elements.forEach(el => {
        const key = el.dataset.i18n;
        const translation = this.getTranslation(key);
        if (translation) {
          if (el.tagName === 'INPUT' && el.type === 'placeholder') {
            el.placeholder = translation;
          } else {
            el.textContent = translation;
          }
        }
      });
      
      document.documentElement.lang = this.currentLanguage.toLowerCase();
      this.debug.logger.info('UI language updated successfully');
    } catch (error) {
      this.debug.logger.error('Error updating UI language:', error);
      throw error;
    }
  }

  getTranslation(key) {
    try {
      return this.translations[this.currentLanguage]?.[key] || key;
    } catch (error) {
      this.debug.logger.error(`Error getting translation for key ${key}:`, error);
      return key;
    }
  }

  getSupportedLanguage(language) {
    const normalizedLang = language.toUpperCase();
    return this.supportedLanguages.has(normalizedLang) ? normalizedLang : null;
  }

  async detectLanguage(text) {
    try {
      // Basic language detection using character frequency analysis
      const langScores = new Map();
      
      // Calculate character frequency
      const charFreq = this.calculateCharacterFrequency(text);
      
      // Compare with language patterns
      for (const lang of this.supportedLanguages) {
        const score = this.calculateLanguageScore(charFreq, lang);
        langScores.set(lang, score);
      }
      
      // Get the language with highest score
      const [detectedLang] = Array.from(langScores.entries())
        .sort((a, b) => b[1] - a[1])[0];
      
      this.debug.logger.info(`Language detected: ${detectedLang}`);
      return detectedLang;
    } catch (error) {
      this.debug.logger.error('Error detecting language:', error);
      return this.currentLanguage;
    }
  }

  calculateCharacterFrequency(text) {
    const freq = new Map();
    const total = text.length;
    
    for (const char of text.toLowerCase()) {
      freq.set(char, (freq.get(char) || 0) + 1);
    }
    
    // Convert to percentages
    for (const [char, count] of freq) {
      freq.set(char, count / total);
    }
    
    return freq;
  }

  calculateLanguageScore(charFreq, language) {
    // Language character frequency patterns (simplified)
    const patterns = {
      ENG: new Map([['e', 0.13], ['t', 0.09], ['a', 0.08], ['o', 0.08], ['i', 0.07]]),
      ESP: new Map([['e', 0.14], ['a', 0.12], ['o', 0.09], ['s', 0.08], ['n', 0.07]]),
      FRA: new Map([['e', 0.15], ['a', 0.08], ['s', 0.08], ['i', 0.07], ['t', 0.07]]),
      DEU: new Map([['e', 0.16], ['n', 0.10], ['i', 0.08], ['s', 0.07], ['r', 0.07]]),
      // Add patterns for other languages
    };
    
    const pattern = patterns[language];
    if (!pattern) return 0;
    
    let score = 0;
    for (const [char, expectedFreq] of pattern) {
      const actualFreq = charFreq.get(char) || 0;
      score += 1 - Math.abs(expectedFreq - actualFreq);
    }
    
    return score / pattern.size;
  }

  isRTL(language) {
    const rtlLanguages = new Set(['ARA', 'HEB', 'FAR']);
    return rtlLanguages.has(language);
  }

  getLanguageFont(language) {
    const fontMap = {
      CHN: "'Noto Sans SC', sans-serif",
      JPN: "'Noto Sans JP', sans-serif",
      KOR: "'Noto Sans KR', sans-serif",
      // Add other language-specific fonts
    };
    return fontMap[language] || 'inherit';
  }
} 