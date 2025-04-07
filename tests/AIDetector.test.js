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
    it('should analyze text and return complete results', async () => {
      const text = 'This is a sample text for testing AI detection capabilities.';
      const result = await aiDetector.analyzeText(text);

      expect(result).toBeDefined();
      expect(result.aiProbability).toBeDefined();
      expect(result.confidence).toBeDefined();
      expect(result.language).toBeDefined();
      expect(result.metrics).toBeDefined();
      expect(result.analysis).toBeDefined();
    });

    it('should handle empty text', async () => {
      await expect(aiDetector.analyzeText('')).rejects.toThrow('Text is required');
    });

    it('should handle very short text', async () => {
      const text = 'Hello world';
      const result = await aiDetector.analyzeText(text);

      expect(result).toBeDefined();
      expect(result.confidence).toBeLessThan(0.5);
    });

    it('should detect likely AI-generated text', async () => {
      const text = `The quantum mechanical properties of subatomic particles exhibit fascinating characteristics of wave-particle duality. This phenomenon, first observed through the double-slit experiment, demonstrates how particles can manifest both wave-like and particle-like behavior depending on the method of observation. The mathematical formulation of quantum mechanics, developed by pioneers such as Schrödinger, Heisenberg, and Dirac, provides a robust framework for understanding these counterintuitive aspects of nature.`;
      
      const result = await aiDetector.analyzeText(text);

      expect(result.aiProbability).toBeGreaterThan(0.7);
      expect(result.confidence).toBeGreaterThan(0.7);
    });

    it('should detect likely human-written text', async () => {
      const text = `I went to the store yesterday. It was raining really hard and I forgot my umbrella. By the time I got home, I was soaking wet! My cat looked at me like I was crazy when I walked in dripping water everywhere. I need to remember to check the weather next time.`;
      
      const result = await aiDetector.analyzeText(text);

      expect(result.aiProbability).toBeLessThan(0.3);
      expect(result.confidence).toBeGreaterThan(0.7);
    });
  });

  describe('calculateAIProbability', () => {
    it('should calculate probability based on text metrics', () => {
      const metrics = {
        wordCount: 100,
        sentenceCount: 5,
        averageWordLength: 5.2,
        uniqueWords: 80,
        lexicalDensity: 0.8,
        readabilityScore: 65
      };

      const probability = aiDetector.calculateAIProbability(metrics);

      expect(probability).toBeGreaterThanOrEqual(0);
      expect(probability).toBeLessThanOrEqual(1);
    });

    it('should handle extreme values', () => {
      const metrics = {
        wordCount: 1000,
        sentenceCount: 1,
        averageWordLength: 20,
        uniqueWords: 1000,
        lexicalDensity: 1,
        readabilityScore: 100
      };

      const probability = aiDetector.calculateAIProbability(metrics);
      expect(probability).toBeLessThanOrEqual(1);
    });
  });

  describe('calculateConfidence', () => {
    it('should calculate high confidence for sufficient text', () => {
      const text = 'This is a sufficiently long text that should provide enough data for confident analysis. It contains multiple sentences and various words to analyze patterns effectively.';
      const metrics = textModel.analyze(text);
      const confidence = aiDetector.calculateConfidence(metrics);

      expect(confidence).toBeGreaterThan(0.7);
    });

    it('should calculate low confidence for short text', () => {
      const text = 'Short text.';
      const metrics = textModel.analyze(text);
      const confidence = aiDetector.calculateConfidence(metrics);

      expect(confidence).toBeLessThan(0.5);
    });
  });

  describe('compareTexts', () => {
    it('should compare two texts and return analysis', async () => {
      const text1 = 'This is the first sample text for comparison.';
      const text2 = 'This is the second sample text for analysis.';
      
      const result = await aiDetector.compareTexts(text1, text2);

      expect(result).toBeDefined();
      expect(result.text1Analysis).toBeDefined();
      expect(result.text2Analysis).toBeDefined();
      expect(result.similarity).toBeDefined();
      expect(result.comparison).toBeDefined();
    });

    it('should handle identical texts', async () => {
      const text = 'This is a sample text for testing.';
      const result = await aiDetector.compareTexts(text, text);

      expect(result.similarity).toBe(1);
      expect(result.text1Analysis.aiProbability).toBe(result.text2Analysis.aiProbability);
    });

    it('should handle completely different texts', async () => {
      const text1 = 'This is a completely different text with its own unique content.';
      const text2 = 'The quick brown fox jumps over the lazy dog.';
      
      const result = await aiDetector.compareTexts(text1, text2);

      expect(result.similarity).toBeLessThan(0.3);
    });

    it('should handle texts in different languages', async () => {
      const text1 = 'This is an English text for testing.';
      const text2 = 'Esto es un texto en español para pruebas.';
      
      const result = await aiDetector.compareTexts(text1, text2);

      expect(result.text1Analysis.language.code).toBe('en');
      expect(result.text2Analysis.language.code).toBe('es');
      expect(result.similarity).toBeLessThan(0.5);
    });
  });
}); 