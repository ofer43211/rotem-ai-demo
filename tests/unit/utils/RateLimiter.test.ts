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
});
