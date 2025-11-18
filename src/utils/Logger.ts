export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4,
}

export interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  error?: Error;
}

export class Logger {
  private static instance: Logger;
  private logLevel: LogLevel;
  private logs: LogEntry[];
  private maxLogs: number;

  private constructor(logLevel: LogLevel = LogLevel.INFO, maxLogs: number = 1000) {
    this.logLevel = logLevel;
    this.logs = [];
    this.maxLogs = maxLogs;
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  public setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  public debug(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  public info(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.INFO, message, context);
  }

  public warn(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.WARN, message, context);
  }

  public error(message: string, error?: Error, context?: Record<string, unknown>): void {
    this.log(LogLevel.ERROR, message, context, error);
  }

  public fatal(message: string, error?: Error, context?: Record<string, unknown>): void {
    this.log(LogLevel.FATAL, message, context, error);
  }

  private log(
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>,
    error?: Error,
  ): void {
    if (level < this.logLevel) {
      return;
    }

    const logEntry: LogEntry = {
      timestamp: new Date(),
      level,
      message,
      context,
      error,
    };

    this.logs.push(logEntry);

    // Maintain max logs limit
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Output to console in non-production
    if (process.env.NODE_ENV !== 'production') {
      this.consoleLog(logEntry);
    }
  }

  private consoleLog(entry: LogEntry): void {
    const levelName = LogLevel[entry.level];
    const timestamp = entry.timestamp.toISOString();
    const contextStr = entry.context ? JSON.stringify(entry.context) : '';

    const logMessage = `[${timestamp}] ${levelName}: ${entry.message} ${contextStr}`;

    switch (entry.level) {
      case LogLevel.DEBUG:
      case LogLevel.INFO:
        // Intentionally using console for logging purposes
        // eslint-disable-next-line no-console
        console.log(logMessage);
        break;
      case LogLevel.WARN:
        // eslint-disable-next-line no-console
        console.warn(logMessage);
        break;
      case LogLevel.ERROR:
      case LogLevel.FATAL:
        // eslint-disable-next-line no-console
        console.error(logMessage, entry.error);
        break;
    }
  }

  public getLogs(level?: LogLevel): LogEntry[] {
    if (level !== undefined) {
      return this.logs.filter((log) => log.level === level);
    }
    return [...this.logs];
  }

  public clearLogs(): void {
    this.logs = [];
  }

  public getLogCount(): number {
    return this.logs.length;
  }

  public getLogsByTimeRange(start: Date, end: Date): LogEntry[] {
    return this.logs.filter((log) => log.timestamp >= start && log.timestamp <= end);
  }
}
