import { HealthCheck, HealthStatus, CheckResult } from '../../../src/monitoring/HealthCheck';

describe('HealthCheck', () => {
  let health: HealthCheck;

  beforeEach(() => {
    health = new HealthCheck();
  });

  test('should register and run checks', async () => {
    health.registerCheck('test', () => ({
      status: HealthStatus.HEALTHY,
      message: 'All good',
    }));

    const result = await health.check();

    expect(result.status).toBe(HealthStatus.HEALTHY);
    expect(result.checks.test).toBeDefined();
  });

  test('should handle async checks', async () => {
    health.registerCheck('async', async () => {
      await new Promise(r => setTimeout(r, 10));
      return { status: HealthStatus.HEALTHY };
    });

    const result = await health.check();

    expect(result.checks.async.status).toBe(HealthStatus.HEALTHY);
  });

  test('should report UNHEALTHY on failure', async () => {
    health.registerCheck('failing', () => {
      throw new Error('Check failed');
    });

    const result = await health.check();

    expect(result.checks.failing.status).toBe(HealthStatus.UNHEALTHY);
  });

  test('should calculate overall DEGRADED status', async () => {
    health.registerCheck('good', () => ({ status: HealthStatus.HEALTHY }));
    health.registerCheck('degraded', () => ({ status: HealthStatus.DEGRADED }));

    const result = await health.check();

    expect(result.status).toBe(HealthStatus.DEGRADED);
  });

  test('should unregister checks', async () => {
    health.registerCheck('test1', () => ({ status: HealthStatus.HEALTHY }));
    health.registerCheck('test2', () => ({ status: HealthStatus.HEALTHY }));

    health.unregisterCheck('test1');

    const result = await health.check();

    expect(result.checks.test1).toBeUndefined();
    expect(result.checks.test2).toBeDefined();
  });

  test('should get check names', () => {
    health.registerCheck('check1', () => ({ status: HealthStatus.HEALTHY }));
    health.registerCheck('check2', () => ({ status: HealthStatus.HEALTHY }));
    health.registerCheck('check3', () => ({ status: HealthStatus.HEALTHY }));

    const names = health.getCheckNames();

    expect(names).toHaveLength(3);
    expect(names).toContain('check1');
    expect(names).toContain('check2');
    expect(names).toContain('check3');
  });

  test('should clear all checks', async () => {
    health.registerCheck('check1', () => ({ status: HealthStatus.HEALTHY }));
    health.registerCheck('check2', () => ({ status: HealthStatus.HEALTHY }));

    health.clearChecks();

    const result = await health.check();

    expect(Object.keys(result.checks)).toHaveLength(0);
  });

  describe('Static factory methods', () => {
    describe('createMemoryCheck', () => {
      test('should return HEALTHY when memory usage is below threshold', () => {
        const memCheck = HealthCheck.createMemoryCheck(0.99);
        const result = memCheck() as CheckResult;

        expect(result.status).toBe(HealthStatus.HEALTHY);
        expect(result.message).toContain('Memory usage');
        expect(result.metadata).toHaveProperty('heapUsed');
        expect(result.metadata).toHaveProperty('heapTotal');
        expect(result.metadata).toHaveProperty('rss');
      });

      test('should return DEGRADED when memory usage exceeds threshold', () => {
        const memCheck = HealthCheck.createMemoryCheck(0.01); // Very low threshold
        const result = memCheck() as CheckResult;

        expect(result.status).toBe(HealthStatus.DEGRADED);
        expect(result.message).toContain('Memory usage');
      });

      test('should use default threshold of 0.9', () => {
        const memCheck = HealthCheck.createMemoryCheck();
        const result = memCheck() as CheckResult;

        expect(result.status).toBeDefined();
        expect(result.message).toContain('%');
      });

      test('should include memory metadata', () => {
        const memCheck = HealthCheck.createMemoryCheck();
        const result = memCheck() as CheckResult;

        expect(result.metadata).toBeDefined();
        expect(typeof result.metadata!.heapUsed).toBe('number');
        expect(typeof result.metadata!.heapTotal).toBe('number');
        expect(typeof result.metadata!.rss).toBe('number');
      });
    });

    describe('createUptimeCheck', () => {
      test('should return HEALTHY when uptime meets minimum', async () => {
        const uptimeCheck = HealthCheck.createUptimeCheck(0);

        // Wait a bit to ensure uptime is positive
        await new Promise(resolve => setTimeout(resolve, 10));

        const result = uptimeCheck() as CheckResult;

        expect(result.status).toBe(HealthStatus.HEALTHY);
        expect(result.message).toContain('Uptime');
        expect(result.metadata).toHaveProperty('uptime');
      });

      test('should return DEGRADED when uptime is below minimum', () => {
        const uptimeCheck = HealthCheck.createUptimeCheck(999999999);
        const result = uptimeCheck() as CheckResult;

        expect(result.status).toBe(HealthStatus.DEGRADED);
        expect(result.message).toContain('Uptime');
      });

      test('should use default minimum uptime of 0', () => {
        const uptimeCheck = HealthCheck.createUptimeCheck();
        const result = uptimeCheck() as CheckResult;

        expect(result.status).toBe(HealthStatus.HEALTHY);
        expect(result.metadata?.uptime).toBeGreaterThanOrEqual(0);
      });

      test('should track uptime from creation time', async () => {
        const uptimeCheck = HealthCheck.createUptimeCheck(0);

        const result1 = uptimeCheck() as CheckResult;
        const uptime1 = result1.metadata!.uptime as number;

        await new Promise(resolve => setTimeout(resolve, 50));

        const result2 = uptimeCheck() as CheckResult;
        const uptime2 = result2.metadata!.uptime as number;

        expect(uptime2).toBeGreaterThan(uptime1);
      });
    });

    describe('createDatabaseCheck', () => {
      test('should return HEALTHY when database is connected', async () => {
        const pingFn = jest.fn().mockResolvedValue(true);
        const dbCheck = HealthCheck.createDatabaseCheck(pingFn);

        const result = await dbCheck();

        expect(result.status).toBe(HealthStatus.HEALTHY);
        expect(result.message).toBe('Database connected');
        expect(pingFn).toHaveBeenCalled();
      });

      test('should return UNHEALTHY when database is disconnected', async () => {
        const pingFn = jest.fn().mockResolvedValue(false);
        const dbCheck = HealthCheck.createDatabaseCheck(pingFn);

        const result = await dbCheck();

        expect(result.status).toBe(HealthStatus.UNHEALTHY);
        expect(result.message).toBe('Database disconnected');
      });

      test('should return UNHEALTHY when ping throws error', async () => {
        const pingFn = jest.fn().mockRejectedValue(new Error('Connection timeout'));
        const dbCheck = HealthCheck.createDatabaseCheck(pingFn);

        const result = await dbCheck();

        expect(result.status).toBe(HealthStatus.UNHEALTHY);
        expect(result.message).toContain('Database error');
        expect(result.message).toContain('Connection timeout');
      });

      test('should handle various database errors', async () => {
        const errors = [
          'Connection refused',
          'Timeout',
          'Authentication failed'
        ];

        for (const error of errors) {
          const pingFn = jest.fn().mockRejectedValue(new Error(error));
          const dbCheck = HealthCheck.createDatabaseCheck(pingFn);

          const result = await dbCheck();

          expect(result.status).toBe(HealthStatus.UNHEALTHY);
          expect(result.message).toContain(error);
        }
      });
    });
  });
});
