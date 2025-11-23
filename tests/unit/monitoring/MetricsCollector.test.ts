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

  describe('resetMetric', () => {
    test('should reset specific counter', () => {
      metrics.incrementCounter('counter1', 10);
      metrics.incrementCounter('counter2', 20);

      metrics.resetMetric('counter1');

      expect(metrics.getCounter('counter1')).toBe(0);
      expect(metrics.getCounter('counter2')).toBe(20);
    });

    test('should reset specific gauge', () => {
      metrics.setGauge('gauge1', 100);
      metrics.setGauge('gauge2', 200);

      metrics.resetMetric('gauge1');

      expect(metrics.getGauge('gauge1')).toBeUndefined();
      expect(metrics.getGauge('gauge2')).toBe(200);
    });

    test('should reset specific histogram', () => {
      metrics.recordHistogram('hist1', 100);
      metrics.recordHistogram('hist2', 200);

      metrics.resetMetric('hist1');

      expect(metrics.getHistogram('hist1')).toBeUndefined();
      expect(metrics.getHistogram('hist2')).toBeDefined();
    });

    test('should reset metric with labels', () => {
      metrics.incrementCounter('requests', 1, { method: 'GET' });
      metrics.incrementCounter('requests', 1, { method: 'POST' });

      metrics.resetMetric('requests', { method: 'GET' });

      expect(metrics.getCounter('requests', { method: 'GET' })).toBe(0);
      expect(metrics.getCounter('requests', { method: 'POST' })).toBe(1);
    });

    test('should handle resetting non-existent metric', () => {
      expect(() => metrics.resetMetric('nonexistent')).not.toThrow();
    });
  });

  describe('measureTime error handling', () => {
    test('should record histogram even when function throws', async () => {
      const errorFn = async () => {
        await new Promise(resolve => setTimeout(resolve, 50));
        throw new Error('Operation failed');
      };

      await expect(metrics.measureTime('operation', errorFn)).rejects.toThrow('Operation failed');

      const snapshot = metrics.getHistogram('operation', { error: 'true' });
      expect(snapshot).toBeDefined();
      expect(snapshot!.min).toBeGreaterThanOrEqual(50);
    });

    test('should add error label when function fails', async () => {
      const errorFn = async () => {
        throw new Error('Failed');
      };

      await expect(metrics.measureTime('task', errorFn)).rejects.toThrow();

      // Should have recorded with error label
      const errorSnapshot = metrics.getHistogram('task', { error: 'true' });
      expect(errorSnapshot).toBeDefined();
      expect(errorSnapshot!.count).toBe(1);
    });

    test('should preserve existing labels when adding error label', async () => {
      const errorFn = async () => {
        throw new Error('Failed');
      };

      const labels = { service: 'api', endpoint: '/users' };

      await expect(metrics.measureTime('request', errorFn, labels)).rejects.toThrow();

      const errorSnapshot = metrics.getHistogram('request', { ...labels, error: 'true' });
      expect(errorSnapshot).toBeDefined();
    });

    test('should record both success and failure timings separately', async () => {
      const successFn = async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
        return 'success';
      };

      const failureFn = async () => {
        await new Promise(resolve => setTimeout(resolve, 20));
        throw new Error('failed');
      };

      await metrics.measureTime('operation', successFn);
      await expect(metrics.measureTime('operation', failureFn)).rejects.toThrow();

      const successSnapshot = metrics.getHistogram('operation');
      const failureSnapshot = metrics.getHistogram('operation', { error: 'true' });

      expect(successSnapshot).toBeDefined();
      expect(failureSnapshot).toBeDefined();
      expect(successSnapshot!.count).toBe(1);
      expect(failureSnapshot!.count).toBe(1);
    });
  });

  describe('labels handling', () => {
    test('should handle setGauge with labels', () => {
      metrics.setGauge('cpu', 50, { core: '0' });
      metrics.setGauge('cpu', 60, { core: '1' });

      expect(metrics.getGauge('cpu', { core: '0' })).toBe(50);
      expect(metrics.getGauge('cpu', { core: '1' })).toBe(60);
    });

    test('should handle recordHistogram with labels', () => {
      metrics.recordHistogram('latency', 100, { endpoint: '/api' });
      metrics.recordHistogram('latency', 200, { endpoint: '/web' });

      const apiSnapshot = metrics.getHistogram('latency', { endpoint: '/api' });
      const webSnapshot = metrics.getHistogram('latency', { endpoint: '/web' });

      expect(apiSnapshot).toBeDefined();
      expect(webSnapshot).toBeDefined();
      expect(apiSnapshot!.count).toBe(1);
      expect(webSnapshot!.count).toBe(1);
    });

    test('should maintain separate metrics for different label combinations', () => {
      metrics.incrementCounter('requests', 1, { method: 'GET', path: '/users' });
      metrics.incrementCounter('requests', 1, { method: 'POST', path: '/users' });
      metrics.incrementCounter('requests', 1, { method: 'GET', path: '/posts' });

      expect(metrics.getCounter('requests', { method: 'GET', path: '/users' })).toBe(1);
      expect(metrics.getCounter('requests', { method: 'POST', path: '/users' })).toBe(1);
      expect(metrics.getCounter('requests', { method: 'GET', path: '/posts' })).toBe(1);
    });

    test('should handle getAllMetrics with labeled metrics', () => {
      // Create metrics with various labels
      metrics.incrementCounter('http_requests', 5, { method: 'GET', status: '200' });
      metrics.incrementCounter('http_requests', 3, { method: 'POST', status: '201' });
      metrics.setGauge('memory_usage', 75, { region: 'us-east-1' });
      metrics.recordHistogram('request_duration', 150, { endpoint: '/api/users' });
      metrics.recordHistogram('request_duration', 200, { endpoint: '/api/posts' });

      const all = metrics.getAllMetrics();

      expect(all.counters).toBeDefined();
      expect(all.gauges).toBeDefined();
      expect(all.histograms).toBeDefined();

      // Verify labeled metrics are present
      expect(Object.keys(all.counters).length).toBeGreaterThan(0);
      expect(Object.keys(all.gauges).length).toBeGreaterThan(0);
      expect(Object.keys(all.histograms).length).toBeGreaterThan(0);
    });
  });
});
