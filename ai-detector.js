// ai-detector.js - Core AI detection algorithm for AI Text Detector

/**
 * Analyzes text to determine the likelihood of AI generation
 * @param {string} text - The text to analyze
 * @returns {number} - AI probability score (0-100)
 */
function analyzeText(text) {
  // Get detailed analysis results
  const analysisResults = analyzeTextDetailed(text);
  
  // Return just the AI score
  return analysisResults.aiScore;
}

/**
 * Performs detailed text analysis and returns comprehensive results
 * @param {string} text - The text to analyze
 * @returns {Object} - Detailed analysis results
 */
function analyzeTextDetailed(text) {
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

  // Return comprehensive analysis results
  return {
    aiScore: finalScore,
    wordCount,
    sentenceCount,
    avgSentenceLength,
    uniqueWords,
    repetitionScore,
    sentenceLengthVariance,
    transitionPhrases,
    factors: {
      baseline: 20,
      sentenceLength: (avgSentenceLength > 8 && avgSentenceLength < 16) ? 25 : 0,
      vocabulary: (repetitionScore < 0.3) ? 20 : 0,
      variance: (sentenceLengthVariance < 15) ? 20 : 0,
      transitions: (transitionPhrases > 1) ? 20 : 0,
      density: (wordCount > 100 && sentenceCount < 15) ? 15 : 0
    }
  };
}

/**
 * Compares two texts and analyzes both for AI probability
 * @param {string} text1 - First text to compare
 * @param {string} text2 - Second text to compare
 * @returns {Object} - Comparison results
 */
function compareTexts(text1, text2) {
  const analysis1 = analyzeTextDetailed(text1);
  const analysis2 = analyzeTextDetailed(text2);
  
  return {
    text1Score: analysis1.aiScore,
    text2Score: analysis2.aiScore,
    text1Analysis: analysis1,
    text2Analysis: analysis2
  };
}

/**
 * Calculates readability score using Flesch Reading Ease formula
 * @param {string} text - Text to analyze
 * @returns {number} - Readability score
 */
function calculateReadability(text) {
  const words = text.split(/\s+/).filter(w => w.length > 0);
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const wordCount = words.length;
  const sentenceCount = sentences.length;
  
  // Estimate syllable count
  const syllables = words.reduce((sum, w) => sum + (w.match(/[aeiouy]+/gi)?.length || 1), 0);
  
  // Calculate Flesch Reading Ease score
  const fleschScore = 206.835 - 1.015 * (wordCount / sentenceCount) - 84.6 * (syllables / wordCount);
  
  return Math.round(fleschScore);
}

/**
 * Finds repeating words in text
 * @param {string} text - Text to analyze
 * @param {number} minCount - Minimum occurrences to consider a word repeating
 * @returns {Object} - Word frequencies
 */
function findRepeatingWords(text, minCount = 3) {
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

/**
 * Highlights potentially AI-generated sections in text
 * @param {string} text - Text to analyze
 * @returns {Object} - Highlighted text and section scores
 */
function highlightAIText(text) {
  // Split text into sentences
  const sentenceRegex = /([^.!?]+[.!?]+)/g;
  const sentences = text.match(sentenceRegex) || [];
  
  // Analyze each sentence
  const analyzedSentences = sentences.map(sentence => {
    const analysis = analyzeTextDetailed(sentence);
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

// Export functions
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    analyzeText,
    analyzeTextDetailed,
    compareTexts,
    calculateReadability,
    findRepeatingWords,
    highlightAIText
  };
} else {
  // Browser environment
  window.AIDetector = {
    analyzeText,
    analyzeTextDetailed,
    compareTexts,
    calculateReadability,
    findRepeatingWords,
    highlightAIText
  };
}
