import { CircuitBreaker, CircuitState } from '../../../src/utils/CircuitBreaker';

describe('CircuitBreaker', () => {
  test('should start in CLOSED state', () => {
    const breaker = new CircuitBreaker();
    expect(breaker.getState()).toBe(CircuitState.CLOSED);
  });

  test('should execute successfully when closed', async () => {
    const breaker = new CircuitBreaker();
    const fn = jest.fn().mockResolvedValue('success');

    const result = await breaker.execute(fn);

    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  test('should open circuit after failures', async () => {
    const breaker = new CircuitBreaker({ failureThreshold: 3 });
    const fn = jest.fn().mockRejectedValue(new Error('fail'));

    for (let i = 0; i < 3; i++) {
      try {
        await breaker.execute(fn);
      } catch (e) {
        // Expected
      }
    }

    expect(breaker.getState()).toBe(CircuitState.OPEN);
  });

  test('should reject calls when circuit is open', async () => {
    const breaker = new CircuitBreaker();
    breaker.forceOpen();

    await expect(breaker.execute(async () => 'test')).rejects.toThrow('Circuit breaker is OPEN');
  });

  test('should transition to HALF_OPEN after reset timeout', async () => {
    const breaker = new CircuitBreaker({ failureThreshold: 1, resetTimeout: 100 });
    const fn = jest.fn().mockRejectedValue(new Error('fail'));

    try {
      await breaker.execute(fn);
    } catch (e) {
      // Expected
    }

    expect(breaker.getState()).toBe(CircuitState.OPEN);

    await new Promise(r => setTimeout(r, 150));

    const successFn = jest.fn().mockResolvedValue('success');
    await breaker.execute(successFn);

    expect(breaker.getState()).toBe(CircuitState.HALF_OPEN);
  }, 500);

  test('should close circuit after successful calls in HALF_OPEN', async () => {
    const breaker = new CircuitBreaker({ successThreshold: 2, failureThreshold: 1, resetTimeout: 50 });
    
    const failFn = jest.fn().mockRejectedValue(new Error('fail'));
    try {
      await breaker.execute(failFn);
    } catch (e) {}

    await new Promise(r => setTimeout(r, 100));

    const successFn = jest.fn().mockResolvedValue('success');
    await breaker.execute(successFn);
    await breaker.execute(successFn);

    expect(breaker.getState()).toBe(CircuitState.CLOSED);
  }, 500);

  test('should track failure count', async () => {
    const breaker = new CircuitBreaker();
    const fn = jest.fn().mockRejectedValue(new Error('fail'));

    try {
      await breaker.execute(fn);
    } catch (e) {}

    expect(breaker.getFailureCount()).toBe(1);
  });

  test('should reset breaker', () => {
    const breaker = new CircuitBreaker();
    breaker.forceOpen();

    breaker.reset();

    expect(breaker.getState()).toBe(CircuitState.CLOSED);
    expect(breaker.getFailureCount()).toBe(0);
  });

  test('should call onStateChange callback', async () => {
    const onStateChange = jest.fn();
    const breaker = new CircuitBreaker({ failureThreshold: 1, onStateChange });
    const fn = jest.fn().mockRejectedValue(new Error('fail'));

    try {
      await breaker.execute(fn);
    } catch (e) {}

    expect(onStateChange).toHaveBeenCalledWith(CircuitState.CLOSED, CircuitState.OPEN);
  });
});
