const { Debug } = require('../src/js/utils/Debug');

describe('Debug', () => {
  let debug;
  let originalConsole;

  beforeEach(() => {
    // Save original console methods
    originalConsole = {
      log: console.log,
      info: console.info,
      warn: console.warn,
      error: console.error,
      debug: console.debug
    };

    // Mock console methods
    console.log = jest.fn();
    console.info = jest.fn();
    console.warn = jest.fn();
    console.error = jest.fn();
    console.debug = jest.fn();

    // Create new Debug instance for each test
    debug = new Debug({
      level: 'info',
      prefix: 'TEST',
      enableTimestamps: true,
      enableStorage: true
    });
  });

  afterEach(() => {
    // Restore original console methods
    console.log = originalConsole.log;
    console.info = originalConsole.info;
    console.warn = originalConsole.warn;
    console.error = originalConsole.error;
    console.debug = originalConsole.debug;
  });

  describe('Initialization', () => {
    it('should initialize with provided configuration', () => {
      expect(debug.level).toBe('info');
      expect(debug.prefix).toBe('TEST');
      expect(debug.enableTimestamps).toBe(true);
      expect(debug.enableStorage).toBe(true);
    });

    it('should initialize with default configuration when none provided', () => {
      const defaultDebug = new Debug();
      expect(defaultDebug.level).toBe('error');
      expect(defaultDebug.prefix).toBe('DEBUG');
      expect(defaultDebug.enableTimestamps).toBe(false);
      expect(defaultDebug.enableStorage).toBe(false);
    });

    it('should validate log levels', () => {
      const invalidLevelDebug = new Debug({ level: 'invalid' });
      expect(invalidLevelDebug.level).toBe('error');

      const validLevelDebug = new Debug({ level: 'warn' });
      expect(validLevelDebug.level).toBe('warn');
    });
  });

  describe('Logging Levels', () => {
    it('should log at the specified level and above', () => {
      debug.setLevel('warn');

      debug.debug('Debug message');
      debug.info('Info message');
      debug.warn('Warning message');
      debug.error('Error message');

      expect(console.debug).not.toHaveBeenCalled();
      expect(console.info).not.toHaveBeenCalled();
      expect(console.warn).toHaveBeenCalled();
      expect(console.error).toHaveBeenCalled();
    });

    it('should log all messages when level is set to debug', () => {
      debug.setLevel('debug');

      debug.debug('Debug message');
      debug.info('Info message');
      debug.warn('Warning message');
      debug.error('Error message');

      expect(console.debug).toHaveBeenCalled();
      expect(console.info).toHaveBeenCalled();
      expect(console.warn).toHaveBeenCalled();
      expect(console.error).toHaveBeenCalled();
    });

    it('should not log anything when level is set to none', () => {
      debug.setLevel('none');

      debug.debug('Debug message');
      debug.info('Info message');
      debug.warn('Warning message');
      debug.error('Error message');

      expect(console.debug).not.toHaveBeenCalled();
      expect(console.info).not.toHaveBeenCalled();
      expect(console.warn).not.toHaveBeenCalled();
      expect(console.error).not.toHaveBeenCalled();
    });
  });

  describe('Message Formatting', () => {
    it('should include prefix in log messages', () => {
      debug.info('Test message');
      expect(console.info).toHaveBeenCalledWith(expect.stringContaining('TEST'));
    });

    it('should include timestamp when enabled', () => {
      debug.enableTimestamps = true;
      debug.info('Test message');
      
      // Timestamp format like [HH:MM:SS]
      const timestampRegex = /\[\d{2}:\d{2}:\d{2}\]/;
      expect(console.info).toHaveBeenCalledWith(expect.stringMatching(timestampRegex));
    });

    it('should not include timestamp when disabled', () => {
      debug.enableTimestamps = false;
      debug.info('Test message');
      
      // Timestamp format like [HH:MM:SS]
      const timestampRegex = /\[\d{2}:\d{2}:\d{2}\]/;
      expect(console.info).not.toHaveBeenCalledWith(expect.stringMatching(timestampRegex));
    });

    it('should format objects properly in log messages', () => {
      const testObject = { name: 'Test', value: 42 };
      debug.info('Object:', testObject);
      
      expect(console.info).toHaveBeenCalledWith(
        expect.stringContaining('TEST'),
        'Object:',
        testObject
      );
    });
  });

  describe('Log History', () => {
    it('should store log history when enabled', () => {
      debug.enableStorage = true;
      debug.clearHistory();
      
      debug.info('First message');
      debug.warn('Second message');
      debug.error('Third message');
      
      const history = debug.getHistory();
      expect(history.length).toBe(3);
      expect(history[0].level).toBe('info');
      expect(history[0].message).toBe('First message');
      expect(history[1].level).toBe('warn');
      expect(history[2].level).toBe('error');
    });

    it('should not store log history when disabled', () => {
      debug.enableStorage = false;
      debug.clearHistory();
      
      debug.info('Test message');
      
      const history = debug.getHistory();
      expect(history.length).toBe(0);
    });

    it('should clear log history', () => {
      debug.enableStorage = true;
      debug.info('Test message');
      
      expect(debug.getHistory().length).toBeGreaterThan(0);
      
      debug.clearHistory();
      expect(debug.getHistory().length).toBe(0);
    });

    it('should limit log history size', () => {
      debug.enableStorage = true;
      debug.clearHistory();
      debug.historyLimit = 5;
      
      for (let i = 0; i < 10; i++) {
        debug.info(`Message ${i}`);
      }
      
      const history = debug.getHistory();
      expect(history.length).toBe(5);
      expect(history[0].message).toBe('Message 5');
      expect(history[4].message).toBe('Message 9');
    });
  });

  describe('Group Logging', () => {
    it('should support grouping of logs', () => {
      console.group = jest.fn();
      console.groupEnd = jest.fn();
      
      debug.group('Group Title');
      debug.info('Grouped message');
      debug.groupEnd();
      
      expect(console.group).toHaveBeenCalledWith(expect.stringContaining('Group Title'));
      expect(console.info).toHaveBeenCalled();
      expect(console.groupEnd).toHaveBeenCalled();
    });

    it('should support collapsed groups', () => {
      console.groupCollapsed = jest.fn();
      console.groupEnd = jest.fn();
      
      debug.groupCollapsed('Collapsed Group');
      debug.info('Grouped message');
      debug.groupEnd();
      
      expect(console.groupCollapsed).toHaveBeenCalledWith(expect.stringContaining('Collapsed Group'));
      expect(console.info).toHaveBeenCalled();
      expect(console.groupEnd).toHaveBeenCalled();
    });
  });

  describe('Conditional Logging', () => {
    it('should log only if condition is true', () => {
      debug.infoIf(true, 'Conditional message 1');
      debug.infoIf(false, 'Conditional message 2');
      
      expect(console.info).toHaveBeenCalledTimes(1);
      expect(console.info).toHaveBeenCalledWith(expect.stringContaining('Conditional message 1'));
    });
  });

  describe('Performance Tracking', () => {
    beforeEach(() => {
      // Mock performance methods
      global.performance = {
        now: jest.fn()
          .mockReturnValueOnce(0)
          .mockReturnValueOnce(100)
      };
    });

    it('should track execution time', () => {
      const result = debug.trackTime(() => {
        // Simulate work
        return 'result';
      });
      
      expect(result.value).toBe('result');
      expect(result.time).toBe(100);
      expect(console.info).toHaveBeenCalledWith(
        expect.stringContaining('Execution time'),
        expect.stringContaining('100ms')
      );
    });

    it('should handle errors in tracked functions', () => {
      try {
        debug.trackTime(() => {
          throw new Error('Test error');
        });
      } catch (error) {
        expect(error.message).toBe('Test error');
      }
      
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('Error in tracked function'),
        expect.any(Error)
      );
    });
  });

  describe('Log Filtering', () => {
    it('should filter logs based on pattern', () => {
      debug.enableStorage = true;
      debug.clearHistory();
      
      debug.info('User login: user123');
      debug.info('Password reset: user456');
      debug.warn('Authentication failed: user789');
      
      const filtered = debug.filterLogs('user123');
      expect(filtered.length).toBe(1);
      expect(filtered[0].message).toBe('User login: user123');
      
      const allAuth = debug.filterLogs('Authentication');
      expect(allAuth.length).toBe(1);
      expect(allAuth[0].level).toBe('warn');
    });
  });

  describe('Environment Detection', () => {
    it('should detect environment correctly', () => {
      // Mock NODE_ENV
      const originalEnv = process.env.NODE_ENV;
      
      process.env.NODE_ENV = 'production';
      expect(debug.isProduction()).toBe(true);
      expect(debug.isDevelopment()).toBe(false);
      
      process.env.NODE_ENV = 'development';
      expect(debug.isProduction()).toBe(false);
      expect(debug.isDevelopment()).toBe(true);
      
      // Restore original
      process.env.NODE_ENV = originalEnv;
    });

    it('should automatically adjust log level based on environment', () => {
      // Mock NODE_ENV
      const originalEnv = process.env.NODE_ENV;
      
      debug.autoAdjustLogLevel();
      
      process.env.NODE_ENV = 'production';
      debug.autoAdjustLogLevel();
      expect(debug.level).toBe('error');
      
      process.env.NODE_ENV = 'development';
      debug.autoAdjustLogLevel();
      expect(debug.level).toBe('debug');
      
      // Restore original
      process.env.NODE_ENV = originalEnv;
    });
  });
}); 