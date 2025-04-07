// Debug.js - Logging and debugging utility module
class DebugLogger {
  constructor() {
    this.isDebugMode = process.env.NODE_ENV === 'development';
    this.logLevel = this.isDebugMode ? 'debug' : 'error';
    this.logLevels = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3
    };
    this.history = [];
    this.maxHistoryLength = 1000;
  }

  shouldLog(level) {
    return this.logLevels[level] >= this.logLevels[this.logLevel];
  }

  formatMessage(level, message, error = null) {
    const timestamp = new Date().toISOString();
    const formattedMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    
    if (error) {
      return `${formattedMessage}\n${error.stack || error.message || error}`;
    }
    
    return formattedMessage;
  }

  addToHistory(level, message) {
    this.history.push({
      timestamp: new Date(),
      level,
      message
    });

    // Keep history within size limit
    if (this.history.length > this.maxHistoryLength) {
      this.history.shift();
    }
  }

  debug(message, error = null) {
    if (this.shouldLog('debug')) {
      const formattedMessage = this.formatMessage('debug', message, error);
      console.debug(formattedMessage);
      this.addToHistory('debug', formattedMessage);
    }
  }

  info(message, error = null) {
    if (this.shouldLog('info')) {
      const formattedMessage = this.formatMessage('info', message, error);
      console.info(formattedMessage);
      this.addToHistory('info', formattedMessage);
    }
  }

  warn(message, error = null) {
    if (this.shouldLog('warn')) {
      const formattedMessage = this.formatMessage('warn', message, error);
      console.warn(formattedMessage);
      this.addToHistory('warn', formattedMessage);
    }
  }

  error(message, error = null) {
    if (this.shouldLog('error')) {
      const formattedMessage = this.formatMessage('error', message, error);
      console.error(formattedMessage);
      this.addToHistory('error', formattedMessage);
    }
  }

  getHistory(options = {}) {
    const {
      level = null,
      startTime = null,
      endTime = null,
      limit = null
    } = options;

    let filteredHistory = this.history;

    // Filter by log level
    if (level) {
      filteredHistory = filteredHistory.filter(entry => entry.level === level);
    }

    // Filter by time range
    if (startTime) {
      filteredHistory = filteredHistory.filter(entry => entry.timestamp >= startTime);
    }
    if (endTime) {
      filteredHistory = filteredHistory.filter(entry => entry.timestamp <= endTime);
    }

    // Apply limit
    if (limit && limit > 0) {
      filteredHistory = filteredHistory.slice(-limit);
    }

    return filteredHistory;
  }

  clearHistory() {
    this.history = [];
  }

  setLogLevel(level) {
    if (this.logLevels.hasOwnProperty(level)) {
      this.logLevel = level;
    } else {
      throw new Error(`Invalid log level: ${level}`);
    }
  }

  enableDebugMode() {
    this.isDebugMode = true;
    this.logLevel = 'debug';
  }

  disableDebugMode() {
    this.isDebugMode = false;
    this.logLevel = 'error';
  }

  async exportLogs(format = 'json') {
    try {
      const logs = {
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        logLevel: this.logLevel,
        history: this.history
      };

      switch (format.toLowerCase()) {
        case 'json':
          return JSON.stringify(logs, null, 2);
        case 'csv':
          return this.convertToCSV(logs);
        case 'text':
          return this.convertToText(logs);
        default:
          throw new Error(`Unsupported export format: ${format}`);
      }
    } catch (error) {
      this.error('Error exporting logs:', error);
      throw error;
    }
  }

  convertToCSV(logs) {
    const headers = ['timestamp', 'level', 'message'];
    const rows = logs.history.map(entry => [
      entry.timestamp.toISOString(),
      entry.level,
      entry.message
    ]);
    
    return [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
  }

  convertToText(logs) {
    return [
      `Log Export (${logs.timestamp})`,
      `Environment: ${logs.environment}`,
      `Log Level: ${logs.logLevel}`,
      '\nHistory:',
      ...logs.history.map(entry => 
        `${entry.timestamp.toISOString()} [${entry.level}] ${entry.message}`
      )
    ].join('\n');
  }
}

// Create a singleton instance
export const Debug = {
  logger: new DebugLogger()
}; 