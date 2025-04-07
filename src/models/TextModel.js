// TextModel.js - Text analysis and AI detection model
import { Debug } from '../utils/Debug';

export class TextModel {
  constructor() {
    this.debug = Debug;
    this.initialize();
  }

  initialize() {
    try {
      this.initializePatterns();
      this.debug.logger.info('TextModel initialized successfully');
    } catch (error) {
      this.debug.logger.error('Error initializing TextModel:', error);
      throw error;
    }
  }

  initializePatterns() {
    // AI text patterns and indicators
    this.patterns = {
      repetition: /\b(\w+)\s+\1\b/g,
      formalPhrases: /\b(furthermore|moreover|additionally|consequently|therefore)\b/gi,
      complexStructures: /\b(in order to|with respect to|in light of|on the basis of)\b/gi,
      genericTransitions: /\b(firstly|secondly|thirdly|finally|in conclusion)\b/gi,
      perfectGrammar: /[^.!?]+[.!?](\s|$)/g,
      consistentTone: /\b(we can see that|it is clear that|this shows that)\b/gi
    };

    // Weights for different analysis aspects
    this.weights = {
      repetition: 0.15,
      formalPhrases: 0.2,
      complexStructures: 0.15,
      genericTransitions: 0.1,
      perfectGrammar: 0.2,
      consistentTone: 0.1,
      textCoherence: 0.1
    };
  }

  async analyzeText(text) {
    try {
      if (!text || typeof text !== 'string') {
        throw new Error('Invalid text input');
      }

      const analysis = {
        textLength: text.length,
        wordCount: this.countWords(text),
        sentences: this.splitSentences(text),
        patterns: this.findPatterns(text),
        metrics: this.calculateMetrics(text),
        coherence: this.analyzeCoherence(text),
        complexity: this.analyzeComplexity(text)
      };

      const aiProbability = this.calculateAIProbability(analysis);
      const confidence = this.calculateConfidence(analysis);

      return {
        analysis,
        aiProbability,
        confidence
      };
    } catch (error) {
      this.debug.logger.error('Error analyzing text:', error);
      throw error;
    }
  }

  countWords(text) {
    return text.trim().split(/\s+/).filter(Boolean).length;
  }

  splitSentences(text) {
    return text.match(/[^.!?]+[.!?](\s|$)/g) || [];
  }

  findPatterns(text) {
    const results = {};
    
    for (const [name, pattern] of Object.entries(this.patterns)) {
      const matches = text.match(pattern) || [];
      results[name] = {
        count: matches.length,
        matches: matches.slice(0, 5) // Limit examples to 5
      };
    }

    return results;
  }

  calculateMetrics(text) {
    return {
      averageSentenceLength: this.calculateAverageSentenceLength(text),
      vocabularyDiversity: this.calculateVocabularyDiversity(text),
      punctuationRatio: this.calculatePunctuationRatio(text),
      formalityScore: this.calculateFormalityScore(text)
    };
  }

  calculateAverageSentenceLength(text) {
    const sentences = this.splitSentences(text);
    if (sentences.length === 0) return 0;

    const totalWords = sentences.reduce((sum, sentence) => 
      sum + this.countWords(sentence), 0);
    return totalWords / sentences.length;
  }

  calculateVocabularyDiversity(text) {
    const words = text.toLowerCase().match(/\b\w+\b/g) || [];
    const uniqueWords = new Set(words);
    return words.length > 0 ? uniqueWords.size / words.length : 0;
  }

  calculatePunctuationRatio(text) {
    const punctuation = text.match(/[.,!?;:]/g) || [];
    return text.length > 0 ? punctuation.length / text.length : 0;
  }

  calculateFormalityScore(text) {
    const formalIndicators = {
      academicWords: /\b(analyze|examine|investigate|demonstrate|conclude)\b/gi,
      contractions: /\b(can't|won't|don't|I'm|you're)\b/gi,
      personalPronouns: /\b(I|me|my|mine|we|us|our|ours)\b/gi
    };

    let score = 0;
    
    // Check academic word usage
    const academicMatches = text.match(formalIndicators.academicWords) || [];
    score += academicMatches.length * 0.3;

    // Penalize contractions
    const contractionMatches = text.match(formalIndicators.contractions) || [];
    score -= contractionMatches.length * 0.2;

    // Penalize personal pronouns
    const pronounMatches = text.match(formalIndicators.personalPronouns) || [];
    score -= pronounMatches.length * 0.1;

    // Normalize score between 0 and 1
    return Math.max(0, Math.min(1, (score + 1) / 2));
  }

  analyzeCoherence(text) {
    const sentences = this.splitSentences(text);
    if (sentences.length < 2) return 1;

    let coherenceScore = 0;
    for (let i = 1; i < sentences.length; i++) {
      const prevSentence = sentences[i - 1];
      const currentSentence = sentences[i];
      
      // Check for transition words
      const hasTransition = /\b(however|therefore|consequently|furthermore|moreover)\b/i
        .test(currentSentence);
      
      // Check for topic consistency (shared words)
      const prevWords = new Set(prevSentence.toLowerCase().match(/\b\w+\b/g));
      const currentWords = currentSentence.toLowerCase().match(/\b\w+\b/g);
      const sharedWords = currentWords.filter(word => prevWords.has(word)).length;
      
      // Calculate sentence-level coherence
      const sentenceCoherence = (hasTransition ? 0.6 : 0) + 
        (sharedWords > 0 ? 0.4 * Math.min(1, sharedWords / 3) : 0);
      
      coherenceScore += sentenceCoherence;
    }

    return coherenceScore / (sentences.length - 1);
  }

  analyzeComplexity(text) {
    const complexityFactors = {
      longWords: text.match(/\b\w{7,}\b/g)?.length || 0,
      complexSentences: text.match(/[^.!?]+(?:[,;:])[^.!?]+[.!?]/g)?.length || 0,
      subordinateClauses: text.match(/\b(although|because|while|unless|if|when)\b/gi)?.length || 0
    };

    const textLength = text.length;
    const sentenceCount = this.splitSentences(text).length;

    return {
      ...complexityFactors,
      averageWordLength: this.calculateAverageWordLength(text),
      sentenceComplexityRatio: sentenceCount > 0 ? 
        complexityFactors.complexSentences / sentenceCount : 0
    };
  }

  calculateAverageWordLength(text) {
    const words = text.match(/\b\w+\b/g) || [];
    if (words.length === 0) return 0;
    
    const totalLength = words.reduce((sum, word) => sum + word.length, 0);
    return totalLength / words.length;
  }

  calculateAIProbability(analysis) {
    let probability = 0;

    // Weight pattern matches
    for (const [patternName, weight] of Object.entries(this.weights)) {
      const patternScore = this.calculatePatternScore(analysis, patternName);
      probability += patternScore * weight;
    }

    // Adjust based on metrics
    probability = this.adjustProbabilityWithMetrics(probability, analysis.metrics);

    // Normalize to 0-100 range
    return Math.round(Math.max(0, Math.min(100, probability * 100)));
  }

  calculatePatternScore(analysis, patternName) {
    const pattern = analysis.patterns[patternName];
    if (!pattern) return 0;

    // Normalize pattern count based on text length
    const normalizedCount = pattern.count / (analysis.wordCount || 1);
    
    // Convert to a score between 0 and 1
    return Math.min(1, normalizedCount * 10);
  }

  adjustProbabilityWithMetrics(probability, metrics) {
    // Adjust based on vocabulary diversity
    if (metrics.vocabularyDiversity < 0.4) {
      probability *= 1.2; // Increase probability for low diversity
    } else if (metrics.vocabularyDiversity > 0.7) {
      probability *= 0.8; // Decrease probability for high diversity
    }

    // Adjust based on formality score
    if (metrics.formalityScore > 0.8) {
      probability *= 1.15; // Increase probability for very formal text
    }

    // Adjust based on punctuation ratio
    if (metrics.punctuationRatio > 0.15) {
      probability *= 1.1; // Increase probability for high punctuation usage
    }

    return probability;
  }

  calculateConfidence(analysis) {
    let confidence = 100;

    // Reduce confidence for very short texts
    if (analysis.wordCount < 50) {
      confidence *= (analysis.wordCount / 50);
    }

    // Reduce confidence for extreme metrics
    const { metrics } = analysis;
    if (metrics.vocabularyDiversity < 0.2 || metrics.vocabularyDiversity > 0.9) {
      confidence *= 0.8;
    }

    // Reduce confidence for unusual sentence lengths
    if (metrics.averageSentenceLength < 5 || metrics.averageSentenceLength > 40) {
      confidence *= 0.9;
    }

    // Normalize to 0-100 range
    return Math.round(Math.max(0, Math.min(100, confidence)));
  }

  compareTexts(text1, text2) {
    try {
      const analysis1 = this.analyzeText(text1);
      const analysis2 = this.analyzeText(text2);
      
      const similarity = this.calculateTextSimilarity(text1, text2);
      
      return {
        text1Analysis: analysis1,
        text2Analysis: analysis2,
        similarity,
        comparison: this.compareAnalyses(analysis1, analysis2)
      };
    } catch (error) {
      this.debug.logger.error('Error comparing texts:', error);
      throw error;
    }
  }

  calculateTextSimilarity(text1, text2) {
    // Implement Jaccard similarity for word sets
    const words1 = new Set(text1.toLowerCase().match(/\b\w+\b/g) || []);
    const words2 = new Set(text2.toLowerCase().match(/\b\w+\b/g) || []);
    
    const intersection = new Set([...words1].filter(word => words2.has(word)));
    const union = new Set([...words1, ...words2]);
    
    return intersection.size / union.size;
  }

  compareAnalyses(analysis1, analysis2) {
    return {
      probabilityDiff: analysis1.aiProbability - analysis2.aiProbability,
      confidenceDiff: analysis1.confidence - analysis2.confidence,
      metricComparison: {
        vocabularyDiversity: analysis1.metrics.vocabularyDiversity - analysis2.metrics.vocabularyDiversity,
        formalityScore: analysis1.metrics.formalityScore - analysis2.metrics.formalityScore,
        averageSentenceLength: analysis1.metrics.averageSentenceLength - analysis2.metrics.averageSentenceLength
      }
    };
  }
} 