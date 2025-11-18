/**
 * Performance Benchmarks
 *
 * These tests measure performance of critical operations.
 * Run with: npm run test:performance
 */

import { UserService } from '../../src/services/UserService';
import { Calculator } from '../../src/utils/Calculator';
import { Cache } from '../../src/utils/Cache';
import { Database } from '../../src/database/Database';

describe('Performance Benchmarks', () => {
  // Helper to measure execution time
  const measureTime = async (fn: () => void | Promise<void>): Promise<number> => {
    const start = performance.now();
    await fn();
    const end = performance.now();
    return end - start;
  };

  describe('UserService Performance', () => {
    let userService: UserService;

    beforeEach(() => {
      userService = new UserService();
    });

    it('should create 1000 users in reasonable time', async () => {
      const time = await measureTime(() => {
        for (let i = 0; i < 1000; i++) {
          userService.createUser(`user${i}@example.com`, `User ${i}`, 25);
        }
      });

      console.log(`Created 1000 users in ${time.toFixed(2)}ms`);
      expect(time).toBeLessThan(1000); // Should be < 1 second
    });

    it('should search through 1000 users efficiently', async () => {
      // Setup: Create 1000 users
      for (let i = 0; i < 1000; i++) {
        userService.createUser(`user${i}@example.com`, `User ${i}`, 25);
      }

      const time = await measureTime(() => {
        userService.searchUsersByName('User 5');
      });

      console.log(`Searched 1000 users in ${time.toFixed(2)}ms`);
      expect(time).toBeLessThan(100); // Should be < 100ms
    });

    it('should filter adult users from 10000 users efficiently', async () => {
      // Setup: Create mix of adults and minors
      for (let i = 0; i < 10000; i++) {
        const age = i % 2 === 0 ? 25 : 15;
        userService.createUser(`user${i}@example.com`, `User ${i}`, age);
      }

      const time = await measureTime(() => {
        userService.getAdultUsers();
      });

      console.log(`Filtered 10000 users in ${time.toFixed(2)}ms`);
      expect(time).toBeLessThan(500); // Should be < 500ms
    });
  });

  describe('Calculator Performance', () => {
    let calculator: Calculator;

    beforeEach(() => {
      calculator = new Calculator();
    });

    it('should perform 100000 additions efficiently', async () => {
      const time = await measureTime(() => {
        for (let i = 0; i < 100000; i++) {
          calculator.add(i, i + 1);
        }
      });

      console.log(`Performed 100000 additions in ${time.toFixed(2)}ms`);
      expect(time).toBeLessThan(100); // Should be < 100ms
    });

    it('should calculate factorial of 100 efficiently', async () => {
      const time = await measureTime(() => {
        calculator.factorial(100);
      });

      console.log(`Calculated 100! in ${time.toFixed(2)}ms`);
      expect(time).toBeLessThan(10); // Should be < 10ms
    });

    it('should handle large arrays efficiently', async () => {
      const numbers = Array.from({ length: 10000 }, (_, i) => i);

      const time = await measureTime(() => {
        calculator.average(numbers);
        calculator.max(numbers);
        calculator.min(numbers);
      });

      console.log(`Processed array of 10000 numbers in ${time.toFixed(2)}ms`);
      expect(time).toBeLessThan(50); // Should be < 50ms
    });
  });

  describe('Cache Performance', () => {
    let cache: Cache<string>;

    beforeEach(() => {
      cache = new Cache<string>({ maxSize: 10000 });
    });

    it('should set 10000 items efficiently', async () => {
      const time = await measureTime(() => {
        for (let i = 0; i < 10000; i++) {
          cache.set(`key${i}`, `value${i}`);
        }
      });

      console.log(`Set 10000 cache items in ${time.toFixed(2)}ms`);
      expect(time).toBeLessThan(500); // Should be < 500ms
    });

    it('should get 10000 items efficiently', async () => {
      // Setup
      for (let i = 0; i < 10000; i++) {
        cache.set(`key${i}`, `value${i}`);
      }

      const time = await measureTime(() => {
        for (let i = 0; i < 10000; i++) {
          cache.get(`key${i}`);
        }
      });

      console.log(`Retrieved 10000 cache items in ${time.toFixed(2)}ms`);
      expect(time).toBeLessThan(100); // Should be < 100ms
    });

    it('should handle cache misses efficiently', async () => {
      const time = await measureTime(() => {
        for (let i = 0; i < 10000; i++) {
          cache.get(`nonexistent${i}`);
        }
      });

      console.log(`Handled 10000 cache misses in ${time.toFixed(2)}ms`);
      expect(time).toBeLessThan(100); // Should be < 100ms
    });
  });

  describe('Database Performance', () => {
    let db: Database;

    beforeEach(async () => {
      db = new Database();
      await db.connect();
      db.createTable('benchmark');
    });

    afterEach(async () => {
      if (db.isConnected()) {
        await db.disconnect();
      }
    });

    it('should insert 1000 records efficiently', async () => {
      const time = await measureTime(async () => {
        for (let i = 0; i < 1000; i++) {
          await db.insert('benchmark', { id: `${i}`, value: `value${i}` });
        }
      });

      console.log(`Inserted 1000 records in ${time.toFixed(2)}ms`);
      expect(time).toBeLessThan(10000); // Should be < 10 seconds (async operations)
    });

    it('should query 1000 records efficiently', async () => {
      // Setup
      for (let i = 0; i < 1000; i++) {
        await db.insert('benchmark', { id: `${i}`, value: `value${i}`, order: i });
      }

      const time = await measureTime(async () => {
        await db.findAll('benchmark', {
          orderBy: 'order',
          orderDirection: 'DESC',
        });
      });

      console.log(`Queried and sorted 1000 records in ${time.toFixed(2)}ms`);
      expect(time).toBeLessThan(200); // Should be < 200ms
    });

    it('should handle transactions efficiently', async () => {
      // Setup
      for (let i = 0; i < 100; i++) {
        await db.insert('benchmark', { id: `${i}`, value: `value${i}` });
      }

      const time = await measureTime(async () => {
        await db.beginTransaction();
        for (let i = 0; i < 50; i++) {
          await db.update('benchmark', { id: `${i}`, value: `updated${i}` });
        }
        await db.commit();
      });

      console.log(`Transaction with 50 updates completed in ${time.toFixed(2)}ms`);
      expect(time).toBeLessThan(1000); // Should be < 1 second
    });
  });

  describe('Memory Usage', () => {
    it('should not leak memory with large cache', () => {
      const cache = new Cache({ maxSize: 10000 });
      const initialMemory = process.memoryUsage().heapUsed;

      // Fill cache
      for (let i = 0; i < 10000; i++) {
        cache.set(`key${i}`, `value${i}`);
      }

      const afterFillMemory = process.memoryUsage().heapUsed;
      const fillDelta = (afterFillMemory - initialMemory) / 1024 / 1024;

      // Clear cache
      cache.clear();

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const afterClearMemory = process.memoryUsage().heapUsed;
      const clearDelta = (afterClearMemory - initialMemory) / 1024 / 1024;

      console.log(`Memory used for 10000 items: ${fillDelta.toFixed(2)}MB`);
      console.log(`Memory after clear: ${clearDelta.toFixed(2)}MB`);

      // Memory should not grow indefinitely
      expect(fillDelta).toBeLessThan(100); // Should use < 100MB
    });

    it('should handle large dataset efficiently', () => {
      const userService = new UserService();
      const initialMemory = process.memoryUsage().heapUsed;

      // Create many users
      for (let i = 0; i < 5000; i++) {
        userService.createUser(`user${i}@example.com`, `User ${i}`, 25);
      }

      const afterMemory = process.memoryUsage().heapUsed;
      const delta = (afterMemory - initialMemory) / 1024 / 1024;

      console.log(`Memory used for 5000 users: ${delta.toFixed(2)}MB`);

      expect(delta).toBeLessThan(50); // Should use < 50MB
    });
  });

  describe('Stress Tests', () => {
    it('should handle concurrent operations', async () => {
      const cache = new Cache({ maxSize: 1000 });
      const promises: Promise<void>[] = [];

      const time = await measureTime(async () => {
        // Simulate concurrent reads and writes
        for (let i = 0; i < 100; i++) {
          promises.push(
            Promise.resolve().then(() => {
              cache.set(`key${i}`, `value${i}`);
              cache.get(`key${i}`);
              cache.has(`key${i}`);
            }),
          );
        }

        await Promise.all(promises);
      });

      console.log(`Completed 100 concurrent operations in ${time.toFixed(2)}ms`);
      expect(time).toBeLessThan(500);
    });

    it('should maintain performance under load', async () => {
      const userService = new UserService();

      // Warmup
      for (let i = 0; i < 100; i++) {
        userService.createUser(`warm${i}@example.com`, `User ${i}`, 25);
      }

      const times: number[] = [];

      // Measure 10 batches
      for (let batch = 0; batch < 10; batch++) {
        const time = await measureTime(() => {
          for (let i = 0; i < 100; i++) {
            const idx = batch * 100 + i;
            userService.createUser(`user${idx}@example.com`, `User ${idx}`, 25);
          }
        });
        times.push(time);
      }

      const avgTime = times.reduce((a, b) => a + b) / times.length;
      const maxTime = Math.max(...times);
      const minTime = Math.min(...times);

      console.log(`Average time per batch: ${avgTime.toFixed(2)}ms`);
      console.log(`Min: ${minTime.toFixed(2)}ms, Max: ${maxTime.toFixed(2)}ms`);

      // Performance should be consistent
      const variance = maxTime - minTime;
      expect(variance).toBeLessThan(avgTime * 2); // Variance < 200% of average
    });
  });
});
