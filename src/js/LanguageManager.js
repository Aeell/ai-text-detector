// LanguageManager.js - Language detection and management module
const { Debug } = require('../utils/Debug');

class LanguageManager {
  constructor() {
    this.debug = Debug;
    this.currentLanguage = 'en';
    this.translations = {};
    this.supportedLanguages = ['en', 'es', 'fr', 'de'];
  }

  async loadTranslations(language) {
    try {
      if (!this.supportedLanguages.includes(language)) {
        throw new Error(`Language ${language} is not supported`);
      }

      if (this.translations[language]) {
        return this.translations[language];
      }

      const response = await fetch(`../locales/${language}.json`);
      if (!response.ok) {
        throw new Error(`Failed to load translations for ${language}`);
      }

      const translations = await response.json();
      this.translations[language] = translations;

      return translations;
    } catch (error) {
      this.debug.logger.error('Error loading translations:', error);
      throw error;
    }
  }

  async setLanguage(language) {
    try {
      const translations = await this.loadTranslations(language);
      this.currentLanguage = language;
      this.updateUI(translations);
      return true;
    } catch (error) {
      this.debug.logger.error('Error setting language:', error);
      return false;
    }
  }

  updateUI(translations) {
    try {
      document.documentElement.lang = this.currentLanguage;

      const elements = document.querySelectorAll('[data-i18n]');
      elements.forEach(element => {
        const key = element.getAttribute('data-i18n');
        const translation = this.getNestedTranslation(translations, key);

        if (translation) {
          if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
            if (element.getAttribute('placeholder')) {
              element.setAttribute('placeholder', translation);
            } else {
              element.value = translation;
            }
          } else {
            element.textContent = translation;
          }
        }
      });

      // Update meta tags
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription && translations.meta?.description) {
        metaDescription.setAttribute('content', translations.meta.description);
      }

      this.debug.logger.info(`UI updated to language: ${this.currentLanguage}`);
    } catch (error) {
      this.debug.logger.error('Error updating UI with translations:', error);
    }
  }

  getNestedTranslation(obj, path) {
    try {
      return path.split('.').reduce((p, c) => p?.[c], obj);
    } catch (error) {
      this.debug.logger.error('Error getting nested translation:', error);
      return null;
    }
  }

  getCurrentLanguage() {
    return this.currentLanguage;
  }

  getSupportedLanguages() {
    return this.supportedLanguages;
  }

  translate(key, variables = {}) {
    try {
      const translations = this.translations[this.currentLanguage];
      if (!translations) {
        throw new Error(`Translations not loaded for ${this.currentLanguage}`);
      }

      let translation = this.getNestedTranslation(translations, key);
      if (!translation) {
        this.debug.logger.warn(`Translation key not found: ${key}`);
        return key;
      }

      // Replace variables in translation
      Object.entries(variables).forEach(([key, value]) => {
        translation = translation.replace(`{${key}}`, value);
      });

      return translation;
    } catch (error) {
      this.debug.logger.error('Error translating key:', error);
      return key;
    }
  }
}

module.exports = { LanguageManager }; 
} 