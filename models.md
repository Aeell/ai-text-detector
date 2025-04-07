# 🧠 AI Detection Models

## Current Implementation

The AI Text Detector currently uses a rule-based algorithm for detecting AI-generated content. This approach analyzes several text characteristics to calculate an AI probability score.

### Detection Factors

The current algorithm analyzes the following factors:

1. **Sentence Length Analysis**
   - Measures average sentence length
   - Identifies unnaturally consistent sentence structures
   - Contributes up to 25% to the final score

2. **Repetition Scoring**
   - Calculates the ratio of unique words to total words
   - Identifies limited vocabulary diversity common in AI text
   - Contributes up to 20% to the final score

3. **Sentence Length Variance**
   - Measures the consistency of sentence lengths
   - Identifies unnaturally uniform writing patterns
   - Contributes up to 20% to the final score

4. **Transition Phrase Detection**
   - Counts common transition phrases often overused by AI
   - Includes language-specific phrases for all supported languages
   - Contributes up to 20% to the final score

5. **Text Length Ratio**
   - Analyzes the relationship between word count and sentence count
   - Identifies unnaturally dense or sparse text
   - Contributes up to 15% to the final score

### Algorithm Implementation

```javascript
function analyzeText(text) {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = text.split(/\s+/).filter(w => w.length > 0);
  const avgSentenceLength = sentences.reduce((sum, s) => sum + s.split(" ").length, 0) / sentences.length || 0;
  const wordCount = words.length;
  const uniqueWords = new Set(words.map(w => w.toLowerCase())).size;
  const repetitionScore = (wordCount - uniqueWords) / wordCount;
  const sentenceLengthVariance = sentences.map(s => s.split(" ").length)
    .reduce((sum, len, _, arr) => sum + Math.pow(len - avgSentenceLength, 2), 0) / sentences.length || 0;
  const transitionPhrases = ["for example", "in conclusion", "finally", "first", "second", "another", "například", "závěrem"]
    .reduce((count, phrase) => count + (text.toLowerCase().split(phrase).length - 1), 0);

  let aiScore = 20; // Baseline
  if (avgSentenceLength > 8 && avgSentenceLength < 16) aiScore += 25;
  if (repetitionScore < 0.3) aiScore += 20;
  if (sentenceLengthVariance < 15) aiScore += 20;
  if (transitionPhrases > 1) aiScore += 20;
  if (wordCount > 100 && sentences.length < 15) aiScore += 15;

  return Math.min(Math.round(aiScore), 100);
}
```

## Planned Model Improvements

### Enhanced Rule-Based Algorithm

The next version will include these improvements to the rule-based algorithm:

1. **Perplexity Analysis**
   - Measure of how "surprised" a language model would be by the text
   - Lower perplexity indicates more predictable text (often AI-generated)
   - Will be implemented using statistical language modeling techniques

2. **Burstiness Detection**
   - Analysis of word usage patterns and clustering
   - Human writing tends to have "bursty" patterns with clustered related terms
   - AI text often lacks natural burstiness

3. **Specificity Analysis**
   - Measure of concrete vs. abstract language
   - Identification of specific details vs. generic statements
   - Human writing typically contains more specific details

4. **Language-Specific Analysis**
   - Custom parameters for each supported language
   - Language-specific linguistic patterns
   - Culturally relevant writing style analysis

### Machine Learning Integration

Future versions will incorporate machine learning for improved accuracy:

1. **Lightweight ML Model**
   - Browser-compatible model size
   - Pre-trained on diverse text corpus
   - Capable of running entirely client-side

2. **Hybrid Approach**
   - Combines rule-based and ML detection
   - Uses rules for transparent explanation
   - Uses ML for improved accuracy

3. **Confidence Scoring**
   - Provides confidence level for detection results
   - Identifies edge cases and ambiguous text
   - Offers more nuanced analysis than simple percentage

### Model Training and Evaluation

The ML models will be trained and evaluated using:

1. **Diverse Text Corpus**
   - Human-written texts from various sources
   - AI-generated texts from multiple models (GPT, Claude, etc.)
   - Texts of varying quality, style, and purpose

2. **Rigorous Testing**
   - Cross-validation techniques
   - Confusion matrix analysis
   - Regular retraining with new AI model outputs

3. **Transparency**
   - Open methodology documentation
   - Clear explanation of detection factors
   - Educational resources about model limitations
