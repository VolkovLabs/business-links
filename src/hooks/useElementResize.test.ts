import { renderHook, act } from '@testing-library/react';
import { useElementResize } from './useElementResize';

/**
 * Mock ResizeObserver
 */
class MockResizeObserver {
  public callback: ResizeObserverCallback;
  public observedElements: Set<Element> = new Set();

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
  }

  observe = jest.fn((element: Element) => {
    this.observedElements.add(element);
  });

  unobserve = jest.fn((element: Element) => {
    this.observedElements.delete(element);
  });

  disconnect = jest.fn(() => {
    this.observedElements.clear();
  });

  /**
   * Helper method to trigger resize callback
   */
  trigger(entries: ResizeObserverEntry[]) {
    this.callback(entries, this);
  }

  /**
   * Helper to check if element is observed
   */
  isObserving(element: Element): boolean {
    return this.observedElements.has(element);
  }
}

/**
 * Store reference to mock instances
 */
let mockResizeObserverInstances: MockResizeObserver[] = [];

/**
 *  Mock ResizeObserver constructor
 */
const mockResizeObserverConstructor = jest.fn();

/**
 * Mock ResizeObserver globally
 */
const originalResizeObserver = global.ResizeObserver;

beforeAll(() => {
  global.ResizeObserver = mockResizeObserverConstructor;
});

afterAll(() => {
  global.ResizeObserver = originalResizeObserver;
});

beforeEach(() => {
  /**
   * Clear DOM
   */
  document.body.innerHTML = '';

  /**
   * Clear mock instances
   */
  mockResizeObserverInstances = [];

  /**
   * Reset and setup the constructor mock
   */
  mockResizeObserverConstructor.mockClear();
  mockResizeObserverConstructor.mockImplementation((callback: ResizeObserverCallback) => {
    const instance = new MockResizeObserver(callback);
    mockResizeObserverInstances.push(instance);
    return instance;
  });
});

describe('useElementResize', () => {
  const createTestElement = (id: string, rect: Partial<DOMRect> = {}) => {
    const element = document.createElement('div');
    element.id = id;
    element.className = 'test-element';

    /**
     * Mock getBoundingClientRect
     */
    const defaultRect: DOMRect = {
      x: 0,
      y: 0,
      width: 100,
      height: 50,
      top: 0,
      right: 100,
      bottom: 50,
      left: 0,
      toJSON: () => ({}),
      ...rect,
    };

    element.getBoundingClientRect = jest.fn().mockReturnValue(defaultRect);
    document.body.appendChild(element);

    return element;
  };

  it('Should return undefined initially when element does not exist', () => {
    const { result } = renderHook(() => useElementResize('#non-existent'));

    expect(result.current).toBeUndefined();
  });

  it('Should observe element with ResizeObserver', () => {
    const element = createTestElement('test');

    renderHook(() => useElementResize('#test'));

    expect(mockResizeObserverConstructor).toHaveBeenCalledTimes(1);
    expect(mockResizeObserverInstances[0].isObserving(element)).toEqual(true);
  });

  it('Should update rect when element is resized', () => {
    const element = createTestElement('test', { width: 100, height: 50 });

    const { result } = renderHook(() => useElementResize('#test'));

    expect(result.current).toEqual(expect.objectContaining({ width: 100, height: 50 }));

    /**
     * Mock new dimensions
     */
    const newRect = {
      x: 0,
      y: 0,
      width: 200,
      height: 100,
      top: 0,
      right: 200,
      bottom: 100,
      left: 0,
      toJSON: () => ({}),
    };
    element.getBoundingClientRect = jest.fn().mockReturnValue(newRect);

    /**
     * Resize
     */
    act(() => {
      mockResizeObserverInstances[0].trigger([
        {
          target: element,
          contentRect: newRect,
          borderBoxSize: [],
          contentBoxSize: [],
          devicePixelContentBoxSize: [],
        },
      ]);
    });

    expect(result.current).toEqual(expect.objectContaining({ width: 200, height: 100 }));
  });

  it('Should not observe when enabled is false', () => {
    createTestElement('test');

    renderHook(() => useElementResize('#test', false));

    expect(mockResizeObserverConstructor).not.toHaveBeenCalled();
  });

  it('Should return undefined when enabled is false', () => {
    createTestElement('test');

    const { result } = renderHook(() => useElementResize('#test', false));

    expect(result.current).toBeUndefined();
  });

  it('Should disconnect ResizeObserver on unmount', () => {
    const element = createTestElement('test');

    const { unmount } = renderHook(() => useElementResize('#test'));

    expect(mockResizeObserverInstances[0].isObserving(element)).toEqual(true);

    const disconnectSpy = jest.spyOn(mockResizeObserverInstances[0], 'disconnect');

    unmount();

    expect(disconnectSpy).toHaveBeenCalledTimes(1);
  });
});
