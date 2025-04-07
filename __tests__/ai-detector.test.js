import { AIDetector } from '../ai-detector.js';

describe('AIDetector', () => {
  let detector;

  beforeEach(() => {
    detector = new AIDetector();
  });

  describe('analyzeTextDetailed', () => {
    it('should return analysis results with correct properties', () => {
      const text = 'This is a test sentence. This is another sentence.';
      const result = detector.analyzeTextDetailed(text);

      expect(result).toHaveProperty('aiScore');
      expect(result).toHaveProperty('confidence');
      expect(result).toHaveProperty('metrics');
      expect(result).toHaveProperty('wordCount');
      expect(result).toHaveProperty('sentenceCount');
    });

    it('should handle empty text', () => {
      const result = detector.analyzeTextDetailed('');

      expect(result.aiScore).toBe(0);
      expect(result.wordCount).toBe(0);
      expect(result.sentenceCount).toBe(0);
    });

    it('should calculate correct word and sentence counts', () => {
      const text = 'First sentence. Second sentence with more words.';
      const result = detector.analyzeTextDetailed(text);

      expect(result.wordCount).toBe(7);
      expect(result.sentenceCount).toBe(2);
    });
  });

  describe('analyzeSentiment', () => {
    it('should return sentiment analysis with correct properties', () => {
      const text = 'This is a good and happy test.';
      const result = detector.analyzeSentiment(text);

      expect(result).toHaveProperty('score');
      expect(result).toHaveProperty('sentiment');
      expect(result).toHaveProperty('confidence');
      expect(result).toHaveProperty('positiveWords');
      expect(result).toHaveProperty('negativeWords');
    });

    it('should correctly identify positive sentiment', () => {
      const text = 'This is excellent and wonderful.';
      const result = detector.analyzeSentiment(text);

      expect(result.sentiment).toBe('positive');
      expect(result.positiveWords.length).toBeGreaterThan(0);
    });

    it('should correctly identify negative sentiment', () => {
      const text = 'This is terrible and horrible.';
      const result = detector.analyzeSentiment(text);

      expect(result.sentiment).toBe('negative');
      expect(result.negativeWords.length).toBeGreaterThan(0);
    });
  });

  describe('calculateAdvancedReadability', () => {
    it('should return readability metrics with correct properties', () => {
      const text = 'This is a test sentence. This is another sentence for testing readability scores.';
      const result = detector.calculateAdvancedReadability(text);

      expect(result).toHaveProperty('fleschKincaid');
      expect(result).toHaveProperty('gunningFog');
      expect(result).toHaveProperty('smog');
      expect(result).toHaveProperty('automatedReadability');
    });

    it('should handle text with varying complexity', () => {
      const simpleText = 'The cat sat on the mat.';
      const complexText = 'The intricate methodology demonstrated unprecedented sophistication in theoretical applications.';

      const simpleResult = detector.calculateAdvancedReadability(simpleText);
      const complexResult = detector.calculateAdvancedReadability(complexText);

      expect(simpleResult.fleschKincaid).toBeGreaterThan(complexResult.fleschKincaid);
      expect(simpleResult.gunningFog).toBeLessThan(complexResult.gunningFog);
    });
  });
}); 