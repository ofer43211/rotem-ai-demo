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

  test('should handle timeout errors', async () => {
    const breaker = new CircuitBreaker({ timeout: 50 });
    const slowFn = jest.fn(async () => {
      await new Promise(resolve => setTimeout(resolve, 200));
      return 'too late';
    });

    await expect(breaker.execute(slowFn)).rejects.toThrow('Operation timeout');
    expect(breaker.getFailureCount()).toBe(1);
  });

  test('should use forceClose to reset circuit', () => {
    const breaker = new CircuitBreaker({ failureThreshold: 1 });
    breaker.forceOpen();

    expect(breaker.getState()).toBe(CircuitState.OPEN);

    breaker.forceClose();

    expect(breaker.getState()).toBe(CircuitState.CLOSED);
    expect(breaker.getFailureCount()).toBe(0);
    expect(breaker.getSuccessCount()).toBe(0);
  });

  test('should return to OPEN from HALF_OPEN on failure', async () => {
    const breaker = new CircuitBreaker({
      failureThreshold: 1,
      successThreshold: 2,
      resetTimeout: 50
    });

    // Force circuit to OPEN
    const failFn = jest.fn().mockRejectedValue(new Error('fail'));
    try {
      await breaker.execute(failFn);
    } catch (e) {}

    expect(breaker.getState()).toBe(CircuitState.OPEN);

    // Wait for reset timeout
    await new Promise(r => setTimeout(r, 100));

    // Try to execute - should move to HALF_OPEN then fail back to OPEN
    try {
      await breaker.execute(failFn);
    } catch (e) {}

    expect(breaker.getState()).toBe(CircuitState.OPEN);
  }, 500);

  test('should track success count in HALF_OPEN state', async () => {
    const breaker = new CircuitBreaker({
      failureThreshold: 1,
      successThreshold: 3,
      resetTimeout: 50
    });

    // Open the circuit
    const failFn = jest.fn().mockRejectedValue(new Error('fail'));
    try {
      await breaker.execute(failFn);
    } catch (e) {}

    // Wait for reset
    await new Promise(r => setTimeout(r, 100));

    // Execute successful calls
    const successFn = jest.fn().mockResolvedValue('success');
    await breaker.execute(successFn); // 1st success
    expect(breaker.getSuccessCount()).toBe(1);
    expect(breaker.getState()).toBe(CircuitState.HALF_OPEN);

    await breaker.execute(successFn); // 2nd success
    expect(breaker.getSuccessCount()).toBe(2);
    expect(breaker.getState()).toBe(CircuitState.HALF_OPEN);

    await breaker.execute(successFn); // 3rd success - should close
    expect(breaker.getState()).toBe(CircuitState.CLOSED);
    expect(breaker.getSuccessCount()).toBe(0);
  }, 500);

  test('should reset failure count on success', async () => {
    const breaker = new CircuitBreaker({ failureThreshold: 5 });

    // Execute some failures
    const failFn = jest.fn().mockRejectedValue(new Error('fail'));
    try {
      await breaker.execute(failFn);
    } catch (e) {}
    try {
      await breaker.execute(failFn);
    } catch (e) {}

    expect(breaker.getFailureCount()).toBe(2);

    // Execute success - should reset failure count
    const successFn = jest.fn().mockResolvedValue('success');
    await breaker.execute(successFn);

    expect(breaker.getFailureCount()).toBe(0);
  });

  test('should handle custom thresholds', async () => {
    const breaker = new CircuitBreaker({
      failureThreshold: 10,
      successThreshold: 5,
    });

    const failFn = jest.fn().mockRejectedValue(new Error('fail'));

    // Execute 9 failures - should still be CLOSED
    for (let i = 0; i < 9; i++) {
      try {
        await breaker.execute(failFn);
      } catch (e) {}
    }

    expect(breaker.getState()).toBe(CircuitState.CLOSED);
    expect(breaker.getFailureCount()).toBe(9);

    // 10th failure should OPEN
    try {
      await breaker.execute(failFn);
    } catch (e) {}

    expect(breaker.getState()).toBe(CircuitState.OPEN);
  });

  test('should not call onStateChange when state does not change', async () => {
    const onStateChange = jest.fn();
    const breaker = new CircuitBreaker({ failureThreshold: 5, onStateChange });

    const failFn = jest.fn().mockRejectedValue(new Error('fail'));

    // Multiple failures while staying in CLOSED state
    try {
      await breaker.execute(failFn);
    } catch (e) {}
    try {
      await breaker.execute(failFn);
    } catch (e) {}

    expect(breaker.getState()).toBe(CircuitState.CLOSED);
    expect(onStateChange).not.toHaveBeenCalled();
  });

  test('should handle multiple state transitions', async () => {
    const onStateChange = jest.fn();
    const breaker = new CircuitBreaker({
      failureThreshold: 1,
      successThreshold: 1,
      resetTimeout: 50,
      onStateChange
    });

    // CLOSED -> OPEN
    const failFn = jest.fn().mockRejectedValue(new Error('fail'));
    try {
      await breaker.execute(failFn);
    } catch (e) {}

    expect(onStateChange).toHaveBeenCalledWith(CircuitState.CLOSED, CircuitState.OPEN);

    // Wait for reset timeout
    await new Promise(r => setTimeout(r, 100));

    // OPEN -> HALF_OPEN -> CLOSED
    const successFn = jest.fn().mockResolvedValue('success');
    await breaker.execute(successFn);

    expect(onStateChange).toHaveBeenCalledWith(CircuitState.OPEN, CircuitState.HALF_OPEN);
    expect(onStateChange).toHaveBeenCalledWith(CircuitState.HALF_OPEN, CircuitState.CLOSED);
    expect(onStateChange).toHaveBeenCalledTimes(3);
  }, 500);

  test('should handle fast operations with timeout', async () => {
    const breaker = new CircuitBreaker({ timeout: 1000 });
    const fastFn = jest.fn(async () => {
      await new Promise(resolve => setTimeout(resolve, 10));
      return 'quick result';
    });

    const result = await breaker.execute(fastFn);

    expect(result).toBe('quick result');
    expect(breaker.getState()).toBe(CircuitState.CLOSED);
  });

  test('should reset success count on failure in HALF_OPEN', async () => {
    const breaker = new CircuitBreaker({
      failureThreshold: 1,
      successThreshold: 3,
      resetTimeout: 50
    });

    // Open circuit
    const failFn = jest.fn().mockRejectedValue(new Error('fail'));
    try {
      await breaker.execute(failFn);
    } catch (e) {}

    // Wait for reset
    await new Promise(r => setTimeout(r, 100));

    // Get some successes
    const successFn = jest.fn().mockResolvedValue('success');
    await breaker.execute(successFn);
    await breaker.execute(successFn);

    expect(breaker.getSuccessCount()).toBe(2);
    expect(breaker.getState()).toBe(CircuitState.HALF_OPEN);

    // Fail - should reset success count and go back to OPEN
    try {
      await breaker.execute(failFn);
    } catch (e) {}

    expect(breaker.getSuccessCount()).toBe(0);
    expect(breaker.getState()).toBe(CircuitState.OPEN);
  }, 500);
});
