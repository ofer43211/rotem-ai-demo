/**
 * Retry handler with exponential backoff
 */

export interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  exponentialBase?: number;
  shouldRetry?: (error: Error) => boolean;
  onRetry?: (attempt: number, error: Error) => void;
}

export class RetryHandler {
  private maxRetries: number;
  private initialDelay: number;
  private maxDelay: number;
  private exponentialBase: number;
  private shouldRetry: (error: Error) => boolean;
  private onRetry?: (attempt: number, error: Error) => void;

  constructor(options: RetryOptions = {}) {
    this.maxRetries = options.maxRetries ?? 3;
    this.initialDelay = options.initialDelay ?? 1000;
    this.maxDelay = options.maxDelay ?? 30000;
    this.exponentialBase = options.exponentialBase ?? 2;
    this.shouldRetry = options.shouldRetry ?? (() => true);
    this.onRetry = options.onRetry;
  }

  /**
   * Execute function with retry logic
   */
  public async execute<T>(fn: () => Promise<T>): Promise<T> {
    let lastError: Error;
    let attempt = 0;

    while (attempt <= this.maxRetries) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;

        if (attempt === this.maxRetries || !this.shouldRetry(lastError)) {
          throw lastError;
        }

        const delay = this.calculateDelay(attempt);

        if (this.onRetry) {
          this.onRetry(attempt + 1, lastError);
        }

        await this.sleep(delay);
        attempt++;
      }
    }

    throw lastError!;
  }

  /**
   * Execute function with retry logic (sync)
   */
  public executeSync<T>(fn: () => T): T {
    let lastError: Error;
    let attempt = 0;

    while (attempt <= this.maxRetries) {
      try {
        return fn();
      } catch (error) {
        lastError = error as Error;

        if (attempt === this.maxRetries || !this.shouldRetry(lastError)) {
          throw lastError;
        }

        if (this.onRetry) {
          this.onRetry(attempt + 1, lastError);
        }

        attempt++;
      }
    }

    throw lastError!;
  }

  /**
   * Calculate delay with exponential backoff
   */
  private calculateDelay(attempt: number): number {
    const delay = this.initialDelay * Math.pow(this.exponentialBase, attempt);
    return Math.min(delay, this.maxDelay);
  }

  /**
   * Sleep for specified milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Create a retryable version of a function
   */
  public static wrap<T extends (...args: never[]) => Promise<unknown>>(
    fn: T,
    options?: RetryOptions,
  ): T {
    const handler = new RetryHandler(options);
    return ((...args: Parameters<T>) => handler.execute(() => fn(...args))) as T;
  }
}
