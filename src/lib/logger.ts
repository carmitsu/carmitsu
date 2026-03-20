type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  operation?: string;
  duration?: number;
  component?: string;
  userId?: string;
  requestId?: string;
  [key: string]: unknown;
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: LogContext;
}

const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const MIN_LOG_LEVEL: LogLevel = (process.env.LOG_LEVEL as LogLevel) || 'info';

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[MIN_LOG_LEVEL];
}

function formatLog(entry: LogEntry): string {
  const { timestamp, level, message, context } = entry;
  const contextStr = context ? ` ${JSON.stringify(context)}` : '';
  return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
}

function createLogEntry(level: LogLevel, message: string, context?: LogContext): LogEntry {
  return {
    timestamp: new Date().toISOString(),
    level,
    message,
    context: context ? { ...context } : undefined,
  };
}

export const logger = {
  debug(message: string, context?: LogContext): void {
    if (shouldLog('debug')) {
      const entry = createLogEntry('debug', message, context);
      console.debug(formatLog(entry));
    }
  },

  info(message: string, context?: LogContext): void {
    if (shouldLog('info')) {
      const entry = createLogEntry('info', message, context);
      console.log(formatLog(entry));
    }
  },

  warn(message: string, context?: LogContext): void {
    if (shouldLog('warn')) {
      const entry = createLogEntry('warn', message, context);
      console.warn(formatLog(entry));
    }
  },

  error(message: string, context?: LogContext): void {
    if (shouldLog('error')) {
      const entry = createLogEntry('error', message, context);
      console.error(formatLog(entry));
    }
  },

  async logOperation<T>(
    operation: string,
    fn: () => Promise<T>,
    context?: Omit<LogContext, 'operation' | 'duration'>
  ): Promise<T> {
    const startTime = Date.now();
    const operationContext = { operation, ...context };

    try {
      const result = await fn();
      const duration = Date.now() - startTime;
      this.info(`${operation} - sukces`, { ...operationContext, duration, success: true });
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.error(`${operation} - błąd`, {
        ...operationContext,
        duration,
        success: false,
        error: errorMessage,
      });
      throw error;
    }
  },
};

export type { LogLevel, LogContext };
