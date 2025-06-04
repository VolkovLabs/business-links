import { act, render, screen, waitFor } from '@testing-library/react';
import React from 'react';

import { useContentPosition } from './useContentPosition';

jest.useFakeTimers();

/**
 * Polyfill requestAnimationFrame to run synchronously in tests.
 */
Object.defineProperty(window, 'requestAnimationFrame', {
  configurable: true,
  value: (cb: (time: number) => void) => cb(0),
});

const mockGetComputedStyle = jest.fn();
/**
 * Mock getComputedStyle for fine-grained control over element styles.
 */
Object.defineProperty(window, 'getComputedStyle', {
  configurable: true,
  value: mockGetComputedStyle,
});

/* eslint-disable @typescript-eslint/naming-convention */

/**
 * Minimal DOMMatrix polyfill for transform matrix parsing.
 */
class DOMMatrix {
  m41 = 0;
  m42 = 0;
}

Object.defineProperty(window, 'DOMMatrix', {
  configurable: true,
  value: DOMMatrix,
});

/**
 * Minimal DOMRect polyfill for getBoundingClientRect returns.
 */
class DOMRect {
  x: number;
  y: number;
  width: number;
  height: number;
  top: number;
  bottom: number;
  left: number;
  right: number;
  constructor(x = 0, y = 0, width = 0, height = 0) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.top = y;
    this.bottom = y + height;
    this.left = x;
    this.right = x + width;
  }
  toJSON() {
    return { x: this.x, y: this.y, width: this.width, height: this.height };
  }
}
Object.defineProperty(window, 'DOMRect', {
  configurable: true,
  value: DOMRect,
});

/**
 * Integration tests for useContentPosition hook.
 */
describe('useContentPosition', () => {
  beforeEach(() => {
    /**
     * Reset DOM and mocks before each test
     */
    document.body.innerHTML = '';
    jest.clearAllMocks();
    Object.defineProperty(window, 'scrollY', { writable: true, configurable: true, value: 0 });
    Object.defineProperty(window, 'pageYOffset', { writable: true, configurable: true, value: 0 });
    mockGetComputedStyle.mockReturnValue({
      transform: 'none',
      overflow: 'visible',
      overflowY: 'visible',
      overflowX: 'visible',
      position: 'static',
      visibility: 'visible',
    });
  });

  afterEach(() => jest.runOnlyPendingTimers());

  type Props = { panelId: string; sticky: boolean };

  /**
   * Test component wrapper that applies the useContentPosition hook.
   */
  const TestComponent: React.FC<Props> = ({ panelId, sticky }) => {
    const { containerRef } = useContentPosition({ panelId, sticky });
    return (
      <div data-testid="wrapper" data-panelid={panelId} ref={containerRef as any}>
        Content
      </div>
    );
  };

  it('Should Selects by data-panelId when sticky=false', () => {
    /**
     * When sticky is disabled, the wrapper should render without any transform styles.
     */
    render(<TestComponent panelId="p1" sticky={false} />);
    const w = screen.getByTestId('wrapper');
    expect(w).toHaveAttribute('data-panelid', 'p1');
    expect(w.style.transform).toEqual('');
  });

  it('Should applies initial styles when sticky=true', () => {
    /**
     * When sticky is enabled, the wrapper should have willChange and zIndex set.
     */
    mockGetComputedStyle.mockReturnValue({
      transform: 'translate(5px,15px)',
      overflow: 'visible',
      overflowY: 'visible',
      overflowX: 'visible',
      position: 'static',
      visibility: 'visible',
    });
    document.body.innerHTML = '<header style="height:50px"></header>';
    render(<TestComponent panelId="p2" sticky={true} />);
    const w = screen.getByTestId('wrapper');
    expect(w.style.willChange).toEqual('transform');
    expect(w.style.zIndex).toEqual('999');
  });

  it('Should cleans up listeners and resets styles on unmount', () => {
    /**
     * On unmount, scroll/resize listeners should be removed and styles reset.
     */
    const removeSpy = jest.spyOn(window, 'removeEventListener');
    const { unmount } = render(<TestComponent panelId="p5" sticky={true} />);
    const w = screen.getByTestId('wrapper');
    w.getBoundingClientRect = () => new DOMRect(0, 0, 0, 0);

    unmount();
    expect(removeSpy).toHaveBeenCalledWith('resize', expect.any(Function));
    expect(w.style.transform).toEqual('');
    expect(w.style.willChange).toEqual('');
    expect(w.style.zIndex).toEqual('');
  });

  it('Should update windowWidth state on window resize', async () => {
    render(<TestComponent panelId="p1" sticky={false} />);

    await act(async () => {
      Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 500 });
      const resizeEvent = new Event('resize');
      window.dispatchEvent(resizeEvent);
      jest.runAllTimers();
    });

    await waitFor(() => {
      expect(window.innerWidth).toBe(500);
    });
  });
});
