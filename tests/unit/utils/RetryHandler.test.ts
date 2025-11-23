import { RetryHandler } from '../../../src/utils/RetryHandler';

describe('RetryHandler', () => {
  test('should succeed on first try', async () => {
    const retry = new RetryHandler();
    const fn = jest.fn().mockResolvedValue('success');

    const result = await retry.execute(fn);

    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  test('should retry on failure and eventually succeed', async () => {
    const retry = new RetryHandler({ maxRetries: 3 });
    const fn = jest.fn()
      .mockRejectedValueOnce(new Error('fail1'))
      .mockRejectedValueOnce(new Error('fail2'))
      .mockResolvedValueOnce('success');

    const result = await retry.execute(fn);

    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(3);
  });

  test('should throw after max retries', async () => {
    const retry = new RetryHandler({ maxRetries: 2 });
    const fn = jest.fn().mockRejectedValue(new Error('persistent failure'));

    await expect(retry.execute(fn)).rejects.toThrow('persistent failure');
    expect(fn).toHaveBeenCalledTimes(3); // 1 initial + 2 retries
  });

  test('should respect shouldRetry predicate', async () => {
    const retry = new RetryHandler({
      maxRetries: 3,
      shouldRetry: (error) => error.message !== 'fatal',
    });

    const fn = jest.fn().mockRejectedValue(new Error('fatal'));

    await expect(retry.execute(fn)).rejects.toThrow('fatal');
    expect(fn).toHaveBeenCalledTimes(1); // No retries
  });

  test('should call onRetry callback', async () => {
    const onRetry = jest.fn();
    const retry = new RetryHandler({ maxRetries: 2, onRetry });
    const fn = jest.fn()
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValueOnce('success');

    await retry.execute(fn);

    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(onRetry).toHaveBeenCalledWith(1, expect.any(Error));
  });

  test('should use exponential backoff', async () => {
    const retry = new RetryHandler({
      maxRetries: 2,
      initialDelay: 100,
      exponentialBase: 2,
    });

    const fn = jest.fn()
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValueOnce('success');

    const start = Date.now();
    await retry.execute(fn);
    const duration = Date.now() - start;

    expect(duration).toBeGreaterThanOrEqual(100);
  });

  test('should wrap function with retry logic', async () => {
    let attempts = 0;
    const fn = async () => {
      attempts++;
      if (attempts < 3) throw new Error('fail');
      return 'success';
    };

    const wrapped = RetryHandler.wrap(fn, { maxRetries: 5 });
    const result = await wrapped();

    expect(result).toBe('success');
    expect(attempts).toBe(3);
  });

  describe('executeSync', () => {
    test('should succeed on first try', () => {
      const retry = new RetryHandler();
      const fn = jest.fn().mockReturnValue('success');

      const result = retry.executeSync(fn);

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    test('should retry on failure and eventually succeed', () => {
      const retry = new RetryHandler({ maxRetries: 3 });
      let attempts = 0;
      const fn = jest.fn(() => {
        attempts++;
        if (attempts < 3) throw new Error('fail');
        return 'success';
      });

      const result = retry.executeSync(fn);

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(3);
    });

    test('should throw after max retries', () => {
      const retry = new RetryHandler({ maxRetries: 2 });
      const fn = jest.fn(() => {
        throw new Error('persistent failure');
      });

      expect(() => retry.executeSync(fn)).toThrow('persistent failure');
      expect(fn).toHaveBeenCalledTimes(3); // 1 initial + 2 retries
    });

    test('should respect shouldRetry predicate', () => {
      const retry = new RetryHandler({
        maxRetries: 3,
        shouldRetry: (error) => error.message !== 'fatal',
      });

      const fn = jest.fn(() => {
        throw new Error('fatal');
      });

      expect(() => retry.executeSync(fn)).toThrow('fatal');
      expect(fn).toHaveBeenCalledTimes(1); // No retries
    });

    test('should call onRetry callback', () => {
      const onRetry = jest.fn();
      const retry = new RetryHandler({ maxRetries: 2, onRetry });
      let attempts = 0;
      const fn = jest.fn(() => {
        attempts++;
        if (attempts < 2) throw new Error('fail');
        return 'success';
      });

      retry.executeSync(fn);

      expect(onRetry).toHaveBeenCalledTimes(1);
      expect(onRetry).toHaveBeenCalledWith(1, expect.any(Error));
    });

    test('should handle different error types', () => {
      const retry = new RetryHandler({ maxRetries: 1 });

      const typeError = jest.fn(() => {
        throw new TypeError('Type error');
      });

      expect(() => retry.executeSync(typeError)).toThrow(TypeError);

      const rangeError = jest.fn(() => {
        throw new RangeError('Range error');
      });

      expect(() => retry.executeSync(rangeError)).toThrow(RangeError);
    });

    test('should not delay between sync retries', () => {
      const retry = new RetryHandler({
        maxRetries: 3,
        initialDelay: 1000, // This should be ignored in sync mode
      });

      let attempts = 0;
      const fn = () => {
        attempts++;
        if (attempts < 3) throw new Error('fail');
        return 'success';
      };

      const start = Date.now();
      const result = retry.executeSync(fn);
      const duration = Date.now() - start;

      expect(result).toBe('success');
      expect(duration).toBeLessThan(100); // Should be instant, no delays
    });

    test('should handle return values correctly', () => {
      const retry = new RetryHandler({ maxRetries: 2 });

      const numberFn = jest.fn().mockReturnValue(42);
      expect(retry.executeSync(numberFn)).toBe(42);

      const objectFn = jest.fn().mockReturnValue({ foo: 'bar' });
      expect(retry.executeSync(objectFn)).toEqual({ foo: 'bar' });

      const arrayFn = jest.fn().mockReturnValue([1, 2, 3]);
      expect(retry.executeSync(arrayFn)).toEqual([1, 2, 3]);

      const boolFn = jest.fn().mockReturnValue(true);
      expect(retry.executeSync(boolFn)).toBe(true);
    });

    test('should allow shouldRetry to filter retryable errors', () => {
      const retry = new RetryHandler({
        maxRetries: 5,
        shouldRetry: (error) => error.message.includes('temporary'),
      });

      let attempts = 0;
      const fn = () => {
        attempts++;
        if (attempts === 1) throw new Error('temporary failure');
        if (attempts === 2) throw new Error('permanent failure');
        return 'success';
      };

      expect(() => retry.executeSync(fn)).toThrow('permanent failure');
      expect(attempts).toBe(2); // First retry happens, second doesn't
    });
  });
});
