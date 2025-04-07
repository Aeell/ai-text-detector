// LanguageModel.js - Language-specific text analysis and patterns
import { Debug } from '../utils/Debug';

export class LanguageModel {
  constructor() {
    this.debug = Debug;
    this.initialize();
  }

  initialize() {
    try {
      this.initializeLanguagePatterns();
      this.debug.logger.info('LanguageModel initialized successfully');
    } catch (error) {
      this.debug.logger.error('Error initializing LanguageModel:', error);
      throw error;
    }
  }

  initializeLanguagePatterns() {
    // Language-specific patterns and rules
    this.languagePatterns = {
      ENG: {
        formalPhrases: /\b(furthermore|moreover|additionally|consequently|therefore)\b/gi,
        informalPhrases: /\b(like|you know|kind of|sort of|basically)\b/gi,
        contractions: /\b(can't|won't|don't|I'm|you're)\b/gi,
        academicPhrases: /\b(analyze|examine|investigate|demonstrate|conclude)\b/gi,
        transitions: /\b(however|thus|hence|accordingly|subsequently)\b/gi
      },
      ESP: {
        formalPhrases: /\b(además|asimismo|por consiguiente|por lo tanto|no obstante)\b/gi,
        informalPhrases: /\b(pues|bueno|vale|venga|mira)\b/gi,
        contractions: /\b(del|al|conmigo|contigo|consigo)\b/gi,
        academicPhrases: /\b(analizar|examinar|investigar|demostrar|concluir)\b/gi,
        transitions: /\b(sin embargo|por ende|por tanto|en consecuencia|posteriormente)\b/gi
      },
      FRA: {
        formalPhrases: /\b(en outre|par ailleurs|par conséquent|donc|néanmoins)\b/gi,
        informalPhrases: /\b(ben|quoi|bah|genre|style)\b/gi,
        contractions: /\b(j'ai|c'est|n'est|l'on|qu'il)\b/gi,
        academicPhrases: /\b(analyser|examiner|investiguer|démontrer|conclure)\b/gi,
        transitions: /\b(cependant|ainsi|donc|par conséquent|ensuite)\b/gi
      },
      DEU: {
        formalPhrases: /\b(außerdem|darüber hinaus|folglich|deshalb|dennoch)\b/gi,
        informalPhrases: /\b(also|halt|eben|mal|eigentlich)\b/gi,
        contractions: /\b(fürs|durchs|zum|zur|beim)\b/gi,
        academicPhrases: /\b(analysieren|untersuchen|erforschen|demonstrieren|schlussfolgern)\b/gi,
        transitions: /\b(jedoch|somit|daher|infolgedessen|anschließend)\b/gi
      }
    };

    // Language-specific weights for analysis
    this.languageWeights = {
      ENG: {
        formalPhrases: 0.2,
        informalPhrases: 0.15,
        contractions: 0.15,
        academicPhrases: 0.25,
        transitions: 0.25
      },
      ESP: {
        formalPhrases: 0.25,
        informalPhrases: 0.2,
        contractions: 0.1,
        academicPhrases: 0.25,
        transitions: 0.2
      },
      FRA: {
        formalPhrases: 0.25,
        informalPhrases: 0.15,
        contractions: 0.15,
        academicPhrases: 0.25,
        transitions: 0.2
      },
      DEU: {
        formalPhrases: 0.2,
        informalPhrases: 0.15,
        contractions: 0.15,
        academicPhrases: 0.25,
        transitions: 0.25
      }
    };
  }

  async analyzeLanguagePatterns(text, language) {
    try {
      if (!text || !language) {
        throw new Error('Invalid input for language pattern analysis');
      }

      const patterns = this.languagePatterns[language];
      if (!patterns) {
        throw new Error(`Language ${language} not supported`);
      }

      const analysis = {
        language,
        patterns: this.findLanguagePatterns(text, patterns),
        metrics: this.calculateLanguageMetrics(text, language),
        style: this.analyzeLanguageStyle(text, language)
      };

      const aiProbability = this.calculateLanguageAIProbability(analysis);
      const confidence = this.calculateLanguageConfidence(analysis);

      return {
        analysis,
        aiProbability,
        confidence
      };
    } catch (error) {
      this.debug.logger.error('Error analyzing language patterns:', error);
      throw error;
    }
  }

  findLanguagePatterns(text, patterns) {
    const results = {};
    
    for (const [name, pattern] of Object.entries(patterns)) {
      const matches = text.match(pattern) || [];
      results[name] = {
        count: matches.length,
        matches: matches.slice(0, 5) // Limit examples to 5
      };
    }

    return results;
  }

  calculateLanguageMetrics(text, language) {
    return {
      formalityScore: this.calculateLanguageFormalityScore(text, language),
      naturalness: this.calculateLanguageNaturalness(text, language),
      idiomaticUsage: this.analyzeIdiomaticUsage(text, language)
    };
  }

  calculateLanguageFormalityScore(text, language) {
    const patterns = this.languagePatterns[language];
    const weights = this.languageWeights[language];
    
    let score = 0;
    
    // Calculate weighted scores for each pattern type
    for (const [type, pattern] of Object.entries(patterns)) {
      const matches = text.match(pattern) || [];
      const normalizedCount = matches.length / (text.length / 100); // per 100 characters
      
      if (type === 'formalPhrases' || type === 'academicPhrases') {
        score += normalizedCount * weights[type];
      } else if (type === 'informalPhrases' || type === 'contractions') {
        score -= normalizedCount * weights[type];
      }
    }

    // Normalize score to 0-1 range
    return Math.max(0, Math.min(1, (score + 1) / 2));
  }

  calculateLanguageNaturalness(text, language) {
    // Analyze natural language patterns
    const patterns = {
      ENG: {
        naturalPhrases: /\b(in fact|actually|to be honest|I think|you see)\b/gi,
        unnaturalPhrases: /\b(it can be said that|one might say that|it is worth noting that)\b/gi
      },
      ESP: {
        naturalPhrases: /\b(la verdad|en realidad|sinceramente|creo que|sabes)\b/gi,
        unnaturalPhrases: /\b(se puede decir que|uno podría decir que|vale la pena señalar que)\b/gi
      },
      // Add patterns for other languages
    };

    const languagePatterns = patterns[language];
    if (!languagePatterns) return 0.5; // Default score for unsupported languages

    const naturalMatches = text.match(languagePatterns.naturalPhrases) || [];
    const unnaturalMatches = text.match(languagePatterns.unnaturalPhrases) || [];

    const naturalScore = naturalMatches.length / (text.length / 100);
    const unnaturalScore = unnaturalMatches.length / (text.length / 100);

    return Math.max(0, Math.min(1, 1 - (unnaturalScore / (naturalScore + 1))));
  }

  analyzeIdiomaticUsage(text, language) {
    const idioms = {
      ENG: [
        /\b(piece of cake|break a leg|under the weather|call it a day)\b/gi,
        /\b(hit the nail on the head|beat around the bush|cut corners)\b/gi
      ],
      ESP: [
        /\b(meter la pata|estar como pez en el agua|dar en el clavo)\b/gi,
        /\b(tomar el pelo|echar una mano|estar en las nubes)\b/gi
      ],
      // Add idioms for other languages
    };

    const languageIdioms = idioms[language];
    if (!languageIdioms) return 0;

    let idiomaticCount = 0;
    languageIdioms.forEach(idiom => {
      const matches = text.match(idiom) || [];
      idiomaticCount += matches.length;
    });

    return Math.min(1, idiomaticCount / (text.length / 200)); // Normalize per 200 characters
  }

  calculateLanguageAIProbability(analysis) {
    const { patterns, metrics } = analysis;
    const weights = this.languageWeights[analysis.language];
    
    let probability = 0;
    
    // Calculate pattern-based probability
    for (const [type, weight] of Object.entries(weights)) {
      const patternCount = patterns[type]?.count || 0;
      const normalizedCount = patternCount / (analysis.text?.length || 1) * 100;
      probability += normalizedCount * weight;
    }

    // Adjust based on language-specific metrics
    probability = this.adjustLanguageProbability(probability, metrics);

    // Normalize to 0-100 range
    return Math.round(Math.max(0, Math.min(100, probability)));
  }

  adjustLanguageProbability(probability, metrics) {
    // Adjust based on naturalness
    if (metrics.naturalness < 0.3) {
      probability *= 1.3; // Increase probability for unnatural text
    } else if (metrics.naturalness > 0.7) {
      probability *= 0.7; // Decrease probability for natural text
    }

    // Adjust based on idiomatic usage
    if (metrics.idiomaticUsage > 0.5) {
      probability *= 0.8; // Decrease probability for high idiomatic usage
    }

    // Adjust based on formality consistency
    const formalityDeviation = Math.abs(0.5 - metrics.formalityScore);
    if (formalityDeviation > 0.3) {
      probability *= 1.2; // Increase probability for inconsistent formality
    }

    return probability;
  }

  calculateLanguageConfidence(analysis) {
    let confidence = 100;

    // Reduce confidence for unsupported languages
    if (!this.languagePatterns[analysis.language]) {
      confidence *= 0.5;
    }

    // Reduce confidence for mixed language usage
    if (this.detectMixedLanguage(analysis)) {
      confidence *= 0.7;
    }

    // Reduce confidence for very short texts
    if (analysis.text?.length < 100) {
      confidence *= (analysis.text.length / 100);
    }

    // Normalize to 0-100 range
    return Math.round(Math.max(0, Math.min(100, confidence)));
  }

  detectMixedLanguage(analysis) {
    // Check for patterns from other languages
    for (const lang of Object.keys(this.languagePatterns)) {
      if (lang !== analysis.language) {
        const otherLangPatterns = this.languagePatterns[lang];
        for (const pattern of Object.values(otherLangPatterns)) {
          if (pattern.test(analysis.text)) {
            return true;
          }
        }
      }
    }
    return false;
  }
} 