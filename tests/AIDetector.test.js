import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AIDetector } from '../src/js/AIDetector';
import { TextModel } from '../src/js/models/TextModel';
import { LanguageModel } from '../src/js/models/LanguageModel';

describe('AIDetector', () => {
  let aiDetector;
  let textModel;
  let languageModel;

  beforeEach(() => {
    textModel = new TextModel();
    languageModel = new LanguageModel();
    aiDetector = new AIDetector(textModel, languageModel);
  });

  describe('analyzeText', () => {
    it('should analyze human-written text correctly', async () => {
      const humanText = `
        The sun was setting behind the mountains, casting long shadows across
        the valley below. Birds chirped their evening songs as a cool breeze
        rustled through the trees. I watched this peaceful scene, lost in
        thought about the day's events.
      `;

      const result = await aiDetector.analyzeText(humanText);

      expect(result).toBeDefined();
      expect(result.aiProbability).toBeLessThan(0.5);
      expect(result.confidence).toBeGreaterThan(0.7);
      expect(result.language).toBe('en');
    });

    it('should analyze AI-generated text correctly', async () => {
      const aiText = `
        The implementation of artificial intelligence in modern society
        presents both opportunities and challenges. Studies indicate that AI
        technology can enhance productivity across various sectors while
        simultaneously raising ethical concerns regarding privacy and
        automation. Furthermore, the integration of machine learning
        algorithms has demonstrated significant improvements in data
        analysis capabilities.
      `;

      const result = await aiDetector.analyzeText(aiText);

      expect(result).toBeDefined();
      expect(result.aiProbability).toBeGreaterThan(0.5);
      expect(result.confidence).toBeGreaterThan(0.7);
      expect(result.language).toBe('en');
    });

    it('should handle empty text', async () => {
      await expect(aiDetector.analyzeText('')).rejects.toThrow('No text provided');
    });

    it('should handle non-string input', async () => {
      await expect(aiDetector.analyzeText(123)).rejects.toThrow('Invalid input type');
    });
  });

  describe('compareTexts', () => {
    it('should compare two texts and return similarity score', async () => {
      const text1 = 'The quick brown fox jumps over the lazy dog.';
      const text2 = 'The fast brown fox leaps over the sleepy dog.';

      const result = await aiDetector.compareTexts(text1, text2);

      expect(result).toBeDefined();
      expect(result.similarity).toBeGreaterThan(0);
      expect(result.similarity).toBeLessThan(1);
      expect(result.text1Analysis).toBeDefined();
      expect(result.text2Analysis).toBeDefined();
    });

    it('should handle identical texts', async () => {
      const text = 'The quick brown fox jumps over the lazy dog.';

      const result = await aiDetector.compareTexts(text, text);

      expect(result).toBeDefined();
      expect(result.similarity).toBe(1);
    });

    it('should handle completely different texts', async () => {
      const text1 = 'The quick brown fox jumps over the lazy dog.';
      const text2 = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.';

      const result = await aiDetector.compareTexts(text1, text2);

      expect(result).toBeDefined();
      expect(result.similarity).toBeLessThan(0.3);
    });

    it('should handle empty texts', async () => {
      await expect(aiDetector.compareTexts('', '')).rejects.toThrow('Both texts are required');
    });
  });

  describe('calculateAIProbability', () => {
    it('should return a probability between 0 and 1', () => {
      const metrics = {
        repetitionScore: 0.3,
        sentenceVariance: 0.7,
        textLengthRatio: 0.5,
        transitionPhraseCount: 5,
        readabilityScore: 0.6
      };

      const probability = aiDetector.calculateAIProbability(metrics);

      expect(probability).toBeGreaterThanOrEqual(0);
      expect(probability).toBeLessThanOrEqual(1);
    });

    it('should handle extreme values', () => {
      const highMetrics = {
        repetitionScore: 1,
        sentenceVariance: 1,
        textLengthRatio: 1,
        transitionPhraseCount: 20,
        readabilityScore: 1
      };

      const lowMetrics = {
        repetitionScore: 0,
        sentenceVariance: 0,
        textLengthRatio: 0,
        transitionPhraseCount: 0,
        readabilityScore: 0
      };

      const highProbability = aiDetector.calculateAIProbability(highMetrics);
      const lowProbability = aiDetector.calculateAIProbability(lowMetrics);

      expect(highProbability).toBeGreaterThan(0.8);
      expect(lowProbability).toBeLessThan(0.2);
    });
  });

  describe('calculateConfidence', () => {
    it('should return higher confidence for longer texts', () => {
      const shortText = 'Short text.';
      const longText = 'A much longer text that contains multiple sentences and provides more data for analysis. ' +
                      'This should result in a higher confidence score because there is more information to analyze. ' +
                      'The more text we have, the more accurate our analysis can be.';

      const shortConfidence = aiDetector.calculateConfidence(shortText);
      const longConfidence = aiDetector.calculateConfidence(longText);

      expect(longConfidence).toBeGreaterThan(shortConfidence);
    });

    it('should handle empty text', () => {
      const confidence = aiDetector.calculateConfidence('');
      expect(confidence).toBe(0);
    });
  });
}); 