import { EventEmitter } from '../../../src/utils/EventEmitter';

describe('EventEmitter', () => {
  let emitter: EventEmitter;

  beforeEach(() => {
    emitter = new EventEmitter();
  });

  test('should subscribe and emit events', async () => {
    let received: string | undefined;

    emitter.on('test', (data: string) => {
      received = data;
    });

    await emitter.emit('test', 'hello');

    expect(received).toBe('hello');
  });

  test('should support once subscription', async () => {
    let count = 0;

    emitter.once('test', () => {
      count++;
    });

    await emitter.emit('test', null);
    await emitter.emit('test', null);

    expect(count).toBe(1);
  });

  test('should support multiple listeners', async () => {
    const results: number[] = [];

    emitter.on('test', (n: number) => { results.push(n * 2); });
    emitter.on('test', (n: number) => { results.push(n * 3); });

    await emitter.emit('test', 5);

    expect(results).toEqual([10, 15]);
  });

  test('should unsubscribe correctly', async () => {
    let count = 0;
    const listener = () => { count++; };

    emitter.on('test', listener);
    await emitter.emit('test', null);

    emitter.off('test', listener);
    await emitter.emit('test', null);

    expect(count).toBe(1);
  });

  test('should support waitFor', async () => {
    setTimeout(() => emitter.emit('test', 'value'), 100);

    const result = await emitter.waitFor<string>('test');
    expect(result).toBe('value');
  });

  test('should throw on max listeners exceeded', () => {
    const small = new EventEmitter(2);

    small.on('test', () => {});
    small.on('test', () => {});

    expect(() => small.on('test', () => {})).toThrow('Max listeners');
  });

  test('should count listeners correctly', () => {
    emitter.on('test', () => {});
    emitter.on('test', () => {});
    emitter.once('test', () => {});

    expect(emitter.listenerCount('test')).toBe(3);
  });

  test('should remove all listeners', async () => {
    let count = 0;

    emitter.on('test', () => { count++; });
    emitter.on('test', () => { count++; });

    emitter.removeAllListeners('test');
    await emitter.emit('test', null);

    expect(count).toBe(0);
  });

  test('should get event names', () => {
    emitter.on('event1', () => {});
    emitter.on('event2', () => {});

    const names = emitter.eventNames();
    expect(names).toContain('event1');
    expect(names).toContain('event2');
  });

  test('should emit synchronously', () => {
    let value = 0;

    emitter.on('test', (n: number) => {
      value = n;
    });

    emitter.emitSync('test', 42);

    expect(value).toBe(42);
  });

  test('should use subscription.unsubscribe() for on', async () => {
    let count = 0;
    const listener = () => { count++; };

    const subscription = emitter.on('test', listener);
    await emitter.emit('test', null);

    subscription.unsubscribe();
    await emitter.emit('test', null);

    expect(count).toBe(1);
  });

  test('should use subscription.unsubscribe() for once', async () => {
    let count = 0;
    const listener = () => { count++; };

    const subscription = emitter.once('test', listener);
    subscription.unsubscribe();
    await emitter.emit('test', null);

    expect(count).toBe(0);
  });

  test('should emit once listeners synchronously', () => {
    let count = 0;

    emitter.once('test', () => { count++; });
    emitter.emitSync('test', null);
    emitter.emitSync('test', null);

    expect(count).toBe(1);
  });

  test('should handle waitFor with timeout', async () => {
    const promise = emitter.waitFor('test', 100);

    await expect(promise).rejects.toThrow("Event 'test' timeout after 100ms");
  });

  test('should clear timeout when event arrives before timeout in waitFor', async () => {
    setTimeout(() => emitter.emit('test', 'fast'), 50);

    const result = await emitter.waitFor<string>('test', 200);
    expect(result).toBe('fast');
  });

  test('should remove all listeners globally', async () => {
    let count = 0;

    emitter.on('event1', () => { count++; });
    emitter.on('event2', () => { count++; });

    emitter.removeAllListeners();

    await emitter.emit('event1', null);
    await emitter.emit('event2', null);

    expect(count).toBe(0);
  });

  test('should combine regular and once listeners in event names', () => {
    emitter.on('regular', () => {});
    emitter.once('once', () => {});

    const names = emitter.eventNames();
    expect(names).toContain('regular');
    expect(names).toContain('once');
    expect(names).toHaveLength(2);
  });

  test('should return 0 listener count for events with no listeners', () => {
    // Event that was never registered
    expect(emitter.listenerCount('nonexistent')).toBe(0);

    // Event that had listeners but they were all removed
    emitter.on('temp', () => {});
    emitter.removeAllListeners('temp');
    expect(emitter.listenerCount('temp')).toBe(0);
  });
});
