/**
 * Circuit breaker pattern implementation
 */

export enum CircuitState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN',
}

export interface CircuitBreakerOptions {
  failureThreshold?: number;
  successThreshold?: number;
  timeout?: number;
  resetTimeout?: number;
  onStateChange?: (from: CircuitState, to: CircuitState) => void;
}

export class CircuitBreakerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CircuitBreakerError';
  }
}

export class CircuitBreaker {
  private state: CircuitState;
  private failureCount: number;
  private successCount: number;
  private nextAttempt: number;
  private failureThreshold: number;
  private successThreshold: number;
  private timeout: number;
  private resetTimeout: number;
  private onStateChange?: (from: CircuitState, to: CircuitState) => void;

  constructor(options: CircuitBreakerOptions = {}) {
    this.state = CircuitState.CLOSED;
    this.failureCount = 0;
    this.successCount = 0;
    this.nextAttempt = Date.now();
    this.failureThreshold = options.failureThreshold ?? 5;
    this.successThreshold = options.successThreshold ?? 2;
    this.timeout = options.timeout ?? 60000;
    this.resetTimeout = options.resetTimeout ?? 30000;
    this.onStateChange = options.onStateChange;
  }

  /**
   * Execute function through circuit breaker
   */
  public async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      if (Date.now() < this.nextAttempt) {
        throw new CircuitBreakerError('Circuit breaker is OPEN');
      }
      this.setState(CircuitState.HALF_OPEN);
    }

    try {
      const result = await this.executeWithTimeout(fn);
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  /**
   * Get current state
   */
  public getState(): CircuitState {
    return this.state;
  }

  /**
   * Get failure count
   */
  public getFailureCount(): number {
    return this.failureCount;
  }

  /**
   * Get success count
   */
  public getSuccessCount(): number {
    return this.successCount;
  }

  /**
   * Reset circuit breaker
   */
  public reset(): void {
    this.setState(CircuitState.CLOSED);
    this.failureCount = 0;
    this.successCount = 0;
    this.nextAttempt = Date.now();
  }

  /**
   * Force open the circuit
   */
  public forceOpen(): void {
    this.setState(CircuitState.OPEN);
    this.nextAttempt = Date.now() + this.resetTimeout;
  }

  /**
   * Force close the circuit
   */
  public forceClose(): void {
    this.reset();
  }

  /**
   * Handle successful execution
   */
  private onSuccess(): void {
    this.failureCount = 0;

    if (this.state === CircuitState.HALF_OPEN) {
      this.successCount++;

      if (this.successCount >= this.successThreshold) {
        this.setState(CircuitState.CLOSED);
        this.successCount = 0;
      }
    }
  }

  /**
   * Handle failed execution
   */
  private onFailure(): void {
    this.failureCount++;
    this.successCount = 0;

    if (this.state === CircuitState.HALF_OPEN) {
      this.setState(CircuitState.OPEN);
      this.nextAttempt = Date.now() + this.resetTimeout;
    } else if (this.failureCount >= this.failureThreshold) {
      this.setState(CircuitState.OPEN);
      this.nextAttempt = Date.now() + this.resetTimeout;
    }
  }

  /**
   * Set circuit state
   */
  private setState(newState: CircuitState): void {
    const oldState = this.state;

    if (oldState !== newState) {
      this.state = newState;

      if (this.onStateChange) {
        this.onStateChange(oldState, newState);
      }
    }
  }

  /**
   * Execute with timeout
   */
  private async executeWithTimeout<T>(fn: () => Promise<T>): Promise<T> {
    let timeoutId: NodeJS.Timeout | undefined;

    const timeoutPromise = new Promise<T>((_, reject) => {
      timeoutId = setTimeout(() => reject(new Error('Operation timeout')), this.timeout);
    });

    try {
      const result = await Promise.race([fn(), timeoutPromise]);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      return result;
    } catch (error) {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      throw error;
    }
  }
}
