/**
 * End-to-End Test: Complete Application Workflow
 *
 * This test demonstrates all features working together
 */

import {
  UserService,
  Database,
  Cache,
  Logger,
  LogLevel,
  EventEmitter,
  RetryHandler,
  RateLimiter,
  CircuitBreaker,
  HealthCheck,
  MetricsCollector,
  HealthStatus,
} from '../../src';

describe('E2E: Complete Workflow', () => {
  it('should run complete application workflow', async () => {
    // Setup Infrastructure
    const logger = Logger.getInstance();
    logger.setLogLevel(LogLevel.INFO);

    const cache = new Cache<string>({ ttl: 60000 });
    const metrics = new MetricsCollector();
    const events = new EventEmitter();
    const health = new HealthCheck();

    const db = new Database();
    await db.connect();
    db.createTable('users');

    // Setup Resilience
    const retry = new RetryHandler({ maxRetries: 3 });
    const rateLimiter = new RateLimiter({ maxTokens: 100, refillRate: 10 });
    const circuitBreaker = new CircuitBreaker({ failureThreshold: 5 });

    // Setup Monitoring
    health.registerCheck('database', async () => ({
      status: db.isConnected() ? HealthStatus.HEALTHY : HealthStatus.UNHEALTHY,
      message: 'Database connection',
    }));

    health.registerCheck('cache', () => ({
      status: HealthStatus.HEALTHY,
      message: 'Cache OK',
    }));

    // Application Logic
    const userService = new UserService();

    events.on('user.created', (user: { id: string }) => {
      logger.info('User created', { userId: user.id });
      metrics.incrementCounter('users.created');
    });

    // Create user with all resilience patterns
    const createUser = await retry.execute(async () => {
      return await rateLimiter.execute(async () => {
        return await circuitBreaker.execute(async () => {
          const user = userService.createUser('test@example.com', 'Test User', 30);

          cache.set('user:' + user.id, user.id);
          await db.insert('users', { id: user.id, email: user.email, name: user.name });
          await events.emit('user.created', user);

          return user;
        });
      });
    });

    expect(createUser).toBeDefined();

    // Verify all components
    const cached = cache.get('user:' + createUser.id);
    expect(cached).toBe(createUser.id);

    const fromDb = await db.findById('users', createUser.id);
    expect(fromDb).toBeDefined();

    expect(metrics.getCounter('users.created')).toBe(1);

    const healthResult = await health.check();
    expect(healthResult.status).toBe(HealthStatus.HEALTHY);

    expect(logger.getLogCount()).toBeGreaterThan(0);

    // Cleanup
    await db.disconnect();
    events.removeAllListeners();
    logger.clearLogs();
    cache.clear();
    metrics.reset();
  });
});
