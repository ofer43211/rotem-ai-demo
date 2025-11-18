/**
 * Event emitter for pub/sub pattern
 */

export type EventListener<T = unknown> = (data: T) => void | Promise<void>;

export interface EventSubscription {
  unsubscribe: () => void;
}

export class EventEmitter {
  private events: Map<string, Set<EventListener>>;
  private onceEvents: Map<string, Set<EventListener>>;
  private maxListeners: number;

  constructor(maxListeners: number = 100) {
    this.events = new Map();
    this.onceEvents = new Map();
    this.maxListeners = maxListeners;
  }

  /**
   * Subscribe to an event
   */
  public on<T = unknown>(event: string, listener: EventListener<T>): EventSubscription {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }

    const listeners = this.events.get(event)!;

    if (listeners.size >= this.maxListeners) {
      throw new Error(`Max listeners (${this.maxListeners}) exceeded for event: ${event}`);
    }

    listeners.add(listener as EventListener);

    return {
      unsubscribe: () => this.off(event, listener),
    };
  }

  /**
   * Subscribe to an event once
   */
  public once<T = unknown>(event: string, listener: EventListener<T>): EventSubscription {
    if (!this.onceEvents.has(event)) {
      this.onceEvents.set(event, new Set());
    }

    const listeners = this.onceEvents.get(event)!;
    listeners.add(listener as EventListener);

    return {
      unsubscribe: () => {
        this.onceEvents.get(event)?.delete(listener as EventListener);
      },
    };
  }

  /**
   * Unsubscribe from an event
   */
  public off<T = unknown>(event: string, listener: EventListener<T>): void {
    this.events.get(event)?.delete(listener as EventListener);
    this.onceEvents.get(event)?.delete(listener as EventListener);
  }

  /**
   * Emit an event
   */
  public async emit<T = unknown>(event: string, data: T): Promise<void> {
    // Regular listeners
    const listeners = this.events.get(event);
    if (listeners) {
      const promises = Array.from(listeners).map((listener) => listener(data));
      await Promise.all(promises);
    }

    // Once listeners
    const onceListeners = this.onceEvents.get(event);
    if (onceListeners) {
      const promises = Array.from(onceListeners).map((listener) => listener(data));
      await Promise.all(promises);
      this.onceEvents.delete(event);
    }
  }

  /**
   * Emit an event synchronously
   */
  public emitSync<T = unknown>(event: string, data: T): void {
    // Regular listeners
    const listeners = this.events.get(event);
    if (listeners) {
      listeners.forEach((listener) => listener(data));
    }

    // Once listeners
    const onceListeners = this.onceEvents.get(event);
    if (onceListeners) {
      onceListeners.forEach((listener) => listener(data));
      this.onceEvents.delete(event);
    }
  }

  /**
   * Remove all listeners for an event
   */
  public removeAllListeners(event?: string): void {
    if (event) {
      this.events.delete(event);
      this.onceEvents.delete(event);
    } else {
      this.events.clear();
      this.onceEvents.clear();
    }
  }

  /**
   * Get listener count for an event
   */
  public listenerCount(event: string): number {
    const regularCount = this.events.get(event)?.size || 0;
    const onceCount = this.onceEvents.get(event)?.size || 0;
    return regularCount + onceCount;
  }

  /**
   * Get all event names
   */
  public eventNames(): string[] {
    const regularEvents = Array.from(this.events.keys());
    const onceEvents = Array.from(this.onceEvents.keys());
    return [...new Set([...regularEvents, ...onceEvents])];
  }

  /**
   * Wait for an event
   */
  public waitFor<T = unknown>(event: string, timeout?: number): Promise<T> {
    return new Promise((resolve, reject) => {
      let timeoutId: NodeJS.Timeout | undefined;

      const listener = (data: T) => {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        resolve(data);
      };

      this.once(event, listener);

      if (timeout) {
        timeoutId = setTimeout(() => {
          this.off(event, listener);
          reject(new Error(`Event '${event}' timeout after ${timeout}ms`));
        }, timeout);
      }
    });
  }
}
