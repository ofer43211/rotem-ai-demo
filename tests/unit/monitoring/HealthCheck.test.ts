import { HealthCheck, HealthStatus } from '../../../src/monitoring/HealthCheck';

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
});
