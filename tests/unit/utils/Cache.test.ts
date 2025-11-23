import { Cache } from '../../../src/utils/Cache';

describe('Cache', () => {
  let cache: Cache<string>;

  beforeEach(() => {
    cache = new Cache<string>({ ttl: 1000, maxSize: 10 });
  });

  describe('Basic operations', () => {
    it('should set and get values', () => {
      cache.set('key1', 'value1');
      expect(cache.get('key1')).toBe('value1');
    });

    it('should return undefined for non-existent keys', () => {
      expect(cache.get('nonexistent')).toBeUndefined();
    });

    it('should check if key exists', () => {
      cache.set('key1', 'value1');
      expect(cache.has('key1')).toBe(true);
      expect(cache.has('key2')).toBe(false);
    });

    it('should delete values', () => {
      cache.set('key1', 'value1');
      expect(cache.delete('key1')).toBe(true);
      expect(cache.get('key1')).toBeUndefined();
    });

    it('should return false when deleting non-existent key', () => {
      expect(cache.delete('nonexistent')).toBe(false);
    });

    it('should clear all values', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.clear();

      expect(cache.size()).toBe(0);
      expect(cache.get('key1')).toBeUndefined();
    });
  });

  describe('TTL (Time To Live)', () => {
    it('should expire entries after TTL', async () => {
      const shortCache = new Cache<string>({ ttl: 100 });
      shortCache.set('key1', 'value1');

      expect(shortCache.get('key1')).toBe('value1');

      await new Promise((resolve) => setTimeout(resolve, 150));

      expect(shortCache.get('key1')).toBeUndefined();
    });

    it('should use custom TTL per entry', async () => {
      cache.set('short', 'value1', 100);
      cache.set('long', 'value2', 500);

      await new Promise((resolve) => setTimeout(resolve, 150));

      expect(cache.get('short')).toBeUndefined();
      expect(cache.get('long')).toBe('value2');
    });

    it('should remove expired entries from has()', async () => {
      const shortCache = new Cache<string>({ ttl: 100 });
      shortCache.set('key1', 'value1');

      expect(shortCache.has('key1')).toBe(true);

      await new Promise((resolve) => setTimeout(resolve, 150));

      expect(shortCache.has('key1')).toBe(false);
    });
  });

  describe('Size management', () => {
    it('should return correct size', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.set('key3', 'value3');

      expect(cache.size()).toBe(3);
    });

    it('should enforce max size', () => {
      const smallCache = new Cache<string>({ maxSize: 3 });

      smallCache.set('key1', 'value1');
      smallCache.set('key2', 'value2');
      smallCache.set('key3', 'value3');
      smallCache.set('key4', 'value4');

      expect(smallCache.size()).toBe(3);
      expect(smallCache.get('key1')).toBeUndefined(); // First one removed (FIFO)
      expect(smallCache.get('key4')).toBe('value4');
    });

    it('should not remove when updating existing key', () => {
      const smallCache = new Cache<string>({ maxSize: 2 });

      smallCache.set('key1', 'value1');
      smallCache.set('key2', 'value2');
      smallCache.set('key1', 'updated');

      expect(smallCache.size()).toBe(2);
      expect(smallCache.get('key1')).toBe('updated');
      expect(smallCache.get('key2')).toBe('value2');
    });
  });

  describe('Keys and values', () => {
    it('should return all keys', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.set('key3', 'value3');

      const keys = cache.keys();
      expect(keys).toHaveLength(3);
      expect(keys).toContain('key1');
      expect(keys).toContain('key2');
      expect(keys).toContain('key3');
    });

    it('should return all values', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');

      const values = cache.values();
      expect(values).toHaveLength(2);
      expect(values).toContain('value1');
      expect(values).toContain('value2');
    });
  });

  describe('Statistics', () => {
    it('should track hits and misses', () => {
      cache.set('key1', 'value1');

      cache.get('key1'); // hit
      cache.get('key1'); // hit
      cache.get('key2'); // miss
      cache.get('key3'); // miss

      const stats = cache.getStats();
      expect(stats.hits).toBe(2);
      expect(stats.misses).toBe(2);
      expect(stats.hitRate).toBe(0.5);
    });

    it('should reset statistics', () => {
      cache.set('key1', 'value1');
      cache.get('key1');
      cache.get('key2');

      cache.resetStats();

      const stats = cache.getStats();
      expect(stats.hits).toBe(0);
      expect(stats.misses).toBe(0);
    });

    it('should handle zero total accesses', () => {
      const stats = cache.getStats();
      expect(stats.hitRate).toBe(0);
    });

    it('should clear stats on cache clear', () => {
      cache.set('key1', 'value1');
      cache.get('key1');

      cache.clear();

      const stats = cache.getStats();
      expect(stats.hits).toBe(0);
      expect(stats.misses).toBe(0);
    });
  });

  describe('getOrSet', () => {
    it('should return cached value if exists', () => {
      cache.set('key1', 'cached');

      const value = cache.getOrSet('key1', () => 'new');

      expect(value).toBe('cached');
    });

    it('should set and return new value if not exists', () => {
      const value = cache.getOrSet('key1', () => 'new');

      expect(value).toBe('new');
      expect(cache.get('key1')).toBe('new');
    });

    it('should use custom TTL', async () => {
      cache.getOrSet('key1', () => 'value', 100);

      await new Promise((resolve) => setTimeout(resolve, 150));

      expect(cache.get('key1')).toBeUndefined();
    });
  });

  describe('getOrSetAsync', () => {
    it('should return cached value if exists', async () => {
      cache.set('key1', 'cached');

      const value = await cache.getOrSetAsync('key1', async () => 'new');

      expect(value).toBe('cached');
    });

    it('should set and return new value if not exists', async () => {
      const value = await cache.getOrSetAsync('key1', async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        return 'async-value';
      });

      expect(value).toBe('async-value');
      expect(cache.get('key1')).toBe('async-value');
    });
  });

  describe('Batch operations', () => {
    it('should set multiple entries', () => {
      cache.setMultiple([
        { key: 'key1', value: 'value1' },
        { key: 'key2', value: 'value2' },
        { key: 'key3', value: 'value3', ttl: 500 },
      ]);

      expect(cache.get('key1')).toBe('value1');
      expect(cache.get('key2')).toBe('value2');
      expect(cache.get('key3')).toBe('value3');
    });

    it('should get multiple entries', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.set('key3', 'value3');

      const result = cache.getMultiple(['key1', 'key2', 'nonexistent']);

      expect(result.size).toBe(2);
      expect(result.get('key1')).toBe('value1');
      expect(result.get('key2')).toBe('value2');
      expect(result.has('nonexistent')).toBe(false);
    });

    it('should delete multiple entries', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.set('key3', 'value3');

      const deleted = cache.deleteMultiple(['key1', 'key2', 'nonexistent']);

      expect(deleted).toBe(2);
      expect(cache.get('key1')).toBeUndefined();
      expect(cache.get('key2')).toBeUndefined();
      expect(cache.get('key3')).toBe('value3');
    });
  });

  describe('Touch', () => {
    it('should refresh TTL of existing entry', async () => {
      const shortCache = new Cache<string>({ ttl: 100 });
      shortCache.set('key1', 'value1');

      await new Promise((resolve) => setTimeout(resolve, 60));

      shortCache.touch('key1', 200);

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(shortCache.get('key1')).toBe('value1');
    });

    it('should return false for non-existent entry', () => {
      expect(cache.touch('nonexistent')).toBe(false);
    });

    it('should return false for expired entry', async () => {
      const shortCache = new Cache<string>({ ttl: 50 });
      shortCache.set('key1', 'value1');

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(shortCache.touch('key1')).toBe(false);
    });

    it('should use default TTL when no TTL parameter provided', async () => {
      const cache = new Cache<string>({ ttl: 200 });
      cache.set('key1', 'value1', 100);

      await new Promise((resolve) => setTimeout(resolve, 60));

      // Touch without TTL parameter - should use default TTL (200ms)
      const touched = cache.touch('key1');
      expect(touched).toBe(true);

      await new Promise((resolve) => setTimeout(resolve, 100));

      // Should still exist because we refreshed with 200ms TTL
      expect(cache.get('key1')).toBe('value1');
    });
  });

  describe('Type safety', () => {
    it('should work with different types', () => {
      const numberCache = new Cache<number>();
      numberCache.set('key1', 123);
      expect(numberCache.get('key1')).toBe(123);

      const objectCache = new Cache<{ name: string }>();
      objectCache.set('key1', { name: 'test' });
      expect(objectCache.get('key1')).toEqual({ name: 'test' });
    });
  });

  describe('Cleanup expired entries', () => {
    it('should cleanup expired entries when calling size()', async () => {
      const shortCache = new Cache<string>({ ttl: 100 });
      shortCache.set('key1', 'value1');
      shortCache.set('key2', 'value2');
      shortCache.set('key3', 'value3');

      expect(shortCache.size()).toBe(3);

      // Wait for expiration
      await new Promise((resolve) => setTimeout(resolve, 150));

      // size() should trigger cleanup
      expect(shortCache.size()).toBe(0);
    });

    it('should cleanup expired entries when calling keys()', async () => {
      const shortCache = new Cache<string>({ ttl: 100 });
      shortCache.set('expired1', 'value1');
      shortCache.set('expired2', 'value2');

      expect(shortCache.keys()).toHaveLength(2);

      // Wait for expiration
      await new Promise((resolve) => setTimeout(resolve, 150));

      // keys() should trigger cleanup
      expect(shortCache.keys()).toHaveLength(0);
    });

    it('should cleanup expired entries when calling values()', async () => {
      const shortCache = new Cache<string>({ ttl: 100 });
      shortCache.set('key1', 'value1');
      shortCache.set('key2', 'value2');

      expect(shortCache.values()).toHaveLength(2);

      // Wait for expiration
      await new Promise((resolve) => setTimeout(resolve, 150));

      // values() should trigger cleanup
      expect(shortCache.values()).toHaveLength(0);
    });

    it('should cleanup multiple expired entries at once', async () => {
      const shortCache = new Cache<string>({ ttl: 50 });

      // Add multiple entries
      for (let i = 0; i < 10; i++) {
        shortCache.set(`key${i}`, `value${i}`);
      }

      expect(shortCache.size()).toBe(10);

      // Wait for all to expire
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Cleanup should remove all expired entries
      const remaining = shortCache.keys();
      expect(remaining).toHaveLength(0);
    });
  });
});
