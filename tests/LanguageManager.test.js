const { LanguageManager } = require('../src/js/LanguageManager');

// Mock fetch
global.fetch = jest.fn(() => 
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({
      app: {
        title: "AI Text Detector",
        description: "Detect AI generated text with advanced analysis."
      },
      nav: {
        home: "Home",
        about: "About"
      }
    })
  })
);

describe('LanguageManager', () => {
  let languageManager;

  beforeEach(() => {
    // Clear fetch mocks
    fetch.mockClear();
    
    // Create a new instance for each test
    languageManager = new LanguageManager();
  });

  describe('Initialization', () => {
    it('should initialize with English as default language', () => {
      expect(languageManager.currentLanguage).toBe('en');
    });

    it('should have support for multiple languages', () => {
      expect(languageManager.supportedLanguages.length).toBeGreaterThan(1);
      expect(languageManager.supportedLanguages).toContain('en');
      expect(languageManager.supportedLanguages).toContain('es');
    });
  });

  describe('Language Loading', () => {
    it('should load translations for a language', async () => {
      await languageManager.loadTranslation('en');
      
      expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/locales/eng.json'));
      expect(languageManager.translations.en).toBeDefined();
      expect(languageManager.translations.en.app.title).toBe('AI Text Detector');
    });

    it('should handle failures when loading translations', async () => {
      // Mock a failed fetch
      fetch.mockImplementationOnce(() => Promise.reject(new Error('Network error')));
      
      // Should not throw but log error
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      await languageManager.loadTranslation('fr');
      
      expect(consoleSpy).toHaveBeenCalled();
      expect(languageManager.translations.fr).toBeUndefined();
      
      consoleSpy.mockRestore();
    });
  });

  describe('Language Operations', () => {
    beforeEach(async () => {
      // Load translations
      await languageManager.loadTranslation('en');
    });

    it('should get a translation string by key', () => {
      expect(languageManager.getString('app.title')).toBe('AI Text Detector');
      expect(languageManager.getString('nav.home')).toBe('Home');
    });

    it('should return the key if translation is not found', () => {
      expect(languageManager.getString('nonexistent.key')).toBe('nonexistent.key');
    });

    it('should change the current language', async () => {
      await languageManager.setLanguage('es');
      
      expect(languageManager.currentLanguage).toBe('es');
      expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/locales/esp.json'));
    });

    it('should not change language if not supported', async () => {
      const originalLanguage = languageManager.currentLanguage;
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      await languageManager.setLanguage('xx');
      
      expect(languageManager.currentLanguage).toBe(originalLanguage);
      expect(consoleSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });
  });

  describe('Fallback Mechanism', () => {
    beforeEach(async () => {
      // Load translations
      await languageManager.loadTranslation('en');
      
      // Mock another language with partial translations
      languageManager.translations.pt = {
        app: {
          title: "Detector de Texto IA"
          // description is missing
        }
      };
      languageManager.currentLanguage = 'pt';
    });

    it('should fall back to English for missing translations', () => {
      expect(languageManager.getString('app.title')).toBe('Detector de Texto IA');
      expect(languageManager.getString('app.description')).toBe('Detect AI generated text with advanced analysis.');
    });

    it('should return the key for strings missing in all languages', () => {
      expect(languageManager.getString('nonexistent.key')).toBe('nonexistent.key');
    });
  });

  describe('Translation Interpolation', () => {
    beforeEach(async () => {
      // Mock translations with variables
      languageManager.translations.en = {
        messages: {
          welcome: "Welcome, {{name}}!",
          result: "Analysis complete with {{score}}% confidence."
        }
      };
    });

    it('should interpolate variables in translation strings', () => {
      const welcomeMsg = languageManager.getString('messages.welcome', { name: 'User' });
      expect(welcomeMsg).toBe('Welcome, User!');
      
      const resultMsg = languageManager.getString('messages.result', { score: 95 });
      expect(resultMsg).toBe('Analysis complete with 95% confidence.');
    });

    it('should handle missing variables in translation strings', () => {
      const welcomeMsg = languageManager.getString('messages.welcome');
      expect(welcomeMsg).toBe('Welcome, {{name}}!');
    });
  });

  describe('Language Detection', () => {
    it('should detect language from text with high confidence', () => {
      const englishText = "This is a sample text in English with sufficient length to detect confidently.";
      const spanishText = "Este es un texto de muestra en español con suficiente longitud para detectar con confianza.";
      const frenchText = "Ceci est un exemple de texte en français avec une longueur suffisante pour détecter avec confiance.";
      
      const englishResult = languageManager.detectLanguage(englishText);
      expect(englishResult.code).toBe('en');
      expect(englishResult.confidence).toBeGreaterThan(0.8);
      
      const spanishResult = languageManager.detectLanguage(spanishText);
      expect(spanishResult.code).toBe('es');
      expect(spanishResult.confidence).toBeGreaterThan(0.8);
      
      const frenchResult = languageManager.detectLanguage(frenchText);
      expect(frenchResult.code).toBe('fr');
      expect(frenchResult.confidence).toBeGreaterThan(0.8);
    });

    it('should have lower confidence for very short text', () => {
      const shortText = "Hello";
      const result = languageManager.detectLanguage(shortText);
      
      expect(result.code).toBeDefined();
      expect(result.confidence).toBeLessThan(0.8);
    });

    it('should handle empty or invalid input', () => {
      const emptyResult = languageManager.detectLanguage('');
      expect(emptyResult.code).toBe('en'); // Default to English
      expect(emptyResult.confidence).toBeLessThan(0.5);
      
      const nullResult = languageManager.detectLanguage(null);
      expect(nullResult.code).toBe('en');
      expect(nullResult.confidence).toBeLessThan(0.5);
    });
  });

  describe('Localization Helpers', () => {
    it('should format dates according to locale', () => {
      const date = new Date(2023, 0, 15); // January 15, 2023
      
      languageManager.currentLanguage = 'en';
      const enDate = languageManager.formatDate(date);
      expect(enDate).toMatch(/January|Jan/);
      
      languageManager.currentLanguage = 'es';
      const esDate = languageManager.formatDate(date);
      expect(esDate).toMatch(/enero|ene/);
    });

    it('should format numbers according to locale', () => {
      const number = 1234567.89;
      
      languageManager.currentLanguage = 'en';
      const enNumber = languageManager.formatNumber(number);
      expect(enNumber).toContain('1,234,567');
      
      languageManager.currentLanguage = 'de';
      const deNumber = languageManager.formatNumber(number);
      expect(deNumber.replace(/\s/g, '')).toContain('1.234.567');
    });
  });
}); 