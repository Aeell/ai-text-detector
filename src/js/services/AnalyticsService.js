const Debug = require('../utils/Debug');

class AnalyticsService {
  constructor() {
    this.debug = new Debug('AnalyticsService');
    this.events = [];
    this.performanceMetrics = {};
    this.maxEvents = 1000;
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;
    
    try {
      this.startTime = Date.now();
      this.sessionId = this.generateSessionId();
      this.initialized = true;
      this.trackEvent('session_start', { sessionId: this.sessionId });
      this.debug.log('Analytics service initialized');
    } catch (error) {
      this.debug.error('Failed to initialize analytics:', error);
    }
  }

  trackEvent(eventName, data = {}) {
    if (!this.initialized) this.init();

    try {
      const event = {
        eventName,
        timestamp: Date.now(),
        sessionId: this.sessionId,
        data: {
          ...data,
          userAgent: navigator.userAgent,
          language: navigator.language
        }
      };

      this.events.push(event);
      if (this.events.length > this.maxEvents) {
        this.events.shift();
      }

      this.debug.log(`Event tracked: ${eventName}`);
      return true;
    } catch (error) {
      this.debug.error('Failed to track event:', error);
      return false;
    }
  }

  trackPerformance(metricName, value) {
    if (!this.initialized) this.init();

    try {
      if (!this.performanceMetrics[metricName]) {
        this.performanceMetrics[metricName] = [];
      }

      this.performanceMetrics[metricName].push({
        value,
        timestamp: Date.now()
      });

      this.debug.log(`Performance metric tracked: ${metricName}`);
      return true;
    } catch (error) {
      this.debug.error('Failed to track performance:', error);
      return false;
    }
  }

  getEvents(filter = {}) {
    try {
      let filteredEvents = [...this.events];

      if (filter.eventName) {
        filteredEvents = filteredEvents.filter(
          event => event.eventName === filter.eventName
        );
      }

      if (filter.startTime) {
        filteredEvents = filteredEvents.filter(
          event => event.timestamp >= filter.startTime
        );
      }

      if (filter.endTime) {
        filteredEvents = filteredEvents.filter(
          event => event.timestamp <= filter.endTime
        );
      }

      return filteredEvents;
    } catch (error) {
      this.debug.error('Failed to get events:', error);
      return [];
    }
  }

  getPerformanceMetrics(metricName) {
    try {
      if (!metricName) {
        return this.performanceMetrics;
      }

      return this.performanceMetrics[metricName] || [];
    } catch (error) {
      this.debug.error('Failed to get performance metrics:', error);
      return [];
    }
  }

  calculateAveragePerformance(metricName, timeWindow = 3600000) { // Default 1 hour
    try {
      const metrics = this.getPerformanceMetrics(metricName);
      if (!metrics.length) return null;

      const now = Date.now();
      const recentMetrics = metrics.filter(
        metric => now - metric.timestamp <= timeWindow
      );

      if (!recentMetrics.length) return null;

      const sum = recentMetrics.reduce((acc, metric) => acc + metric.value, 0);
      return sum / recentMetrics.length;
    } catch (error) {
      this.debug.error('Failed to calculate average performance:', error);
      return null;
    }
  }

  generateReport(options = {}) {
    try {
      const report = {
        sessionId: this.sessionId,
        startTime: this.startTime,
        duration: Date.now() - this.startTime,
        totalEvents: this.events.length,
        eventTypes: {},
        performanceMetrics: {}
      };

      // Event analysis
      this.events.forEach(event => {
        if (!report.eventTypes[event.eventName]) {
          report.eventTypes[event.eventName] = 0;
        }
        report.eventTypes[event.eventName]++;
      });

      // Performance analysis
      Object.keys(this.performanceMetrics).forEach(metricName => {
        report.performanceMetrics[metricName] = {
          count: this.performanceMetrics[metricName].length,
          average: this.calculateAveragePerformance(metricName),
          min: Math.min(...this.performanceMetrics[metricName].map(m => m.value)),
          max: Math.max(...this.performanceMetrics[metricName].map(m => m.value))
        };
      });

      if (options.includeRawData) {
        report.rawEvents = this.events;
        report.rawPerformanceMetrics = this.performanceMetrics;
      }

      return report;
    } catch (error) {
      this.debug.error('Failed to generate report:', error);
      return null;
    }
  }

  clear() {
    try {
      this.events = [];
      this.performanceMetrics = {};
      this.debug.log('Analytics data cleared');
      return true;
    } catch (error) {
      this.debug.error('Failed to clear analytics data:', error);
      return false;
    }
  }

  generateSessionId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

module.exports = { AnalyticsService }; 