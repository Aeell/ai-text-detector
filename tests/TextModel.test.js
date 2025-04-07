const { TextModel } = require('../src/js/models/TextModel');

describe('TextModel', () => {
  let textModel;

  beforeEach(() => {
    textModel = new TextModel();
  });

  describe('analyze', () => {
    it('should analyze text and return metrics', () => {
      const text = 'This is a sample text for testing. It contains multiple sentences and various words.';
      const result = textModel.analyze(text);

      expect(result).toBeDefined();
      expect(result.wordCount).toBe(13);
      expect(result.sentenceCount).toBe(2);
      expect(result.averageWordLength).toBeGreaterThan(0);
      expect(result.uniqueWords).toBeDefined();
      expect(result.lexicalDensity).toBeGreaterThan(0);
      expect(result.readabilityScore).toBeGreaterThan(0);
    });

    it('should handle empty text', () => {
      const result = textModel.analyze('');

      expect(result).toBeDefined();
      expect(result.wordCount).toBe(0);
      expect(result.sentenceCount).toBe(0);
      expect(result.averageWordLength).toBe(0);
      expect(result.uniqueWords).toBe(0);
      expect(result.lexicalDensity).toBe(0);
      expect(result.readabilityScore).toBe(0);
    });

    it('should handle text with special characters', () => {
      const text = 'This text has special characters: @#$%^&*()!';
      const result = textModel.analyze(text);

      expect(result).toBeDefined();
      expect(result.wordCount).toBe(6);
    });
  });

  describe('compareTexts', () => {
    it('should compare two texts and return similarity metrics', () => {
      const text1 = 'This is the first sample text.';
      const text2 = 'This is another sample text.';
      const result = textModel.compareTexts(text1, text2);

      expect(result).toBeDefined();
      expect(result.similarity).toBeGreaterThan(0);
      expect(result.similarity).toBeLessThan(1);
      expect(result.commonWords).toBeDefined();
      expect(result.differences).toBeDefined();
    });

    it('should handle identical texts', () => {
      const text = 'This is a sample text.';
      const result = textModel.compareTexts(text, text);

      expect(result).toBeDefined();
      expect(result.similarity).toBe(1);
      expect(result.commonWords.length).toBeGreaterThan(0);
      expect(result.differences.length).toBe(0);
    });

    it('should handle completely different texts', () => {
      const text1 = 'This is the first text.';
      const text2 = 'Something completely different.';
      const result = textModel.compareTexts(text1, text2);

      expect(result).toBeDefined();
      expect(result.similarity).toBeLessThan(0.5);
    });
  });

  describe('calculateReadabilityScore', () => {
    it('should calculate readability score for simple text', () => {
      const text = 'The cat sat on the mat.';
      const score = textModel.calculateReadabilityScore(text);

      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThan(100);
    });

    it('should calculate higher score for complex text', () => {
      const simpleText = 'The cat sat on the mat.';
      const complexText = 'The quantum mechanical properties of subatomic particles demonstrate fascinating characteristics of wave-particle duality.';
      
      const simpleScore = textModel.calculateReadabilityScore(simpleText);
      const complexScore = textModel.calculateReadabilityScore(complexText);

      expect(complexScore).toBeGreaterThan(simpleScore);
    });
  });

  describe('extractKeywords', () => {
    it('should extract keywords from text', () => {
      const text = 'Artificial intelligence and machine learning are transforming technology.';
      const keywords = textModel.extractKeywords(text);

      expect(keywords).toBeDefined();
      expect(keywords.length).toBeGreaterThan(0);
      expect(keywords).toContain('artificial');
      expect(keywords).toContain('intelligence');
    });

    it('should handle text with repeated words', () => {
      const text = 'The cat and the dog are friends. The cat likes the dog.';
      const keywords = textModel.extractKeywords(text);

      expect(keywords).toBeDefined();
      expect(keywords).toContain('cat');
      expect(keywords).toContain('dog');
    });
  });

  describe('analyzeSentiment', () => {
    it('should analyze sentiment of positive text', () => {
      const text = 'This is wonderful and amazing! I love it.';
      const sentiment = textModel.analyzeSentiment(text);

      expect(sentiment).toBeDefined();
      expect(sentiment.score).toBeGreaterThan(0);
      expect(sentiment.label).toBe('positive');
    });

    it('should analyze sentiment of negative text', () => {
      const text = 'This is terrible and horrible. I hate it.';
      const sentiment = textModel.analyzeSentiment(text);

      expect(sentiment).toBeDefined();
      expect(sentiment.score).toBeLessThan(0);
      expect(sentiment.label).toBe('negative');
    });

    it('should analyze sentiment of neutral text', () => {
      const text = 'The sky is blue. The grass is green.';
      const sentiment = textModel.analyzeSentiment(text);

      expect(sentiment).toBeDefined();
      expect(sentiment.label).toBe('neutral');
    });
  });
}); 