import { render, screen } from '@testing-library/react';
import React from 'react';

import { calcOffsetTop, getScrollParent, useContentPosition } from './useContentPosition';

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
    // Reset DOM and mocks before each test
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
    expect(w.style.transform).toBe('');
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
    expect(w.style.willChange).toBe('transform');
    expect(w.style.zIndex).toBe('999');
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
    expect(removeSpy).toHaveBeenCalledWith('scroll', expect.any(Function));
    expect(removeSpy).toHaveBeenCalledWith('resize', expect.any(Function));
    expect(w.style.transform).toBe('');
    expect(w.style.willChange).toBe('');
    expect(w.style.zIndex).toBe('');
  });
});

/**
 * Unit tests for getScrollParent utility function.
 */
describe('getScrollParent utility', () => {
  let realGetComputedStyle: typeof window.getComputedStyle;

  beforeAll(() => {
    realGetComputedStyle = window.getComputedStyle;
  });
  afterAll(() => {
    window.getComputedStyle = realGetComputedStyle;
  });

  it('Should returns nearest scrollable ancestor', () => {
    /**
     * Should return closest parent with overflow auto|scroll and scrollHeight > clientHeight.
     */
    document.body.innerHTML = `
      <div id="ancestor" style="overflow: auto; height: 100px;">
        <div><div id="child"></div></div>
      </div>
    `;

    const ancestor = document.getElementById('ancestor') as HTMLElement;
    Object.defineProperty(ancestor, 'scrollHeight', { value: 200 });
    Object.defineProperty(ancestor, 'clientHeight', { value: 100 });
    window.getComputedStyle = (el: Element) => {
      if (el === ancestor) {
        return { overflow: 'auto', overflowY: 'scroll', overflowX: 'visible' } as unknown as CSSStyleDeclaration;
      }
      return { overflow: 'visible', overflowY: 'visible', overflowX: 'visible' } as unknown as CSSStyleDeclaration;
    };
    const child = document.getElementById('child') as HTMLElement;
    expect(getScrollParent(child)).toBe(ancestor);
  });

  it('Should returns window when no scrollable ancestor', () => {
    /**
     * Should default to window if no scrollable parent is found.
     */
    document.body.innerHTML = `<div><div id="child2"></div></div>`;
    window.getComputedStyle = () =>
      ({ overflow: 'visible', overflowY: 'visible', overflowX: 'visible' }) as unknown as CSSStyleDeclaration;
    const child = document.getElementById('child2') as HTMLElement;
    expect(getScrollParent(child)).toBe(window);
  });
});

/**
 * Unit tests for calcOffsetTop utility function.
 */
describe('calcOffsetTop utility', () => {
  let realGetComputedStyle: typeof window.getComputedStyle;

  beforeAll(() => {
    realGetComputedStyle = window.getComputedStyle;
  });
  afterAll(() => {
    window.getComputedStyle = realGetComputedStyle;
  });

  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('Should calculates header + sticky submenu height', () => {
    /**
     * When a sticky submenu is visible, return header height + submenu height.
     */
    const header = document.createElement('header');
    header.getBoundingClientRect = () => ({ height: 20 }) as DOMRect;

    document.body.appendChild(header);
    const submenu = document.createElement('section');

    submenu.setAttribute('aria-label', 'Dashboard submenu');
    submenu.getBoundingClientRect = () => ({ height: 30 }) as DOMRect;

    document.body.appendChild(submenu);
    window.getComputedStyle = (el: Element) => {
      if (el === submenu) {
        return {
          position: 'sticky',
          visibility: 'visible',
          overflow: '',
          overflowX: '',
          overflowY: '',
        } as unknown as CSSStyleDeclaration;
      }
      return {
        position: 'static',
        visibility: 'visible',
        overflow: '',
        overflowX: '',
        overflowY: '',
      } as unknown as CSSStyleDeclaration;
    };
    expect(calcOffsetTop()).toBe(50);
  });

  it('Should prefers controlsBottom over header+submenu', () => {
    /**
     * If control container is present, return its bottom offset directly.
     */
    const controlsContainer = document.createElement('div');
    controlsContainer.getBoundingClientRect = () => ({ bottom: 40 }) as DOMRect;
    const controlsEl = document.createElement('div');
    controlsEl.setAttribute('data-testid', 'data-testid dashboard controls');
    controlsContainer.appendChild(controlsEl);
    document.body.appendChild(controlsContainer);
    expect(calcOffsetTop()).toBe(40);
  });
});
