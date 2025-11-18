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
});
