/**
 * Rate limiter using token bucket algorithm
 */

export interface RateLimiterOptions {
  maxTokens: number;
  refillRate: number; // tokens per second
  refillInterval?: number; // ms
}

export class RateLimiter {
  private maxTokens: number;
  private tokens: number;
  private refillRate: number;
  private refillInterval: number;
  private lastRefill: number;
  private intervalId?: NodeJS.Timeout;

  constructor(options: RateLimiterOptions) {
    this.maxTokens = options.maxTokens;
    this.tokens = options.maxTokens;
    this.refillRate = options.refillRate;
    this.refillInterval = options.refillInterval ?? 1000;
    this.lastRefill = Date.now();
  }

  /**
   * Try to acquire tokens
   */
  public tryAcquire(tokens: number = 1): boolean {
    this.refill();

    if (this.tokens >= tokens) {
      this.tokens -= tokens;
      return true;
    }

    return false;
  }

  /**
   * Acquire tokens (wait if necessary)
   */
  public async acquire(tokens: number = 1): Promise<void> {
    while (!this.tryAcquire(tokens)) {
      await this.sleep(100);
    }
  }

  /**
   * Execute function with rate limiting
   */
  public async execute<T>(fn: () => Promise<T>, tokens: number = 1): Promise<T> {
    await this.acquire(tokens);
    return fn();
  }

  /**
   * Get remaining tokens
   */
  public getAvailableTokens(): number {
    this.refill();
    return Math.floor(this.tokens);
  }

  /**
   * Reset tokens to max
   */
  public reset(): void {
    this.tokens = this.maxTokens;
    this.lastRefill = Date.now();
  }

  /**
   * Start auto-refill
   */
  public startAutoRefill(): void {
    if (this.intervalId) {
      return;
    }

    this.intervalId = setInterval(() => {
      this.refill();
    }, this.refillInterval);
  }

  /**
   * Stop auto-refill
   */
  public stopAutoRefill(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
  }

  /**
   * Refill tokens based on time elapsed
   */
  private refill(): void {
    const now = Date.now();
    const timePassed = now - this.lastRefill;
    const tokensToAdd = (timePassed / 1000) * this.refillRate;

    this.tokens = Math.min(this.maxTokens, this.tokens + tokensToAdd);
    this.lastRefill = now;
  }

  /**
   * Sleep for specified milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Cleanup
   */
  public destroy(): void {
    this.stopAutoRefill();
  }
}
