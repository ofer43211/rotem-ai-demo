import { MetricsCollector } from '../../../src/monitoring/MetricsCollector';

describe('MetricsCollector', () => {
  let metrics: MetricsCollector;

  beforeEach(() => {
    metrics = new MetricsCollector();
  });

  test('should increment counter', () => {
    metrics.incrementCounter('requests');
    metrics.incrementCounter('requests', 2);

    expect(metrics.getCounter('requests')).toBe(3);
  });

  test('should set gauge', () => {
    metrics.setGauge('temperature', 25.5);

    expect(metrics.getGauge('temperature')).toBe(25.5);
  });

  test('should record histogram values', () => {
    metrics.recordHistogram('latency', 100);
    metrics.recordHistogram('latency', 200);
    metrics.recordHistogram('latency', 150);

    const snapshot = metrics.getHistogram('latency');

    expect(snapshot).toBeDefined();
    expect(snapshot!.count).toBe(3);
    expect(snapshot!.min).toBe(100);
    expect(snapshot!.max).toBe(200);
    expect(snapshot!.avg).toBe(150);
  });

  test('should calculate percentiles', () => {
    for (let i = 1; i <= 100; i++) {
      metrics.recordHistogram('values', i);
    }

    const snapshot = metrics.getHistogram('values');

    expect(snapshot!.p50).toBeGreaterThanOrEqual(50);
    expect(snapshot!.p95).toBeGreaterThanOrEqual(95);
    expect(snapshot!.p99).toBeGreaterThanOrEqual(99);
  });

  test('should support labels', () => {
    metrics.incrementCounter('requests', 1, { method: 'GET', path: '/api' });
    metrics.incrementCounter('requests', 1, { method: 'POST', path: '/api' });

    expect(metrics.getCounter('requests', { method: 'GET', path: '/api' })).toBe(1);
    expect(metrics.getCounter('requests', { method: 'POST', path: '/api' })).toBe(1);
  });

  test('should measure execution time', async () => {
    const result = await metrics.measureTime('operation', async () => {
      await new Promise(r => setTimeout(r, 50));
      return 'done';
    });

    expect(result).toBe('done');

    const snapshot = metrics.getHistogram('operation');
    expect(snapshot).toBeDefined();
    expect(snapshot!.min).toBeGreaterThanOrEqual(50);
  });

  test('should reset metrics', () => {
    metrics.incrementCounter('test');
    metrics.setGauge('test', 100);
    metrics.recordHistogram('test', 50);

    metrics.reset();

    expect(metrics.getCounter('test')).toBe(0);
    expect(metrics.getGauge('test')).toBeUndefined();
    expect(metrics.getHistogram('test')).toBeUndefined();
  });

  test('should get all metrics', () => {
    metrics.incrementCounter('counter1', 5);
    metrics.setGauge('gauge1', 100);
    metrics.recordHistogram('hist1', 50);

    const all = metrics.getAllMetrics();

    expect(all.counters).toBeDefined();
    expect(all.gauges).toBeDefined();
    expect(all.histograms).toBeDefined();
  });
});
