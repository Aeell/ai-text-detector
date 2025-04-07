// AIDetector.js - Core AI text detection module
import { TextModel } from '../models/TextModel';
import { LanguageModel } from '../models/LanguageModel';
import { StorageService } from '../services/StorageService';
import { Debug } from '../utils/Debug';

export class AIDetector {
  constructor() {
    this.textModel = new TextModel();
    this.languageModel = new LanguageModel();
    this.storage = new StorageService();
    this.debug = Debug;
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
      const language = options.language || this.languageModel.detectLanguage(text);
      
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
        confidence: this.calculateConfidence(analysis),
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

  calculateConfidence(analysis) {
    try {
      // Confidence factors
      const factors = {
        textLength: analysis.textLength >= 100 ? 1 : analysis.textLength / 100,
        analysisCompleteness: Object.values(analysis).filter(Boolean).length / Object.keys(analysis).length,
        scoreDistribution: this.calculateScoreDistribution(analysis)
      };

      // Calculate overall confidence
      const confidence = (
        (factors.textLength * 0.4) +          // 40% weight
        (factors.analysisCompleteness * 0.3) + // 30% weight
        (factors.scoreDistribution * 0.3)      // 30% weight
      ) * 100;

      return Math.round(confidence);
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
} 