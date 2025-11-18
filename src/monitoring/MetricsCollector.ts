/**
 * Metrics collection system
 */

export interface MetricValue {
  value: number;
  timestamp: Date;
  labels?: Record<string, string>;
}

export interface MetricSnapshot {
  count: number;
  sum: number;
  min: number;
  max: number;
  avg: number;
  p50?: number;
  p95?: number;
  p99?: number;
}

export class MetricsCollector {
  private counters: Map<string, number>;
  private gauges: Map<string, number>;
  private histograms: Map<string, number[]>;
  private labels: Map<string, Record<string, string>>;

  constructor() {
    this.counters = new Map();
    this.gauges = new Map();
    this.histograms = new Map();
    this.labels = new Map();
  }

  /**
   * Increment a counter
   */
  public incrementCounter(name: string, value: number = 1, labels?: Record<string, string>): void {
    const key = this.buildKey(name, labels);
    const current = this.counters.get(key) || 0;
    this.counters.set(key, current + value);

    if (labels) {
      this.labels.set(key, labels);
    }
  }

  /**
   * Set a gauge value
   */
  public setGauge(name: string, value: number, labels?: Record<string, string>): void {
    const key = this.buildKey(name, labels);
    this.gauges.set(key, value);

    if (labels) {
      this.labels.set(key, labels);
    }
  }

  /**
   * Record a histogram value
   */
  public recordHistogram(name: string, value: number, labels?: Record<string, string>): void {
    const key = this.buildKey(name, labels);

    if (!this.histograms.has(key)) {
      this.histograms.set(key, []);
    }

    this.histograms.get(key)!.push(value);

    if (labels) {
      this.labels.set(key, labels);
    }
  }

  /**
   * Get counter value
   */
  public getCounter(name: string, labels?: Record<string, string>): number {
    const key = this.buildKey(name, labels);
    return this.counters.get(key) || 0;
  }

  /**
   * Get gauge value
   */
  public getGauge(name: string, labels?: Record<string, string>): number | undefined {
    const key = this.buildKey(name, labels);
    return this.gauges.get(key);
  }

  /**
   * Get histogram snapshot
   */
  public getHistogram(name: string, labels?: Record<string, string>): MetricSnapshot | undefined {
    const key = this.buildKey(name, labels);
    const values = this.histograms.get(key);

    if (!values || values.length === 0) {
      return undefined;
    }

    const sorted = [...values].sort((a, b) => a - b);
    const sum = values.reduce((a, b) => a + b, 0);

    return {
      count: values.length,
      sum,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      avg: sum / values.length,
      p50: this.percentile(sorted, 0.5),
      p95: this.percentile(sorted, 0.95),
      p99: this.percentile(sorted, 0.99),
    };
  }

  /**
   * Get all metrics
   */
  public getAllMetrics(): {
    counters: Record<string, number>;
    gauges: Record<string, number>;
    histograms: Record<string, MetricSnapshot>;
  } {
    const counters: Record<string, number> = {};
    const gauges: Record<string, number> = {};
    const histograms: Record<string, MetricSnapshot> = {};

    this.counters.forEach((value, key) => {
      counters[key] = value;
    });

    this.gauges.forEach((value, key) => {
      gauges[key] = value;
    });

    this.histograms.forEach((_, key) => {
      const snapshot = this.getHistogram(this.extractName(key), this.labels.get(key));
      if (snapshot) {
        histograms[key] = snapshot;
      }
    });

    return { counters, gauges, histograms };
  }

  /**
   * Reset all metrics
   */
  public reset(): void {
    this.counters.clear();
    this.gauges.clear();
    this.histograms.clear();
    this.labels.clear();
  }

  /**
   * Reset specific metric
   */
  public resetMetric(name: string, labels?: Record<string, string>): void {
    const key = this.buildKey(name, labels);
    this.counters.delete(key);
    this.gauges.delete(key);
    this.histograms.delete(key);
    this.labels.delete(key);
  }

  /**
   * Measure execution time
   */
  public async measureTime<T>(
    name: string,
    fn: () => Promise<T>,
    labels?: Record<string, string>,
  ): Promise<T> {
    const start = Date.now();

    try {
      const result = await fn();
      const duration = Date.now() - start;
      this.recordHistogram(name, duration, labels);
      return result;
    } catch (error) {
      const duration = Date.now() - start;
      this.recordHistogram(name, duration, { ...labels, error: 'true' });
      throw error;
    }
  }

  /**
   * Build key from name and labels
   */
  private buildKey(name: string, labels?: Record<string, string>): string {
    if (!labels || Object.keys(labels).length === 0) {
      return name;
    }

    const labelPairs = Object.entries(labels)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}="${v}"`)
      .join(',');

    return `${name}{${labelPairs}}`;
  }

  /**
   * Extract name from key
   */
  private extractName(key: string): string {
    const braceIndex = key.indexOf('{');
    return braceIndex === -1 ? key : key.substring(0, braceIndex);
  }

  /**
   * Calculate percentile
   */
  private percentile(sorted: number[], p: number): number {
    const index = Math.ceil(sorted.length * p) - 1;
    return sorted[Math.max(0, index)];
  }
}
