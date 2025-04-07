// AnalyticsService.js - Analytics and performance monitoring
import { Debug } from '../utils/Debug';

export class AnalyticsService {
  constructor() {
    this.debug = Debug;
    this.metrics = new Map();
    this.events = [];
    this.maxEvents = 1000;
    this.performanceMarks = new Map();
    this.initialize();
  }

  initialize() {
    try {
      this.initializeMetrics();
      this.setupPerformanceObserver();
      this.debug.logger.info('AnalyticsService initialized successfully');
    } catch (error) {
      this.debug.logger.error('Error initializing AnalyticsService:', error);
      throw error;
    }
  }

  initializeMetrics() {
    // Initialize core metrics
    this.metrics.set('totalAnalyses', 0);
    this.metrics.set('averageAnalysisTime', 0);
    this.metrics.set('totalTextLength', 0);
    this.metrics.set('averageTextLength', 0);
    this.metrics.set('languageDistribution', new Map());
    this.metrics.set('aiProbabilityDistribution', new Array(10).fill(0));
    this.metrics.set('errorCount', 0);
  }

  setupPerformanceObserver() {
    if (typeof PerformanceObserver === 'undefined') {
      this.debug.logger.warn('PerformanceObserver not supported');
      return;
    }

    const observer = new PerformanceObserver(list => {
      list.getEntries().forEach(entry => {
        this.handlePerformanceEntry(entry);
      });
    });

    observer.observe({ entryTypes: ['measure', 'mark'] });
  }

  handlePerformanceEntry(entry) {
    try {
      if (entry.entryType === 'measure') {
        this.trackPerformanceMeasure(entry);
      }
    } catch (error) {
      this.debug.logger.error('Error handling performance entry:', error);
    }
  }

  trackEvent(category, action, label = null, value = null) {
    try {
      const event = {
        timestamp: new Date().toISOString(),
        category,
        action,
        label,
        value
      };

      this.events.push(event);

      // Keep events array within size limit
      if (this.events.length > this.maxEvents) {
        this.events.shift();
      }

      this.debug.logger.debug('Event tracked:', event);
    } catch (error) {
      this.debug.logger.error('Error tracking event:', error);
    }
  }

  trackTextInput(length) {
    try {
      this.metrics.set('totalTextLength', this.metrics.get('totalTextLength') + length);
      const totalAnalyses = this.metrics.get('totalAnalyses');
      if (totalAnalyses > 0) {
        this.metrics.set('averageTextLength', 
          this.metrics.get('totalTextLength') / totalAnalyses);
      }

      this.trackEvent('text', 'input', 'length', length);
    } catch (error) {
      this.debug.logger.error('Error tracking text input:', error);
    }
  }

  trackAnalysis(result) {
    try {
      // Update analysis count
      this.metrics.set('totalAnalyses', this.metrics.get('totalAnalyses') + 1);

      // Update language distribution
      const langDist = this.metrics.get('languageDistribution');
      const lang = result.language || 'unknown';
      langDist.set(lang, (langDist.get(lang) || 0) + 1);

      // Update AI probability distribution
      const probDist = this.metrics.get('aiProbabilityDistribution');
      const probBucket = Math.floor(result.aiProbability / 10);
      probDist[probBucket]++;

      this.trackEvent('analysis', 'complete', lang, result.aiProbability);
    } catch (error) {
      this.debug.logger.error('Error tracking analysis:', error);
    }
  }

  trackError(error, context = null) {
    try {
      this.metrics.set('errorCount', this.metrics.get('errorCount') + 1);
      this.trackEvent('error', error.name, context, error.message);
    } catch (err) {
      this.debug.logger.error('Error tracking error:', err);
    }
  }

  startPerformanceMark(markName) {
    try {
      const start = performance.now();
      this.performanceMarks.set(markName, start);
      performance.mark(`${markName}_start`);
    } catch (error) {
      this.debug.logger.error('Error starting performance mark:', error);
    }
  }

  endPerformanceMark(markName) {
    try {
      const start = this.performanceMarks.get(markName);
      if (!start) {
        throw new Error(`No start mark found for ${markName}`);
      }

      performance.mark(`${markName}_end`);
      performance.measure(markName, `${markName}_start`, `${markName}_end`);
      
      const duration = performance.now() - start;
      this.performanceMarks.delete(markName);
      
      return duration;
    } catch (error) {
      this.debug.logger.error('Error ending performance mark:', error);
      return null;
    }
  }

  trackPerformanceMeasure(entry) {
    try {
      if (entry.name === 'analysis') {
        const totalAnalyses = this.metrics.get('totalAnalyses');
        const currentAvg = this.metrics.get('averageAnalysisTime');
        const newAvg = ((currentAvg * (totalAnalyses - 1)) + entry.duration) / totalAnalyses;
        this.metrics.set('averageAnalysisTime', newAvg);
      }

      this.trackEvent('performance', entry.name, null, entry.duration);
    } catch (error) {
      this.debug.logger.error('Error tracking performance measure:', error);
    }
  }

  getMetrics() {
    try {
      const metricsObject = {};
      for (const [key, value] of this.metrics) {
        if (value instanceof Map) {
          metricsObject[key] = Object.fromEntries(value);
        } else {
          metricsObject[key] = value;
        }
      }
      return metricsObject;
    } catch (error) {
      this.debug.logger.error('Error getting metrics:', error);
      return {};
    }
  }

  getEvents(options = {}) {
    try {
      const {
        category = null,
        startTime = null,
        endTime = null,
        limit = null
      } = options;

      let filteredEvents = this.events;

      if (category) {
        filteredEvents = filteredEvents.filter(event => event.category === category);
      }

      if (startTime) {
        filteredEvents = filteredEvents.filter(event => 
          new Date(event.timestamp) >= new Date(startTime));
      }

      if (endTime) {
        filteredEvents = filteredEvents.filter(event => 
          new Date(event.timestamp) <= new Date(endTime));
      }

      if (limit && limit > 0) {
        filteredEvents = filteredEvents.slice(-limit);
      }

      return filteredEvents;
    } catch (error) {
      this.debug.logger.error('Error getting events:', error);
      return [];
    }
  }

  clearMetrics() {
    try {
      this.metrics.clear();
      this.initializeMetrics();
      this.debug.logger.info('Metrics cleared successfully');
    } catch (error) {
      this.debug.logger.error('Error clearing metrics:', error);
    }
  }

  clearEvents() {
    try {
      this.events = [];
      this.debug.logger.info('Events cleared successfully');
    } catch (error) {
      this.debug.logger.error('Error clearing events:', error);
    }
  }

  exportAnalytics() {
    try {
      const data = {
        timestamp: new Date().toISOString(),
        metrics: this.getMetrics(),
        events: this.events,
        performance: {
          marks: Array.from(this.performanceMarks.entries()),
          measures: performance.getEntriesByType('measure')
        }
      };

      return JSON.stringify(data, null, 2);
    } catch (error) {
      this.debug.logger.error('Error exporting analytics:', error);
      throw error;
    }
  }
} 