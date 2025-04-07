const LanguageDetect = require('languagedetect');

class LanguageModel {
  constructor() {
    this.detector = new LanguageDetect();
    this.setupLanguagePatterns();
  }

  setupLanguagePatterns() {
    this.patterns = {
      en: {
        articles: /\b(the|a|an)\b/gi,
        prepositions: /\b(in|on|at|to|for|with|by|from|of)\b/gi,
        pronouns: /\b(i|you|he|she|it|we|they|me|him|her|us|them)\b/gi,
        commonWords: /\b(is|are|was|were|be|been|have|has|had|do|does|did|will|would|can|could|should|may|might)\b/gi
      },
      es: {
        articles: /\b(el|la|los|las|un|una|unos|unas)\b/gi,
        prepositions: /\b(en|sobre|a|para|con|por|de|desde|hasta)\b/gi,
        pronouns: /\b(yo|tú|él|ella|nosotros|vosotros|ellos|ellas|me|te|se|nos|os)\b/gi,
        commonWords: /\b(es|son|era|eran|ser|sido|tener|tiene|tenía|hacer|hace|hizo|hará|puede|podría|debe|debería)\b/gi
      },
      fr: {
        articles: /\b(le|la|les|un|une|des)\b/gi,
        prepositions: /\b(à|de|dans|sur|pour|avec|par|en|vers)\b/gi,
        pronouns: /\b(je|tu|il|elle|nous|vous|ils|elles|me|te|se|nous|vous)\b/gi,
        commonWords: /\b(est|sont|était|étaient|être|été|avoir|a|avait|faire|fait|fera|peut|pourrait|doit|devrait)\b/gi
      },
      de: {
        articles: /\b(der|die|das|den|dem|des|ein|eine|einer|eines)\b/gi,
        prepositions: /\b(in|auf|bei|mit|nach|seit|von|zu|aus)\b/gi,
        pronouns: /\b(ich|du|er|sie|es|wir|ihr|sie|mich|dich|sich|uns|euch)\b/gi,
        commonWords: /\b(ist|sind|war|waren|sein|gewesen|haben|hat|hatte|machen|macht|machte|wird|würde|kann|könnte)\b/gi
      }
    };
  }

  detectLanguage(text) {
    if (!text) return null;

    const detections = this.detector.detect(text);
    if (!detections || detections.length === 0) return null;

    // Get the most probable language
    const [language, probability] = detections[0];
    return {
      code: language,
      probability: probability,
      confidence: this.calculateConfidence(text, language)
    };
  }

  calculateConfidence(text, language) {
    if (!text || !language || !this.patterns[language]) return 0;

    const patterns = this.patterns[language];
    let matches = 0;
    let total = 0;

    // Check each pattern category
    for (const [category, pattern] of Object.entries(patterns)) {
      const categoryMatches = (text.match(pattern) || []).length;
      matches += categoryMatches;
      total += text.split(/\s+/).length; // Approximate word count
    }

    // Calculate confidence based on pattern matches
    return Math.min(matches / (total || 1), 1);
  }

  analyzeLanguageFeatures(text, language) {
    if (!text || !language || !this.patterns[language]) {
      return null;
    }

    const patterns = this.patterns[language];
    const words = text.split(/\s+/);
    const totalWords = words.length;

    const analysis = {
      wordCount: totalWords,
      patterns: {}
    };

    // Analyze each pattern category
    for (const [category, pattern] of Object.entries(patterns)) {
      const matches = (text.match(pattern) || []);
      analysis.patterns[category] = {
        count: matches.length,
        percentage: totalWords ? (matches.length / totalWords) * 100 : 0,
        examples: matches.slice(0, 5) // First 5 examples
      };
    }

    // Add language-specific metrics
    analysis.metrics = this.calculateLanguageMetrics(text, language);

    return analysis;
  }

  calculateLanguageMetrics(text, language) {
    const metrics = {
      averageWordLength: 0,
      sentenceCount: 0,
      complexityScore: 0
    };

    if (!text) return metrics;

    // Calculate average word length
    const words = text.split(/\s+/);
    const totalLength = words.reduce((sum, word) => sum + word.length, 0);
    metrics.averageWordLength = totalLength / (words.length || 1);

    // Count sentences (basic implementation)
    metrics.sentenceCount = (text.match(/[.!?]+/g) || []).length;

    // Calculate complexity score based on language patterns
    if (this.patterns[language]) {
      const patterns = this.patterns[language];
      let complexityFactors = 0;

      for (const pattern of Object.values(patterns)) {
        const matches = (text.match(pattern) || []).length;
        complexityFactors += matches;
      }

      metrics.complexityScore = Math.min(complexityFactors / (words.length || 1), 1);
    }

    return metrics;
  }

  compareLanguageFeatures(text1, text2) {
    const lang1 = this.detectLanguage(text1);
    const lang2 = this.detectLanguage(text2);

    if (!lang1 || !lang2) return null;

    const analysis1 = this.analyzeLanguageFeatures(text1, lang1.code);
    const analysis2 = this.analyzeLanguageFeatures(text2, lang2.code);

    if (!analysis1 || !analysis2) return null;

    return {
      languages: {
        text1: lang1,
        text2: lang2
      },
      similarity: this.calculateFeatureSimilarity(analysis1, analysis2),
      differences: this.calculateFeatureDifferences(analysis1, analysis2)
    };
  }

  calculateFeatureSimilarity(analysis1, analysis2) {
    const metrics = ['averageWordLength', 'complexityScore'];
    let totalDiff = 0;

    metrics.forEach(metric => {
      const diff = Math.abs(
        analysis1.metrics[metric] - analysis2.metrics[metric]
      );
      totalDiff += diff;
    });

    return 1 - (totalDiff / metrics.length);
  }

  calculateFeatureDifferences(analysis1, analysis2) {
    const differences = {
      wordCount: Math.abs(analysis1.wordCount - analysis2.wordCount),
      patterns: {}
    };

    // Compare pattern usage
    const allCategories = new Set([
      ...Object.keys(analysis1.patterns),
      ...Object.keys(analysis2.patterns)
    ]);

    allCategories.forEach(category => {
      const pattern1 = analysis1.patterns[category];
      const pattern2 = analysis2.patterns[category];

      if (pattern1 && pattern2) {
        differences.patterns[category] = {
          countDiff: Math.abs(pattern1.count - pattern2.count),
          percentageDiff: Math.abs(pattern1.percentage - pattern2.percentage)
        };
      }
    });

    return differences;
  }
}

module.exports = { LanguageModel }; 