export class AIDetector {
  constructor() {
    // Initialize any needed properties
  }

  analyzeText(text) {
    // Get detailed analysis results
    const analysisResults = this.analyzeTextDetailed(text);
    
    // Return just the AI score
    return analysisResults.aiScore;
  }

  analyzeTextDetailed(text) {
    if (!text.trim()) {
      return {
        aiScore: 0,
        confidence: 1,
        metrics: {},
        wordCount: 0,
        sentenceCount: 0,
        avgSentenceLength: 0,
        uniqueWords: 0,
        repetitionScore: 0,
        sentenceLengthVariance: 0,
        transitionPhrases: 0,
        factors: {
          baseline: 0,
          sentenceLength: 0,
          vocabulary: 0,
          variance: 0,
          transitions: 0,
          density: 0
        }
      };
    }

    // Split text into sentences and words
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = text.split(/\s+/).filter(w => w.length > 0);
    
    // Calculate basic text statistics
    const wordCount = words.length;
    const sentenceCount = sentences.length;
    const avgSentenceLength = sentences.reduce((sum, s) => sum + s.split(" ").length, 0) / sentenceCount || 0;
    
    // Calculate vocabulary diversity
    const uniqueWords = new Set(words.map(w => w.toLowerCase())).size;
    const repetitionScore = (wordCount - uniqueWords) / wordCount;
    
    // Calculate sentence length variance
    const sentenceLengthVariance = sentences.map(s => s.split(" ").length)
      .reduce((sum, len) => sum + Math.pow(len - avgSentenceLength, 2), 0) / sentenceCount || 0;
    
    // Count transition phrases
    const transitionPhrases = [
      "for example", "in conclusion", "finally", "first", "second", "another", 
      "například", "závěrem", "zum Beispiel", "abschließend", "par exemple", 
      "en conclusion", "por ejemplo", "en conclusión", "наприклад", "в заключение"
    ].reduce((count, phrase) => count + (text.toLowerCase().split(phrase).length - 1), 0);

    // Calculate AI score based on various factors
    let aiScore = 20; // Baseline score
    
    // Factor 1: Sentence length consistency
    if (avgSentenceLength > 8 && avgSentenceLength < 16) aiScore += 25;
    
    // Factor 2: Vocabulary diversity
    if (repetitionScore < 0.3) aiScore += 20;
    
    // Factor 3: Sentence length variance
    if (sentenceLengthVariance < 15) aiScore += 20;
    
    // Factor 4: Use of transition phrases
    if (transitionPhrases > 1) aiScore += 20;
    
    // Factor 5: Text density
    if (wordCount > 100 && sentenceCount < 15) aiScore += 15;
    
    // Ensure score doesn't exceed 100
    const finalScore = Math.min(Math.round(aiScore), 100);

    // Calculate confidence based on the number of factors that contributed to the score
    const factors = {
      baseline: 20,
      sentenceLength: (avgSentenceLength > 8 && avgSentenceLength < 16) ? 25 : 0,
      vocabulary: (repetitionScore < 0.3) ? 20 : 0,
      variance: (sentenceLengthVariance < 15) ? 20 : 0,
      transitions: (transitionPhrases > 1) ? 20 : 0,
      density: (wordCount > 100 && sentenceCount < 15) ? 15 : 0
    };

    // Calculate confidence based on how many factors contributed to the score
    const contributingFactors = Object.values(factors).filter(v => v > 0).length;
    const confidence = contributingFactors / Object.keys(factors).length;

    // Calculate metrics for test requirements
    const metrics = {
      wordCount,
      sentenceCount,
      avgSentenceLength,
      uniqueWords,
      repetitionScore,
      sentenceLengthVariance,
      transitionPhrases
    };

    // Return comprehensive analysis results
    return {
      aiScore: finalScore,
      confidence,
      metrics,
      wordCount,
      sentenceCount,
      avgSentenceLength,
      uniqueWords,
      repetitionScore,
      sentenceLengthVariance,
      transitionPhrases,
      factors
    };
  }

  analyzeSentiment(text) {
    const positiveWords = ['good', 'great', 'excellent', 'happy', 'wonderful'];
    const negativeWords = ['bad', 'terrible', 'horrible', 'sad', 'awful'];
    
    const words = text.toLowerCase().split(/\s+/);
    const positiveMatches = words.filter(w => positiveWords.includes(w));
    const negativeMatches = words.filter(w => negativeWords.includes(w));
    
    const score = (positiveMatches.length - negativeMatches.length) / words.length;
    
    return {
      score,
      sentiment: score > 0 ? 'positive' : score < 0 ? 'negative' : 'neutral',
      confidence: Math.abs(score),
      positiveWords: positiveMatches,
      negativeWords: negativeMatches
    };
  }

  calculateAdvancedReadability(text) {
    const words = text.split(/\s+/).filter(w => w.length > 0);
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const wordCount = words.length;
    const sentenceCount = sentences.length;
    
    // Estimate syllable count
    const syllables = words.reduce((sum, w) => sum + (w.match(/[aeiouy]+/gi)?.length || 1), 0);
    
    // Calculate various readability scores
    const fleschKincaid = 206.835 - 1.015 * (wordCount / sentenceCount) - 84.6 * (syllables / wordCount);
    const gunningFog = 0.4 * ((wordCount / sentenceCount) + 100 * (syllables / wordCount));
    const smog = 1.043 * Math.sqrt(syllables * (30 / sentenceCount)) + 3.1291;
    const automatedReadability = 4.71 * (syllables / wordCount) + 0.5 * (wordCount / sentenceCount) - 21.43;
    
    return {
      fleschKincaid: Math.round(fleschKincaid * 10) / 10,
      gunningFog: Math.round(gunningFog * 10) / 10,
      smog: Math.round(smog * 10) / 10,
      automatedReadability: Math.round(automatedReadability * 10) / 10
    };
  }

  compareTexts(text1, text2) {
    const analysis1 = this.analyzeTextDetailed(text1);
    const analysis2 = this.analyzeTextDetailed(text2);
    
    return {
      text1Score: analysis1.aiScore,
      text2Score: analysis2.aiScore,
      text1Analysis: analysis1,
      text2Analysis: analysis2
    };
  }

  findRepeatingWords(text, minCount = 3) {
    const words = text.split(/\s+/).filter(w => w.length > 0);
    const wordFreq = {};
    
    // Count word frequencies
    words.forEach(w => {
      const word = w.toLowerCase();
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    });
    
    // Filter to only repeating words
    const repeats = Object.entries(wordFreq)
      .filter(([_, count]) => count >= minCount)
      .sort((a, b) => b[1] - a[1]); // Sort by frequency
    
    return repeats;
  }

  highlightAIText(text) {
    // Split text into sentences
    const sentenceRegex = /([^.!?]+[.!?]+)/g;
    const sentences = text.match(sentenceRegex) || [];
    
    // Analyze each sentence
    const analyzedSentences = sentences.map(sentence => {
      const analysis = this.analyzeTextDetailed(sentence);
      return {
        text: sentence,
        score: analysis.aiScore,
        isLikelyAI: analysis.aiScore > 60
      };
    });
    
    // Create HTML with highlighted sections
    const highlightedText = analyzedSentences.map(sentence => {
      if (sentence.isLikelyAI) {
        return `<span class="ai-highlight" data-score="${sentence.score}">${sentence.text}</span>`;
      }
      return sentence.text;
    }).join('');
    
    return {
      highlightedText,
      sentences: analyzedSentences
    };
  }
}

// Export for browser environments
if (typeof window !== 'undefined') {
  window.AIDetector = AIDetector;
}
