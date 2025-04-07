// AIDetector.js - Core AI text detection module
import { TextModel } from '../models/TextModel';
import { LanguageModel } from '../models/LanguageModel';
import { StorageService } from '../services/StorageService';
import { Debug } from '../utils/Debug';

const natural = require('natural');
const compromise = require('compromise');
const LanguageDetect = require('languagedetect');

export class AIDetector {
  constructor() {
    this.textModel = new TextModel();
    this.languageModel = new LanguageModel();
    this.storage = new StorageService();
    this.debug = Debug;
    this.languageDetector = new LanguageDetect();
    this.tokenizer = new natural.WordTokenizer();
    this.sentenceTokenizer = new natural.SentenceTokenizer();
    this.initialize();
  }

  async initialize() {
    try {
      await this.loadModels();
      this.debug.logger.info('AIDetector initialized successfully');
    } catch (error) {
      this.debug.logger.error('Error initializing AIDetector:', error);
      throw new Error('Failed to initialize AI detection system');
    }
  }

  async loadModels() {
    try {
      await Promise.all([
        this.textModel.initialize(),
        this.languageModel.initialize()
      ]);
      this.debug.logger.info('Models loaded successfully');
    } catch (error) {
      this.debug.logger.error('Error loading models:', error);
      throw error;
    }
  }

  async analyzeText(text, options = {}) {
    try {
      this.debug.performanceMonitor.startMeasure('textAnalysis');
      
      // Basic text validation
      if (!text || typeof text !== 'string') {
        throw new Error('Invalid text input');
      }

      // Get language if not specified
      const language = options.language || this.detectLanguage(text);
      
      // Core analysis
      const analysis = {
        ...this.textModel.analyze(text, language),
        ...this.languageModel.analyze(text, language)
      };

      // Calculate AI probability
      const aiProbability = this.calculateAIProbability(analysis);
      
      // Enhanced results with confidence scores
      const results = {
        aiProbability,
        confidence: this.calculateConfidence(text),
        analysis: {
          ...analysis,
          language,
          timestamp: new Date().toISOString()
        }
      };

      // Store analysis for future reference
      await this.storage.saveAnalysis(results);
      
      this.debug.performanceMonitor.endMeasure('textAnalysis');
      this.debug.logger.info('Text analysis completed', { length: text.length, language });
      
      return results;
    } catch (error) {
      this.debug.logger.error('Error analyzing text:', error);
      throw error;
    }
  }

  calculateAIProbability(analysis) {
    try {
      const {
        sentenceLengthScore,
        repetitionScore,
        varianceScore,
        transitionScore,
        coherenceScore,
        complexityScore
      } = analysis;

      // Weighted scoring system
      const weights = {
        sentenceLength: 0.25,    // 25% weight
        repetition: 0.20,        // 20% weight
        variance: 0.20,          // 20% weight
        transition: 0.15,        // 15% weight
        coherence: 0.10,         // 10% weight
        complexity: 0.10         // 10% weight
      };

      const weightedScore = 
        (sentenceLengthScore * weights.sentenceLength) +
        (repetitionScore * weights.repetition) +
        (varianceScore * weights.variance) +
        (transitionScore * weights.transition) +
        (coherenceScore * weights.coherence) +
        (complexityScore * weights.complexity);

      // Normalize to 0-100 range
      return Math.min(Math.round(weightedScore * 100), 100);
    } catch (error) {
      this.debug.logger.error('Error calculating AI probability:', error);
      throw error;
    }
  }

  calculateConfidence(text) {
    try {
      if (!text) return 0;

      const words = this.tokenizer.tokenize(text);
      const baseConfidence = Math.min(1, words.length / 100);

      // Adjust confidence based on text length
      let lengthMultiplier = 1;
      if (words.length < 50) {
        lengthMultiplier = 0.7;
      } else if (words.length > 500) {
        lengthMultiplier = 1.2;
      }

      return Math.min(1, baseConfidence * lengthMultiplier);
    } catch (error) {
      this.debug.logger.error('Error calculating confidence:', error);
      throw error;
    }
  }

  calculateScoreDistribution(analysis) {
    // Calculate how well-distributed the scores are
    const scores = [
      analysis.sentenceLengthScore,
      analysis.repetitionScore,
      analysis.varianceScore,
      analysis.transitionScore,
      analysis.coherenceScore,
      analysis.complexityScore
    ];

    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
    const variance = scores.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / scores.length;
    
    // Return a value between 0-1 where 1 means well-distributed scores
    return 1 - Math.min(Math.sqrt(variance), 1);
  }

  async compareTexts(text1, text2, options = {}) {
    try {
      const [analysis1, analysis2] = await Promise.all([
        this.analyzeText(text1, options),
        this.analyzeText(text2, options)
      ]);

      return {
        text1Analysis: analysis1,
        text2Analysis: analysis2,
        comparison: this.calculateTextSimilarity(text1, text2),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      this.debug.logger.error('Error comparing texts:', error);
      throw error;
    }
  }

  calculateTextSimilarity(text1, text2) {
    try {
      return this.textModel.calculateSimilarity(text1, text2);
    } catch (error) {
      this.debug.logger.error('Error calculating text similarity:', error);
      throw error;
    }
  }

  detectLanguage(text) {
    const languages = this.languageDetector.detect(text);
    return languages.length > 0 ? languages[0][0] : 'unknown';
  }

  calculateTextMetrics(text) {
    const words = this.tokenizer.tokenize(text);
    const sentences = this.sentenceTokenizer.tokenize(text);
    const doc = compromise(text);

    return {
      repetitionScore: this.calculateRepetitionScore(words),
      sentenceVariance: this.calculateSentenceVariance(sentences),
      textLengthRatio: words.length / sentences.length,
      transitionPhraseCount: this.countTransitionPhrases(doc),
      readabilityScore: this.calculateReadabilityScore(text)
    };
  }

  calculateRepetitionScore(words) {
    const wordFrequency = {};
    words.forEach(word => {
      wordFrequency[word] = (wordFrequency[word] || 0) + 1;
    });

    const uniqueWords = Object.keys(wordFrequency).length;
    const totalWords = words.length;

    return 1 - (uniqueWords / totalWords);
  }

  calculateSentenceVariance(sentences) {
    if (sentences.length < 2) return 0;

    const lengths = sentences.map(s => s.length);
    const mean = lengths.reduce((a, b) => a + b) / lengths.length;
    const variance = lengths.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / lengths.length;

    return Math.min(1, variance / 1000);
  }

  countTransitionPhrases(doc) {
    const transitions = [
      'however',
      'therefore',
      'furthermore',
      'moreover',
      'consequently',
      'nevertheless',
      'additionally',
      'subsequently',
      'accordingly',
      'hence'
    ];

    let count = 0;
    transitions.forEach(phrase => {
      count += doc.match(phrase).length;
    });

    return count;
  }

  calculateReadabilityScore(text) {
    const words = this.tokenizer.tokenize(text);
    const sentences = this.sentenceTokenizer.tokenize(text);
    
    if (words.length === 0 || sentences.length === 0) return 0;

    const avgWordsPerSentence = words.length / sentences.length;
    const avgWordLength = words.join('').length / words.length;

    // Simplified readability score between 0 and 1
    return Math.min(1, (avgWordsPerSentence * 0.1 + avgWordLength * 0.3) / 10);
  }
}

module.exports = { AIDetector }; 