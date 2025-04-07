const { LanguageModel } = require('../src/js/models/LanguageModel');

describe('LanguageModel', () => {
  let languageModel;

  beforeEach(() => {
    languageModel = new LanguageModel();
  });

  describe('detectLanguage', () => {
    it('should detect English text', () => {
      const text = 'This is a sample English text for testing language detection.';
      const result = languageModel.detectLanguage(text);

      expect(result).toBeDefined();
      expect(result.code).toBe('en');
      expect(result.probability).toBeGreaterThan(0.8);
      expect(result.confidence).toBeGreaterThan(0.8);
    });

    it('should detect Spanish text', () => {
      const text = 'Este es un texto de ejemplo en español para probar la detección de idioma.';
      const result = languageModel.detectLanguage(text);

      expect(result).toBeDefined();
      expect(result.code).toBe('es');
      expect(result.probability).toBeGreaterThan(0.8);
      expect(result.confidence).toBeGreaterThan(0.8);
    });

    it('should detect French text', () => {
      const text = 'Ceci est un exemple de texte en français pour tester la détection de langue.';
      const result = languageModel.detectLanguage(text);

      expect(result).toBeDefined();
      expect(result.code).toBe('fr');
      expect(result.probability).toBeGreaterThan(0.8);
      expect(result.confidence).toBeGreaterThan(0.8);
    });

    it('should detect German text', () => {
      const text = 'Dies ist ein deutscher Beispieltext zum Testen der Spracherkennung.';
      const result = languageModel.detectLanguage(text);

      expect(result).toBeDefined();
      expect(result.code).toBe('de');
      expect(result.probability).toBeGreaterThan(0.8);
      expect(result.confidence).toBeGreaterThan(0.8);
    });

    it('should handle empty text', () => {
      const result = languageModel.detectLanguage('');
      expect(result).toBeNull();
    });

    it('should handle text with mixed languages', () => {
      const text = 'This is a mixed text avec des mots en français and some palabras en español.';
      const result = languageModel.detectLanguage(text);

      expect(result).toBeDefined();
      expect(result.confidence).toBeLessThan(0.8);
    });
  });

  describe('analyzeLanguageFeatures', () => {
    it('should analyze English text features', () => {
      const text = 'The quick brown fox jumps over the lazy dog.';
      const result = languageModel.analyzeLanguageFeatures(text, 'en');

      expect(result).toBeDefined();
      expect(result.wordCount).toBe(9);
      expect(result.patterns.articles.count).toBeGreaterThan(0);
      expect(result.patterns.prepositions.count).toBeGreaterThan(0);
      expect(result.metrics).toBeDefined();
    });

    it('should analyze Spanish text features', () => {
      const text = 'El gato negro salta sobre el perro perezoso.';
      const result = languageModel.analyzeLanguageFeatures(text, 'es');

      expect(result).toBeDefined();
      expect(result.wordCount).toBe(8);
      expect(result.patterns.articles.count).toBeGreaterThan(0);
      expect(result.patterns.prepositions.count).toBeGreaterThan(0);
      expect(result.metrics).toBeDefined();
    });

    it('should handle invalid language code', () => {
      const text = 'Some sample text.';
      const result = languageModel.analyzeLanguageFeatures(text, 'invalid');

      expect(result).toBeNull();
    });

    it('should handle empty text', () => {
      const result = languageModel.analyzeLanguageFeatures('', 'en');
      expect(result).toBeNull();
    });
  });

  describe('compareLanguageFeatures', () => {
    it('should compare texts in the same language', () => {
      const text1 = 'This is the first sample text.';
      const text2 = 'This is another sample text.';
      const result = languageModel.compareLanguageFeatures(text1, text2);

      expect(result).toBeDefined();
      expect(result.languages.text1.code).toBe('en');
      expect(result.languages.text2.code).toBe('en');
      expect(result.similarity).toBeGreaterThan(0);
      expect(result.differences).toBeDefined();
    });

    it('should compare texts in different languages', () => {
      const text1 = 'This is an English text.';
      const text2 = 'Esto es un texto en español.';
      const result = languageModel.compareLanguageFeatures(text1, text2);

      expect(result).toBeDefined();
      expect(result.languages.text1.code).toBe('en');
      expect(result.languages.text2.code).toBe('es');
      expect(result.similarity).toBeLessThan(0.5);
    });

    it('should handle empty texts', () => {
      const result = languageModel.compareLanguageFeatures('', '');
      expect(result).toBeNull();
    });
  });

  describe('calculateFeatureSimilarity', () => {
    it('should calculate similarity between similar analyses', () => {
      const analysis1 = {
        metrics: {
          averageWordLength: 4.5,
          complexityScore: 0.6
        }
      };
      const analysis2 = {
        metrics: {
          averageWordLength: 4.7,
          complexityScore: 0.65
        }
      };

      const similarity = languageModel.calculateFeatureSimilarity(analysis1, analysis2);
      expect(similarity).toBeGreaterThan(0.8);
    });

    it('should calculate similarity between different analyses', () => {
      const analysis1 = {
        metrics: {
          averageWordLength: 4.5,
          complexityScore: 0.6
        }
      };
      const analysis2 = {
        metrics: {
          averageWordLength: 6.2,
          complexityScore: 0.9
        }
      };

      const similarity = languageModel.calculateFeatureSimilarity(analysis1, analysis2);
      expect(similarity).toBeLessThan(0.8);
    });
  });
}); 