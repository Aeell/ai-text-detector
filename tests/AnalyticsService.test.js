const { AnalyticsService } = require('../src/js/services/AnalyticsService');

// Mock HTTP requests
global.fetch = jest.fn(() => 
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ success: true })
  })
);

describe('AnalyticsService', () => {
  let analyticsService;

  beforeEach(() => {
    fetch.mockClear();
    analyticsService = new AnalyticsService({
      enabled: true,
      anonymizeIP: true,
      endpoint: 'https://analytics.example.com/collect'
    });
  });

  describe('Initialization', () => {
    it('should initialize with default values when config is not provided', () => {
      const defaultService = new AnalyticsService();
      expect(defaultService.isEnabled()).toBe(false);
    });

    it('should initialize with provided config', () => {
      expect(analyticsService.isEnabled()).toBe(true);
      expect(analyticsService.config.anonymizeIP).toBe(true);
    });
  });

  describe('Event Tracking', () => {
    it('should track events when enabled', async () => {
      const event = {
        category: 'Analysis',
        action: 'Text Analyzed',
        label: 'English Text',
        value: 500
      };

      await analyticsService.trackEvent(event);
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('https://analytics.example.com/collect'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          }),
          body: expect.stringContaining('"category":"Analysis"')
        })
      );
    });

    it('should not track events when disabled', async () => {
      analyticsService.setEnabled(false);
      await analyticsService.trackEvent({ category: 'Test', action: 'Disabled' });
      expect(fetch).not.toHaveBeenCalled();
    });

    it('should batch events when batching is enabled', async () => {
      analyticsService.enableBatching(3); // Batch size of 3
      
      await analyticsService.trackEvent({ category: 'Test', action: 'Event1' });
      await analyticsService.trackEvent({ category: 'Test', action: 'Event2' });
      
      // First two events should not trigger a send
      expect(fetch).not.toHaveBeenCalled();
      
      // Third event should trigger batch send
      await analyticsService.trackEvent({ category: 'Test', action: 'Event3' });
      expect(fetch).toHaveBeenCalledTimes(1);
      
      // Body should contain all three events
      const callBody = JSON.parse(fetch.mock.calls[0][1].body);
      expect(callBody.events.length).toBe(3);
    });
  });

  describe('Performance Monitoring', () => {
    it('should track performance metrics', async () => {
      // Mock performance API
      const originalPerformance = global.performance;
      global.performance = {
        timing: {
          navigationStart: 1600000000000,
          loadEventEnd: 1600000000500,
          domComplete: 1600000000300
        },
        getEntriesByType: jest.fn().mockReturnValue([
          { name: 'first-paint', startTime: 100 },
          { name: 'first-contentful-paint', startTime: 150 }
        ])
      };

      await analyticsService.trackPerformance();
      expect(fetch).toHaveBeenCalledTimes(1);
      
      // Check that performance data was included
      const callBody = JSON.parse(fetch.mock.calls[0][1].body);
      expect(callBody.metrics.pageLoadTime).toBe(500);
      expect(callBody.metrics.firstPaint).toBe(100);
      
      // Restore original performance object
      global.performance = originalPerformance;
    });
  });

  describe('Error Tracking', () => {
    it('should track errors', async () => {
      const error = new Error('Test error');
      error.stack = 'Error: Test error\n    at Context.<anonymous> (test.js:123:45)';
      
      await analyticsService.trackError(error);
      expect(fetch).toHaveBeenCalledTimes(1);
      
      const callBody = JSON.parse(fetch.mock.calls[0][1].body);
      expect(callBody.error.message).toBe('Test error');
      expect(callBody.error.stack).toBeDefined();
    });

    it('should anonymize error data when configured', async () => {
      analyticsService.config.anonymizeErrors = true;
      
      const error = new Error('Error with sensitive data: user@example.com');
      await analyticsService.trackError(error);
      
      const callBody = JSON.parse(fetch.mock.calls[0][1].body);
      expect(callBody.error.message).not.toContain('user@example.com');
    });
  });

  describe('User Sessions', () => {
    it('should generate and track session ID', async () => {
      analyticsService.startSession();
      
      // Track an event that should include session ID
      await analyticsService.trackEvent({ category: 'Test', action: 'SessionTest' });
      
      const callBody = JSON.parse(fetch.mock.calls[0][1].body);
      expect(callBody.sessionId).toBeDefined();
      expect(callBody.sessionId.length).toBeGreaterThan(0);
    });

    it('should end session and send final data', async () => {
      analyticsService.startSession();
      analyticsService.endSession();
      
      expect(fetch).toHaveBeenCalledTimes(1);
      
      const callBody = JSON.parse(fetch.mock.calls[0][1].body);
      expect(callBody.sessionEnd).toBe(true);
    });
  });

  describe('Data Consent', () => {
    it('should respect user consent settings', async () => {
      // User has not consented to data collection
      analyticsService.setUserConsent(false);
      await analyticsService.trackEvent({ category: 'Test', action: 'NoConsent' });
      expect(fetch).not.toHaveBeenCalled();
      
      // User consents to data collection
      analyticsService.setUserConsent(true);
      await analyticsService.trackEvent({ category: 'Test', action: 'WithConsent' });
      expect(fetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      // Mock a network error
      fetch.mockImplementationOnce(() => Promise.reject(new Error('Network error')));
      
      // This should not throw
      await analyticsService.trackEvent({ category: 'Test', action: 'NetworkFail' });
      
      // Should still make the call
      expect(fetch).toHaveBeenCalledTimes(1);
    });
  });
}); 