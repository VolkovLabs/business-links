import { CachedMcpState } from '@/types';

import { clearMcpCache, prepareToolContent, timeoutError } from './mcp-service';

describe('clearMcpCache', () => {
  it('Should close all clients and clear the cache', () => {
    const closeMock1 = jest.fn();
    const closeMock2 = jest.fn();

    const cacheRef = {
      current: {
        clients: [
          {
            client: { close: closeMock1 },
            server: {
              name: 'server1',
              url: 'url1',
              enabled: true,
            },
          },
          {
            client: { close: closeMock2 },
            server: {
              name: 'server1',
              url: 'url1',
              enabled: true,
            },
          },
        ],
        tools: [],
        configHash: 'abc',
        lastUpdated: Date.now(),
      },
    } as any;

    clearMcpCache(cacheRef);

    expect(closeMock1).toHaveBeenCalled();
    expect(closeMock2).toHaveBeenCalled();
    expect(cacheRef.current).toBeNull();
  });

  it('Should handle null cacheRef.current', () => {
    const cacheRef = { current: null } as React.RefObject<CachedMcpState | null>;

    expect(() => clearMcpCache(cacheRef)).not.toThrow();
    expect(cacheRef.current).toBeNull();
  });

  it('Should ignore client.close() errors', () => {
    const cacheRef = {
      current: {
        clients: [
          {
            client: {
              close: () => {
                throw new Error('fail');
              },
            },
          },
        ],
        tools: [],
        configHash: 'xyz',
        lastUpdated: Date.now(),
      },
    } as any;

    expect(() => clearMcpCache(cacheRef)).not.toThrow();
    expect(cacheRef.current).toBeNull();
  });
});

describe('timeoutError', () => {
  /**
   * Mock timers
   */
  jest.useFakeTimers();

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const serverName = 'TestServer';
  const timeout = 100;

  it('Should reject with a timeout error after the specified time', async () => {
    const promise = timeoutError(serverName, timeout);

    jest.advanceTimersByTime(timeout);

    await expect(promise).rejects.toThrow(`Server ${serverName} timed out after ${timeout}ms`);
  });

  it('Should return a Promise<never>', () => {
    const result = timeoutError(serverName, timeout);
    expect(result).toBeInstanceOf(Promise);
  });
});

describe('prepareToolContent', () => {
  it('Should return error message when isError is true and errorMessage is provided', () => {
    const result = {
      isError: true,
      content: null,
    };

    const output = prepareToolContent(result, 'myFunc', 'Something went wrong');
    expect(output).toEqual('Error executing myFunc: Something went wrong');
  });

  it('Should return error message with empty message when isError is true and no errorMessage is provided', () => {
    const result = {
      isError: true,
      content: null,
    };

    const output = prepareToolContent(result, 'myFunc');
    expect(output).toEqual('Error executing myFunc: ');
  });

  it('Should return joined text content from array', () => {
    const result = {
      isError: false,
      content: [{ text: 'Line 1' }, { text: 'Line 2' }, { notText: true }],
    };

    const output = prepareToolContent(result, 'myFunc');
    expect(output).toEqual('Line 1\nLine 2\n{"notText":true}');
  });

  it('Should return stringified content if not an array', () => {
    const result = {
      isError: false,
      content: { data: 123 },
    };

    const output = prepareToolContent(result, 'myFunc');
    expect(output).toEqual(JSON.stringify({ data: 123 }));
  });

  it('Should handle content=null and isError=false gracefully', () => {
    const result = {
      isError: false,
      content: null,
    };

    const output = prepareToolContent(result, 'myFunc');
    expect(output).toEqual('null');
  });

  it('Should handle content as primitive value', () => {
    const result = {
      isError: false,
      content: 'simple string',
    };

    const output = prepareToolContent(result, 'myFunc');
    expect(output).toEqual('"simple string"');
  });
});
