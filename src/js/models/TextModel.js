const natural = require('natural');
const compromise = require('compromise');

class TextModel {
  constructor() {
    this.tokenizer = new natural.WordTokenizer();
    this.sentenceTokenizer = new natural.SentenceTokenizer();
    this.tfidf = new natural.TfIdf();
  }

  analyze(text) {
    if (!text) {
      throw new Error('No text provided');
    }

    const words = this.tokenizer.tokenize(text);
    const sentences = this.sentenceTokenizer.tokenize(text);
    const doc = compromise(text);

    return {
      wordCount: words.length,
      sentenceCount: sentences.length,
      averageWordLength: this.calculateAverageWordLength(words),
      averageSentenceLength: words.length / sentences.length,
      uniqueWords: new Set(words).size,
      lexicalDensity: this.calculateLexicalDensity(words),
      readabilityScore: this.calculateReadabilityScore(text),
      topKeywords: this.extractKeywords(text),
      sentimentScore: this.analyzeSentiment(text),
      partsOfSpeech: this.analyzePartsOfSpeech(doc),
      entities: this.extractEntities(doc)
    };
  }

  calculateAverageWordLength(words) {
    if (words.length === 0) return 0;
    const totalLength = words.reduce((sum, word) => sum + word.length, 0);
    return totalLength / words.length;
  }

  calculateLexicalDensity(words) {
    if (words.length === 0) return 0;
    const contentWords = words.filter(word => this.isContentWord(word));
    return contentWords.length / words.length;
  }

  isContentWord(word) {
    const stopWords = new Set([
      'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i',
      'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at'
    ]);
    return !stopWords.has(word.toLowerCase());
  }

  calculateReadabilityScore(text) {
    try {
      // Simplified Flesch-Kincaid Grade Level
      const words = this.tokenizer.tokenize(text);
      const sentences = this.sentenceTokenizer.tokenize(text);
      const syllables = this.countSyllables(text);

      if (words.length === 0 || sentences.length === 0) return 0;

      const averageWordsPerSentence = words.length / sentences.length;
      const averageSyllablesPerWord = syllables / words.length;

      return (0.39 * averageWordsPerSentence) + (11.8 * averageSyllablesPerWord) - 15.59;
    } catch (error) {
      console.error('Error calculating readability score:', error);
      return 0;
    }
  }

  countSyllables(text) {
    const words = this.tokenizer.tokenize(text);
    return words.reduce((count, word) => count + this.countWordSyllables(word), 0);
  }

  countWordSyllables(word) {
    word = word.toLowerCase();
    if (word.length <= 3) return 1;

    word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
    word = word.replace(/^y/, '');

    const syllables = word.match(/[aeiouy]{1,2}/g);
    return syllables ? syllables.length : 1;
  }

  extractKeywords(text) {
    this.tfidf.addDocument(text);
    const terms = {};
    
    this.tfidf.listTerms(0).forEach(item => {
      terms[item.term] = item.tfidf;
    });

    return Object.entries(terms)
      .filter(([term]) => this.isContentWord(term))
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([term, score]) => ({
        term,
        score: parseFloat(score.toFixed(3))
      }));
  }

  analyzeSentiment(text) {
    const words = this.tokenizer.tokenize(text);
    let score = 0;

    const sentimentLexicon = {
      positive: new Set(['good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic']),
      negative: new Set(['bad', 'poor', 'terrible', 'awful', 'horrible', 'disappointing'])
    };

    words.forEach(word => {
      word = word.toLowerCase();
      if (sentimentLexicon.positive.has(word)) score += 1;
      if (sentimentLexicon.negative.has(word)) score -= 1;
    });

    return {
      score: score / words.length,
      magnitude: Math.abs(score) / words.length
    };
  }

  analyzePartsOfSpeech(doc) {
    const tags = {
      nouns: doc.nouns().length,
      verbs: doc.verbs().length,
      adjectives: doc.adjectives().length,
      adverbs: doc.adverbs().length,
      pronouns: doc.pronouns().length
    };

    const total = Object.values(tags).reduce((sum, count) => sum + count, 0);
    
    return Object.entries(tags).reduce((result, [tag, count]) => {
      result[tag] = {
        count,
        percentage: total > 0 ? (count / total) * 100 : 0
      };
      return result;
    }, {});
  }

  extractEntities(doc) {
    return {
      people: doc.people().out('array'),
      places: doc.places().out('array'),
      organizations: doc.organizations().out('array'),
      dates: doc.dates().out('array'),
      values: doc.values().out('array')
    };
  }

  compareTexts(text1, text2) {
    const analysis1 = this.analyze(text1);
    const analysis2 = this.analyze(text2);

    return {
      similarity: this.calculateTextSimilarity(text1, text2),
      structuralDifference: this.compareStructure(analysis1, analysis2),
      stylometricDifference: this.compareStyle(analysis1, analysis2),
      commonKeywords: this.findCommonKeywords(analysis1.topKeywords, analysis2.topKeywords)
    };
  }

  calculateTextSimilarity(text1, text2) {
    const words1 = new Set(this.tokenizer.tokenize(text1.toLowerCase()));
    const words2 = new Set(this.tokenizer.tokenize(text2.toLowerCase()));

    const intersection = new Set([...words1].filter(word => words2.has(word)));
    const union = new Set([...words1, ...words2]);

    return intersection.size / union.size;
  }

  compareStructure(analysis1, analysis2) {
    const metrics = [
      'averageWordLength',
      'averageSentenceLength',
      'lexicalDensity'
    ];

    return metrics.reduce((diff, metric) => {
      diff[metric] = Math.abs(analysis1[metric] - analysis2[metric]);
      return diff;
    }, {});
  }

  compareStyle(analysis1, analysis2) {
    const styleDiff = {};

    // Compare parts of speech distribution
    Object.keys(analysis1.partsOfSpeech).forEach(pos => {
      styleDiff[pos] = Math.abs(
        analysis1.partsOfSpeech[pos].percentage -
        analysis2.partsOfSpeech[pos].percentage
      );
    });

    // Compare sentiment
    styleDiff.sentimentDifference = Math.abs(
      analysis1.sentimentScore.score -
      analysis2.sentimentScore.score
    );

    return styleDiff;
  }

  findCommonKeywords(keywords1, keywords2) {
    const terms1 = new Set(keywords1.map(k => k.term));
    return keywords2
      .filter(k => terms1.has(k.term))
      .map(k => k.term);
  }
}

module.exports = { TextModel }; 