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

    emitter.on('test', (n: number) => results.push(n * 2));
    emitter.on('test', (n: number) => results.push(n * 3));

    await emitter.emit('test', 5);

    expect(results).toEqual([10, 15]);
  });

  test('should unsubscribe correctly', async () => {
    let count = 0;
    const listener = () => count++;

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

    emitter.on('test', () => count++);
    emitter.on('test', () => count++);

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
});
