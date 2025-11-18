/**
 * Health check system
 */

export enum HealthStatus {
  HEALTHY = 'HEALTHY',
  UNHEALTHY = 'UNHEALTHY',
  DEGRADED = 'DEGRADED',
}

export interface HealthCheckResult {
  status: HealthStatus;
  checks: Record<string, CheckResult>;
  timestamp: Date;
  uptime: number;
}

export interface CheckResult {
  status: HealthStatus;
  message?: string;
  latency?: number;
  metadata?: Record<string, unknown>;
}

export type HealthCheckFunction = () => Promise<CheckResult> | CheckResult;

export class HealthCheck {
  private checks: Map<string, HealthCheckFunction>;
  private startTime: number;

  constructor() {
    this.checks = new Map();
    this.startTime = Date.now();
  }

  /**
   * Register a health check
   */
  public registerCheck(name: string, check: HealthCheckFunction): void {
    this.checks.set(name, check);
  }

  /**
   * Unregister a health check
   */
  public unregisterCheck(name: string): void {
    this.checks.delete(name);
  }

  /**
   * Run all health checks
   */
  public async check(): Promise<HealthCheckResult> {
    const checks: Record<string, CheckResult> = {};
    const checkPromises: Promise<void>[] = [];

    for (const [name, checkFn] of this.checks.entries()) {
      const promise = (async () => {
        try {
          const startTime = Date.now();
          const result = await checkFn();
          const latency = Date.now() - startTime;

          checks[name] = {
            ...result,
            latency,
          };
        } catch (error) {
          checks[name] = {
            status: HealthStatus.UNHEALTHY,
            message: (error as Error).message,
          };
        }
      })();

      checkPromises.push(promise);
    }

    await Promise.all(checkPromises);

    const overallStatus = this.calculateOverallStatus(checks);
    const uptime = Date.now() - this.startTime;

    return {
      status: overallStatus,
      checks,
      timestamp: new Date(),
      uptime,
    };
  }

  /**
   * Get check names
   */
  public getCheckNames(): string[] {
    return Array.from(this.checks.keys());
  }

  /**
   * Clear all checks
   */
  public clearChecks(): void {
    this.checks.clear();
  }

  /**
   * Calculate overall health status
   */
  private calculateOverallStatus(checks: Record<string, CheckResult>): HealthStatus {
    const statuses = Object.values(checks).map((c) => c.status);

    if (statuses.every((s) => s === HealthStatus.HEALTHY)) {
      return HealthStatus.HEALTHY;
    }

    if (statuses.some((s) => s === HealthStatus.UNHEALTHY)) {
      return HealthStatus.UNHEALTHY;
    }

    return HealthStatus.DEGRADED;
  }

  /**
   * Create standard checks
   */
  public static createMemoryCheck(threshold: number = 0.9): HealthCheckFunction {
    return () => {
      const usage = process.memoryUsage();
      const heapUsed = usage.heapUsed;
      const heapTotal = usage.heapTotal;
      const ratio = heapUsed / heapTotal;

      return {
        status: ratio > threshold ? HealthStatus.DEGRADED : HealthStatus.HEALTHY,
        message: `Memory usage: ${(ratio * 100).toFixed(1)}%`,
        metadata: {
          heapUsed,
          heapTotal,
          rss: usage.rss,
        },
      };
    };
  }

  /**
   * Create uptime check
   */
  public static createUptimeCheck(minUptime: number = 0): HealthCheckFunction {
    const startTime = Date.now();

    return () => {
      const uptime = Date.now() - startTime;

      return {
        status: uptime >= minUptime ? HealthStatus.HEALTHY : HealthStatus.DEGRADED,
        message: `Uptime: ${uptime}ms`,
        metadata: { uptime },
      };
    };
  }

  /**
   * Create database check
   */
  public static createDatabaseCheck(
    pingFn: () => Promise<boolean>,
  ): HealthCheckFunction {
    return async () => {
      try {
        const isConnected = await pingFn();

        return {
          status: isConnected ? HealthStatus.HEALTHY : HealthStatus.UNHEALTHY,
          message: isConnected ? 'Database connected' : 'Database disconnected',
        };
      } catch (error) {
        return {
          status: HealthStatus.UNHEALTHY,
          message: `Database error: ${(error as Error).message}`,
        };
      }
    };
  }
}
