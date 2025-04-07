class Debug {
  constructor(namespace) {
    this.namespace = namespace;
    this.enabled = process.env.NODE_ENV !== 'production';
    this.logLevel = process.env.LOG_LEVEL || 'info';
    this.history = [];
    this.maxHistory = 1000;
    
    // Log levels: error: 0, warn: 1, info: 2, debug: 3
    this.levels = {
      error: 0,
      warn: 1,
      info: 2,
      debug: 3
    };
  }

  shouldLog(level) {
    return this.enabled && this.levels[level] <= this.levels[this.logLevel];
  }

  formatMessage(level, message, ...args) {
    const timestamp = new Date().toISOString();
    const formattedArgs = args.map(arg => {
      if (arg instanceof Error) {
        return arg.stack || arg.message;
      }
      if (typeof arg === 'object') {
        return JSON.stringify(arg, null, 2);
      }
      return arg;
    });

    return {
      timestamp,
      namespace: this.namespace,
      level,
      message,
      args: formattedArgs
    };
  }

  addToHistory(logEntry) {
    this.history.push(logEntry);
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    }
  }

  log(message, ...args) {
    if (!this.shouldLog('info')) return;

    const logEntry = this.formatMessage('info', message, ...args);
    this.addToHistory(logEntry);

    console.log(
      `[${logEntry.timestamp}] [${logEntry.namespace}] [INFO]:`,
      message,
      ...args
    );
  }

  error(message, ...args) {
    if (!this.shouldLog('error')) return;

    const logEntry = this.formatMessage('error', message, ...args);
    this.addToHistory(logEntry);

    console.error(
      `[${logEntry.timestamp}] [${logEntry.namespace}] [ERROR]:`,
      message,
      ...args
    );
  }

  warn(message, ...args) {
    if (!this.shouldLog('warn')) return;

    const logEntry = this.formatMessage('warn', message, ...args);
    this.addToHistory(logEntry);

    console.warn(
      `[${logEntry.timestamp}] [${logEntry.namespace}] [WARN]:`,
      message,
      ...args
    );
  }

  debug(message, ...args) {
    if (!this.shouldLog('debug')) return;

    const logEntry = this.formatMessage('debug', message, ...args);
    this.addToHistory(logEntry);

    console.debug(
      `[${logEntry.timestamp}] [${logEntry.namespace}] [DEBUG]:`,
      message,
      ...args
    );
  }

  getHistory(filter = {}) {
    let filteredHistory = [...this.history];

    if (filter.level) {
      filteredHistory = filteredHistory.filter(
        entry => entry.level === filter.level
      );
    }

    if (filter.startTime) {
      filteredHistory = filteredHistory.filter(
        entry => new Date(entry.timestamp) >= new Date(filter.startTime)
      );
    }

    if (filter.endTime) {
      filteredHistory = filteredHistory.filter(
        entry => new Date(entry.timestamp) <= new Date(filter.endTime)
      );
    }

    if (filter.search) {
      const searchRegex = new RegExp(filter.search, 'i');
      filteredHistory = filteredHistory.filter(entry =>
        searchRegex.test(entry.message) ||
        entry.args.some(arg => searchRegex.test(String(arg)))
      );
    }

    return filteredHistory;
  }

  clearHistory() {
    this.history = [];
  }

  setLogLevel(level) {
    if (this.levels.hasOwnProperty(level)) {
      this.logLevel = level;
      this.log(`Log level set to: ${level}`);
      return true;
    }
    this.warn(`Invalid log level: ${level}`);
    return false;
  }

  enable() {
    this.enabled = true;
    this.log('Debugging enabled');
  }

  disable() {
    this.log('Debugging disabled');
    this.enabled = false;
  }

  getStats() {
    const stats = {
      total: this.history.length,
      byLevel: {},
      timeRange: {
        start: this.history[0]?.timestamp,
        end: this.history[this.history.length - 1]?.timestamp
      }
    };

    Object.keys(this.levels).forEach(level => {
      stats.byLevel[level] = this.history.filter(
        entry => entry.level === level
      ).length;
    });

    return stats;
  }
}

module.exports = { Debug }; 