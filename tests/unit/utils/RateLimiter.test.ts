import { RateLimiter } from '../../../src/utils/RateLimiter';

describe('RateLimiter', () => {
  test('should allow operations within limit', () => {
    const limiter = new RateLimiter({ maxTokens: 10, refillRate: 5 });

    expect(limiter.tryAcquire(5)).toBe(true);
    expect(limiter.tryAcquire(5)).toBe(true);
  });

  test('should deny operations exceeding limit', () => {
    const limiter = new RateLimiter({ maxTokens: 5, refillRate: 1 });

    limiter.tryAcquire(5);
    expect(limiter.tryAcquire(1)).toBe(false);
  });

  test('should refill tokens over time', async () => {
    const limiter = new RateLimiter({ maxTokens: 10, refillRate: 10, refillInterval: 100 });

    limiter.tryAcquire(10);
    expect(limiter.tryAcquire(1)).toBe(false);

    await new Promise(r => setTimeout(r, 150));

    expect(limiter.tryAcquire(1)).toBe(true);
  });

  test('should execute function with tokens', async () => {
    const limiter = new RateLimiter({ maxTokens: 5, refillRate: 1 });

    const result = await limiter.execute(async () => 'success', 2);

    expect(result).toBe('success');
    expect(limiter.getAvailableTokens()).toBe(3);
  });

  test('should reset tokens', () => {
    const limiter = new RateLimiter({ maxTokens: 10, refillRate: 1 });

    limiter.tryAcquire(10);
    expect(limiter.getAvailableTokens()).toBe(0);

    limiter.reset();
    expect(limiter.getAvailableTokens()).toBe(10);
  });

  test('should auto-refill when started', async () => {
    const limiter = new RateLimiter({ maxTokens: 10, refillRate: 10, refillInterval: 100 });

    limiter.tryAcquire(10);
    limiter.startAutoRefill();

    await new Promise(r => setTimeout(r, 150));

    expect(limiter.getAvailableTokens()).toBeGreaterThan(0);

    limiter.stopAutoRefill();
    limiter.destroy();
  });

  test('should wait for tokens in acquire', async () => {
    const limiter = new RateLimiter({ maxTokens: 5, refillRate: 10 });

    limiter.tryAcquire(5);

    const promise = limiter.acquire(1);
    await expect(promise).resolves.toBeUndefined();
  }, 2000);

  test('should not start auto-refill twice', () => {
    const limiter = new RateLimiter({ maxTokens: 10, refillRate: 5, refillInterval: 100 });

    limiter.startAutoRefill();
    limiter.startAutoRefill(); // Should return early

    limiter.stopAutoRefill();
    limiter.destroy();
  });

  test('should wait in acquire when tokens exhausted then succeed after refill', async () => {
    const limiter = new RateLimiter({ maxTokens: 10, refillRate: 10, refillInterval: 100 });

    // Exhaust all tokens
    limiter.tryAcquire(10);
    expect(limiter.getAvailableTokens()).toBe(0);

    // Start auto-refill so acquire can eventually succeed
    limiter.startAutoRefill();

    // This should wait until tokens are refilled
    const start = Date.now();
    await limiter.acquire(1);
    const duration = Date.now() - start;

    // Should have waited for refill
    expect(duration).toBeGreaterThanOrEqual(50);
    expect(limiter.getAvailableTokens()).toBeLessThan(10);

    limiter.stopAutoRefill();
    limiter.destroy();
  }, 2000);

  test('should handle tryAcquire with insufficient tokens correctly', () => {
    const limiter = new RateLimiter({ maxTokens: 3, refillRate: 1 });

    // Acquire all tokens
    expect(limiter.tryAcquire(3)).toBe(true);
    expect(limiter.getAvailableTokens()).toBe(0);

    // Try to acquire more - should fail
    expect(limiter.tryAcquire(1)).toBe(false);
    expect(limiter.tryAcquire(2)).toBe(false);

    limiter.destroy();
  });

  test('should use default token value of 1 in tryAcquire', () => {
    const limiter = new RateLimiter({ maxTokens: 5, refillRate: 1 });

    // Test tryAcquire() with default parameter
    expect(limiter.tryAcquire()).toBe(true);
    expect(limiter.getAvailableTokens()).toBe(4);

    // Test again
    expect(limiter.tryAcquire()).toBe(true);
    expect(limiter.getAvailableTokens()).toBe(3);

    limiter.destroy();
  });

  test('should use default token value in acquire', async () => {
    const limiter = new RateLimiter({ maxTokens: 5, refillRate: 10, refillInterval: 100 });

    limiter.tryAcquire(4);
    expect(limiter.getAvailableTokens()).toBe(1);

    // Test acquire() with default parameter
    await limiter.acquire();
    expect(limiter.getAvailableTokens()).toBe(0);

    limiter.destroy();
  });

  test('should use default token value in execute', async () => {
    const limiter = new RateLimiter({ maxTokens: 5, refillRate: 1 });

    limiter.tryAcquire(4);
    expect(limiter.getAvailableTokens()).toBe(1);

    // Test execute() with default parameter
    const result = await limiter.execute(async () => 'success');
    expect(result).toBe('success');
    expect(limiter.getAvailableTokens()).toBe(0);

    limiter.destroy();
  });
});
