export interface CacheEntry<T> {
  value: T;
  expiresAt: number;
  createdAt: number;
}

export interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum number of entries
}

export class Cache<T> {
  private cache: Map<string, CacheEntry<T>>;
  private defaultTTL: number;
  private maxSize: number;
  private hits: number;
  private misses: number;

  constructor(options: CacheOptions = {}) {
    this.cache = new Map();
    this.defaultTTL = options.ttl || 60000; // Default 1 minute
    this.maxSize = options.maxSize || 100;
    this.hits = 0;
    this.misses = 0;
  }

  public set(key: string, value: T, ttl?: number): void {
    // Enforce max size
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      // Remove oldest entry (FIFO)
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    const effectiveTTL = ttl !== undefined ? ttl : this.defaultTTL;
    const now = Date.now();

    this.cache.set(key, {
      value,
      expiresAt: now + effectiveTTL,
      createdAt: now,
    });
  }

  public get(key: string): T | undefined {
    const entry = this.cache.get(key);

    if (!entry) {
      this.misses++;
      return undefined;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.misses++;
      return undefined;
    }

    this.hits++;
    return entry.value;
  }

  public has(key: string): boolean {
    const entry = this.cache.get(key);

    if (!entry) {
      return false;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  public delete(key: string): boolean {
    return this.cache.delete(key);
  }

  public clear(): void {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
  }

  public size(): number {
    // Clean up expired entries first
    this.cleanupExpired();
    return this.cache.size;
  }

  public keys(): string[] {
    this.cleanupExpired();
    return Array.from(this.cache.keys());
  }

  public values(): T[] {
    this.cleanupExpired();
    return Array.from(this.cache.values()).map((entry) => entry.value);
  }

  public getStats(): { hits: number; misses: number; hitRate: number; size: number } {
    const total = this.hits + this.misses;
    const hitRate = total > 0 ? this.hits / total : 0;

    return {
      hits: this.hits,
      misses: this.misses,
      hitRate,
      size: this.size(),
    };
  }

  public resetStats(): void {
    this.hits = 0;
    this.misses = 0;
  }

  private cleanupExpired(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    this.cache.forEach((entry, key) => {
      if (now > entry.expiresAt) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach((key) => this.cache.delete(key));
  }

  public getOrSet(key: string, factory: () => T, ttl?: number): T {
    const cached = this.get(key);

    if (cached !== undefined) {
      return cached;
    }

    const value = factory();
    this.set(key, value, ttl);
    return value;
  }

  public async getOrSetAsync(key: string, factory: () => Promise<T>, ttl?: number): Promise<T> {
    const cached = this.get(key);

    if (cached !== undefined) {
      return cached;
    }

    const value = await factory();
    this.set(key, value, ttl);
    return value;
  }

  public setMultiple(entries: Array<{ key: string; value: T; ttl?: number }>): void {
    entries.forEach(({ key, value, ttl }) => {
      this.set(key, value, ttl);
    });
  }

  public getMultiple(keys: string[]): Map<string, T> {
    const result = new Map<string, T>();

    keys.forEach((key) => {
      const value = this.get(key);
      if (value !== undefined) {
        result.set(key, value);
      }
    });

    return result;
  }

  public deleteMultiple(keys: string[]): number {
    let deleted = 0;
    keys.forEach((key) => {
      if (this.delete(key)) {
        deleted++;
      }
    });
    return deleted;
  }

  public touch(key: string, ttl?: number): boolean {
    const entry = this.cache.get(key);

    if (!entry || Date.now() > entry.expiresAt) {
      return false;
    }

    const effectiveTTL = ttl !== undefined ? ttl : this.defaultTTL;
    entry.expiresAt = Date.now() + effectiveTTL;

    return true;
  }
}
