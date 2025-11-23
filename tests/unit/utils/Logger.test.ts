import { Logger, LogLevel } from '../../../src/utils/Logger';

describe('Logger', () => {
  let logger: Logger;

  beforeEach(() => {
    logger = Logger.getInstance();
    logger.clearLogs();
    logger.setLogLevel(LogLevel.DEBUG);
  });

  describe('Singleton pattern', () => {
    it('should return same instance', () => {
      const logger1 = Logger.getInstance();
      const logger2 = Logger.getInstance();

      expect(logger1).toBe(logger2);
    });
  });

  describe('Logging methods', () => {
    it('should log debug messages', () => {
      logger.debug('Debug message');

      const logs = logger.getLogs(LogLevel.DEBUG);
      expect(logs).toHaveLength(1);
      expect(logs[0].message).toBe('Debug message');
      expect(logs[0].level).toBe(LogLevel.DEBUG);
    });

    it('should log info messages', () => {
      logger.info('Info message');

      const logs = logger.getLogs(LogLevel.INFO);
      expect(logs).toHaveLength(1);
      expect(logs[0].message).toBe('Info message');
    });

    it('should log warning messages', () => {
      logger.warn('Warning message');

      const logs = logger.getLogs(LogLevel.WARN);
      expect(logs).toHaveLength(1);
      expect(logs[0].message).toBe('Warning message');
    });

    it('should log error messages', () => {
      const error = new Error('Test error');
      logger.error('Error message', error);

      const logs = logger.getLogs(LogLevel.ERROR);
      expect(logs).toHaveLength(1);
      expect(logs[0].message).toBe('Error message');
      expect(logs[0].error).toBe(error);
    });

    it('should log fatal messages', () => {
      const error = new Error('Fatal error');
      logger.fatal('Fatal message', error);

      const logs = logger.getLogs(LogLevel.FATAL);
      expect(logs).toHaveLength(1);
      expect(logs[0].message).toBe('Fatal message');
      expect(logs[0].error).toBe(error);
    });
  });

  describe('Log context', () => {
    it('should include context in log entry', () => {
      const context = { userId: '123', action: 'login' };
      logger.info('User action', context);

      const logs = logger.getLogs();
      expect(logs[0].context).toEqual(context);
    });
  });

  describe('Log level filtering', () => {
    it('should not log below set level', () => {
      logger.setLogLevel(LogLevel.WARN);

      logger.debug('Debug');
      logger.info('Info');
      logger.warn('Warning');
      logger.error('Error');

      const allLogs = logger.getLogs();
      expect(allLogs).toHaveLength(2);
      expect(allLogs[0].level).toBe(LogLevel.WARN);
      expect(allLogs[1].level).toBe(LogLevel.ERROR);
    });

    it('should log all levels when set to DEBUG', () => {
      logger.setLogLevel(LogLevel.DEBUG);

      logger.debug('Debug');
      logger.info('Info');
      logger.warn('Warning');

      expect(logger.getLogs()).toHaveLength(3);
    });
  });

  describe('Log retrieval', () => {
    beforeEach(() => {
      logger.debug('Debug 1');
      logger.info('Info 1');
      logger.warn('Warning 1');
      logger.error('Error 1');
    });

    it('should get all logs', () => {
      const logs = logger.getLogs();
      expect(logs).toHaveLength(4);
    });

    it('should get logs by level', () => {
      const debugLogs = logger.getLogs(LogLevel.DEBUG);
      const infoLogs = logger.getLogs(LogLevel.INFO);

      expect(debugLogs).toHaveLength(1);
      expect(infoLogs).toHaveLength(1);
    });

    it('should get logs by time range', () => {
      const start = new Date(Date.now() - 1000);
      const end = new Date(Date.now() + 1000);

      const logs = logger.getLogsByTimeRange(start, end);
      expect(logs.length).toBeGreaterThan(0);
    });

    it('should return empty array for future time range', () => {
      const start = new Date(Date.now() + 10000);
      const end = new Date(Date.now() + 20000);

      const logs = logger.getLogsByTimeRange(start, end);
      expect(logs).toHaveLength(0);
    });
  });

  describe('Log management', () => {
    it('should clear all logs', () => {
      logger.info('Message 1');
      logger.info('Message 2');
      expect(logger.getLogCount()).toBe(2);

      logger.clearLogs();
      expect(logger.getLogCount()).toBe(0);
    });

    it('should get log count', () => {
      logger.info('Message 1');
      logger.info('Message 2');
      logger.info('Message 3');

      expect(logger.getLogCount()).toBe(3);
    });

    it('should maintain max logs limit', () => {
      // Create logger with small max
      const smallLogger = Logger.getInstance();
      smallLogger.clearLogs();

      // Log more than max (default is 1000) to trigger shift
      for (let i = 0; i < 1005; i++) {
        smallLogger.info(`Message ${i}`);
      }

      // Should maintain exactly 1000 logs
      expect(smallLogger.getLogCount()).toBe(1000);

      // First log should be removed (logs 0-4 should be gone)
      const logs = smallLogger.getLogs();
      expect(logs[0].message).toBe('Message 5');
      expect(logs[logs.length - 1].message).toBe('Message 1004');
    });
  });

  describe('Timestamp', () => {
    it('should include timestamp in log entry', () => {
      const before = new Date();
      logger.info('Test message');
      const after = new Date();

      const logs = logger.getLogs();
      expect(logs[0].timestamp).toBeInstanceOf(Date);
      expect(logs[0].timestamp.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(logs[0].timestamp.getTime()).toBeLessThanOrEqual(after.getTime());
    });
  });
});
