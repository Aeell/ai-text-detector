declare module 'ai-text-detector' {
  /**
   * Core AIDetector class responsible for analyzing text
   */
  export class AIDetector {
    constructor(textModel: TextModel, languageModel: LanguageModel);
    
    /**
     * Analyzes a text to determine if it was AI-generated
     * @param text - The text to analyze
     * @returns Analysis result
     */
    analyzeText(text: string): Promise<AnalysisResult>;
    
    /**
     * Compares two texts for similarity and AI indicators
     * @param text1 - First text to compare
     * @param text2 - Second text to compare
     * @returns Comparison result
     */
    compareTexts(text1: string, text2: string): Promise<ComparisonResult>;
    
    /**
     * Calculates the probability that a text was AI-generated
     * @param metrics - Text metrics from analysis
     * @returns Probability between 0-1
     */
    calculateAIProbability(metrics: TextMetrics): number;
    
    /**
     * Calculates confidence level of the analysis
     * @param text - The text being analyzed
     * @returns Confidence level between 0-1
     */
    calculateConfidence(text: string): number;
  }
  
  /**
   * Provides text analysis capabilities
   */
  export class TextModel {
    /**
     * Analyzes text for various metrics
     * @param text - The text to analyze
     * @returns Text metrics
     */
    analyze(text: string): TextMetrics;
    
    /**
     * Compares two texts for similarity
     * @param text1 - First text
     * @param text2 - Second text
     * @returns Similarity metrics
     */
    compareTexts(text1: string, text2: string): SimilarityResult;
    
    /**
     * Calculates readability score for text
     * @param text - Text to analyze
     * @returns Readability score
     */
    calculateReadabilityScore(text: string): number;
    
    /**
     * Extracts keywords from text
     * @param text - Text to analyze
     * @param count - Number of keywords to extract
     * @returns Array of keywords with scores
     */
    extractKeywords(text: string, count?: number): Array<Keyword>;
    
    /**
     * Analyzes sentiment of text
     * @param text - Text to analyze
     * @returns Sentiment analysis result
     */
    analyzeSentiment(text: string): SentimentResult;
  }
  
  /**
   * Provides language detection and analysis
   */
  export class LanguageModel {
    /**
     * Detects the language of a text
     * @param text - Text to analyze
     * @returns Language detection result
     */
    detectLanguage(text: string): LanguageDetectionResult;
    
    /**
     * Analyzes language features specific to a language
     * @param text - Text to analyze
     * @param languageCode - ISO language code
     * @returns Language feature analysis
     */
    analyzeLanguageFeatures(text: string, languageCode: string): LanguageFeatureResult;
    
    /**
     * Compares language features between two texts
     * @param text1 - First text
     * @param text2 - Second text
     * @returns Language comparison result
     */
    compareLanguageFeatures(text1: string, text2: string): LanguageComparisonResult;
  }
  
  /**
   * Controls the user interface
   */
  export class UIController {
    constructor(aiDetector: AIDetector, storageService: StorageService, analyticsService: AnalyticsService);
    
    /**
     * Initializes the UI controller
     */
    init(): void;
    
    /**
     * Applies user preferences to the UI
     * @param preferences - User preferences object
     */
    applyPreferences(preferences: UserPreferences): void;
    
    /**
     * Handles the analyze button click event
     * @param text - The text to analyze
     */
    handleAnalyze(text: string): Promise<void>;
    
    /**
     * Displays analysis results in the UI
     * @param results - Analysis results to display
     */
    displayResults(results: AnalysisResult): void;
    
    /**
     * Displays an error message
     * @param message - Error message to display
     */
    displayError(message: string): void;
  }
  
  /**
   * Storage service for persisting data
   */
  export class StorageService {
    /**
     * Gets user preferences from storage
     * @returns User preferences object
     */
    getUserPreferences(): UserPreferences;
    
    /**
     * Saves user preferences to storage
     * @param preferences - User preferences object
     */
    saveUserPreferences(preferences: UserPreferences): void;
    
    /**
     * Saves analysis history
     * @param analysisResult - Analysis result to save
     */
    saveAnalysisHistory(analysisResult: AnalysisResult): void;
    
    /**
     * Gets analysis history
     * @param limit - Maximum number of entries to retrieve
     * @returns Array of analysis results
     */
    getAnalysisHistory(limit?: number): Array<AnalysisResult>;
  }
  
  /**
   * Analytics service for tracking events
   */
  export class AnalyticsService {
    /**
     * Initializes the analytics service
     * @param options - Configuration options
     */
    init(options?: AnalyticsOptions): void;
    
    /**
     * Tracks an event
     * @param eventName - Name of the event
     * @param properties - Event properties
     */
    trackEvent(eventName: string, properties?: Record<string, any>): void;
    
    /**
     * Tracks a page view
     * @param pageName - Name of the page
     */
    trackPageView(pageName: string): void;
    
    /**
     * Tracks an error
     * @param error - Error object
     * @param context - Error context
     */
    trackError(error: Error, context?: string): void;
  }
  
  /**
   * Debug utility for logging
   */
  export class Debug {
    constructor(namespace: string);
    
    /**
     * Logs a message
     * @param message - Message to log
     * @param data - Additional data
     */
    log(message: string, ...data: any[]): void;
    
    /**
     * Logs an error
     * @param message - Error message
     * @param data - Additional data
     */
    error(message: string, ...data: any[]): void;
    
    /**
     * Logs a warning
     * @param message - Warning message
     * @param data - Additional data
     */
    warn(message: string, ...data: any[]): void;
  }
  
  /**
   * Error boundary for handling errors
   */
  export class ErrorBoundary {
    constructor(container: HTMLElement, options?: ErrorBoundaryOptions);
    
    /**
     * Resets the error boundary
     */
    reset(): void;
    
    /**
     * Manually triggers an error for testing
     * @param error - Error to trigger
     */
    triggerError(error: Error): void;
    
    /**
     * Wraps a function with error boundary logic
     * @param fn - Function to wrap
     * @param errorCallback - Error callback
     */
    static wrap<T extends Function>(fn: T, errorCallback?: (error: Error) => void): T;
  }
  
  // Type definitions
  
  export interface AnalysisResult {
    aiProbability: number;
    confidence: number;
    language: string;
    metrics: TextMetrics;
    timestamp: number;
  }
  
  export interface ComparisonResult {
    similarity: number;
    text1Analysis: AnalysisResult;
    text2Analysis: AnalysisResult;
    commonWords: string[];
    languageComparison: LanguageComparisonResult;
  }
  
  export interface TextMetrics {
    wordCount: number;
    sentenceCount: number;
    averageWordLength: number;
    uniqueWords: number;
    lexicalDensity: number;
    readabilityScore: number;
    topKeywords: Keyword[];
    sentimentScore: number;
    partsOfSpeech: Record<string, number>;
    entities: string[];
  }
  
  export interface SimilarityResult {
    similarity: number;
    commonWords: string[];
    uniqueWords1: string[];
    uniqueWords2: string[];
  }
  
  export interface Keyword {
    word: string;
    score: number;
  }
  
  export interface SentimentResult {
    score: number;
    label: 'positive' | 'negative' | 'neutral';
    confidence: number;
  }
  
  export interface LanguageDetectionResult {
    languageCode: string;
    probability: number;
    confidence: number;
  }
  
  export interface LanguageFeatureResult {
    languageCode: string;
    patterns: Record<string, number>;
    wordCount: number;
    uniquePatterns: number;
  }
  
  export interface LanguageComparisonResult {
    similarity: number;
    differences: Record<string, number>;
  }
  
  export interface UserPreferences {
    theme: 'light' | 'dark' | 'auto';
    fontSize: 'small' | 'medium' | 'large';
    highContrast: boolean;
    reducedMotion: boolean;
    language: string;
  }
  
  export interface AnalyticsOptions {
    enabled: boolean;
    anonymize: boolean;
    sampleRate: number;
  }
  
  export interface ErrorBoundaryOptions {
    fallbackUI?: (error: Error) => string;
    onError?: (error: Error) => void;
    onReset?: () => void;
  }
}

// Augment the global window object for typings
interface Window {
  AnalyticsService?: import('ai-text-detector').AnalyticsService;
} 