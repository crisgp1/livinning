const isClient = typeof window !== 'undefined';
const isDevelopment = process.env.NODE_ENV === 'development';

type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'performance' | 'database' | 'api' | 'user' | 'navigation';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  component: string;
  message: string;
  data?: any;
  stack?: string;
}

class Logger {
  private enabled: boolean;
  private logHistory: LogEntry[] = [];
  private maxHistorySize = 1000;

  constructor() {
    this.enabled = isDevelopment || (isClient && localStorage.getItem('DEBUG_LOGS') === 'true');
    
    // Initialize performance monitoring if in browser
    if (isClient) {
      this.initPerformanceLogging();
    }
  }

  private formatMessage(level: LogLevel, component: string, message: string): string {
    const timestamp = new Date().toISOString();
    const emoji = this.getLogEmoji(level);
    return `${emoji} [${timestamp}] [${level.toUpperCase()}] [${component}] ${message}`;
  }

  private getLogEmoji(level: LogLevel): string {
    const emojis = {
      debug: '🔍',
      info: 'ℹ️',
      warn: '⚠️',
      error: '❌',
      performance: '⚡',
      database: '🗄️',
      api: '🌐',
      user: '👤',
      navigation: '🧭'
    };
    return emojis[level] || 'ℹ️';
  }

  private addToHistory(entry: LogEntry) {
    this.logHistory.push(entry);
    if (this.logHistory.length > this.maxHistorySize) {
      this.logHistory.shift();
    }
  }

  private log(level: LogLevel, component: string, message: string, data?: any, forceLog = false) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      component,
      message,
      data,
      stack: level === 'error' ? new Error().stack : undefined
    };

    this.addToHistory(entry);

    if (this.enabled || forceLog || level === 'error' || level === 'warn') {
      const formattedMessage = this.formatMessage(level, component, message);
      
      switch (level) {
        case 'error':
          console.error(formattedMessage, data || '');
          break;
        case 'warn':
          console.warn(formattedMessage, data || '');
          break;
        case 'performance':
          console.log(formattedMessage, data || '');
          break;
        default:
          console.log(formattedMessage, data || '');
      }
    }
  }

  // Standard logging methods
  debug(component: string, message: string, data?: any) {
    this.log('debug', component, message, data);
  }

  info(component: string, message: string, data?: any) {
    this.log('info', component, message, data);
  }

  warn(component: string, message: string, data?: any) {
    this.log('warn', component, message, data, true);
  }

  error(component: string, message: string, error?: any) {
    this.log('error', component, message, error, true);
  }

  // Specialized logging methods
  performance(component: string, message: string, data?: any) {
    this.log('performance', component, message, data);
  }

  database(component: string, operation: string, data?: any) {
    this.log('database', component, `DB: ${operation}`, data);
  }

  api(component: string, method: string, url: string, data?: any) {
    this.log('api', component, `${method} ${url}`, data);
  }

  user(component: string, action: string, data?: any) {
    this.log('user', component, `User action: ${action}`, data);
  }

  navigation(component: string, action: string, data?: any) {
    this.log('navigation', component, `Navigation: ${action}`, data);
  }

  // Performance monitoring
  private initPerformanceLogging() {
    if (typeof window !== 'undefined' && window.performance) {
      // Log page load performance
      window.addEventListener('load', () => {
        setTimeout(() => {
          const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
          this.performance('PageLoad', 'Page load metrics', {
            loadTime: navigation.loadEventEnd - navigation.loadEventStart,
            domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
            totalTime: navigation.loadEventEnd - navigation.fetchStart
          });
        }, 0);
      });

      // Monitor long tasks
      if ('PerformanceObserver' in window) {
        try {
          const observer = new PerformanceObserver((list) => {
            list.getEntries().forEach((entry) => {
              if (entry.duration > 100) { // Log tasks longer than 100ms to reduce noise
                this.log('performance', 'LongTask', 'Long task detected', {
                  duration: `${entry.duration.toFixed(2)}ms`,
                  startTime: entry.startTime
                });
              }
            });
          });
          observer.observe({ entryTypes: ['longtask'] });
        } catch (e) {
          // PerformanceObserver not fully supported
          this.debug('Logger', 'PerformanceObserver not supported', { error: e });
        }
      }
    }
  }

  // Utility methods
  startTimer(label: string): () => void {
    const startTime = performance.now();
    this.performance('Timer', `Started: ${label}`);
    
    return () => {
      const endTime = performance.now();
      this.performance('Timer', `Finished: ${label}`, {
        duration: `${(endTime - startTime).toFixed(2)}ms`
      });
    };
  }

  getHistory(level?: LogLevel, component?: string): LogEntry[] {
    return this.logHistory.filter(entry => {
      return (!level || entry.level === level) && (!component || entry.component === component);
    });
  }

  exportLogs(): string {
    return JSON.stringify(this.logHistory, null, 2);
  }

  clearHistory() {
    this.logHistory = [];
    this.info('Logger', 'Log history cleared');
  }

  enable() {
    this.enabled = true;
    if (isClient) {
      localStorage.setItem('DEBUG_LOGS', 'true');
    }
    this.info('Logger', 'Logging enabled');
  }

  disable() {
    this.enabled = false;
    if (isClient) {
      localStorage.removeItem('DEBUG_LOGS');
    }
    console.log('🔇 Logging disabled');
  }

  getStatus() {
    return {
      enabled: this.enabled,
      historySize: this.logHistory.length,
      environment: isDevelopment ? 'development' : 'production'
    };
  }
}

const logger = new Logger();

// Expose logger globally for debugging
if (typeof window !== 'undefined') {
  (window as any).logger = logger;
}

export default logger;