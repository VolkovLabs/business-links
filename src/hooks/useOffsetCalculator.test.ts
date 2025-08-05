import { renderHook } from '@testing-library/react';
import { useOffsetCalculator } from './useOffsetCalculator';

describe('useOffsetCalculator', () => {
  const createDOMRect = (props: Partial<DOMRect>): DOMRect =>
    ({
      x: 0,
      y: 0,
      width: 100,
      height: 50,
      top: 0,
      left: 0,
      right: 100,
      bottom: 50,
      ...props,
    }) as DOMRect;

  /**
   * Clear
   */
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('Should return header height if no submenu and controls', () => {
    const header = createDOMRect({ height: 100 });

    const { result } = renderHook(() => useOffsetCalculator(header, undefined, undefined));

    expect(result.current).toEqual(100);
  });

  it('Should includes submenu height only if it is sticky and visible', () => {
    const submenuEl = document.createElement('div');
    submenuEl.setAttribute('aria-label', 'Dashboard submenu');
    document.body.appendChild(submenuEl);

    Object.defineProperty(window, 'getComputedStyle', {
      value: () => ({
        position: 'sticky',
        visibility: 'visible',
      }),
      writable: true,
    });

    const header = createDOMRect({ height: 60 });
    const submenu = createDOMRect({ height: 30 });

    const { result } = renderHook(() => useOffsetCalculator(header, submenu, undefined));

    /**
     * 60 + 30
     */
    expect(result.current).toEqual(90);
  });

  it('Should ignore submenu height if it is not sticky or hidden', () => {
    const submenuEl = document.createElement('div');
    submenuEl.setAttribute('aria-label', 'Dashboard submenu');
    document.body.appendChild(submenuEl);

    Object.defineProperty(window, 'getComputedStyle', {
      value: () => ({
        position: 'relative',
        visibility: 'visible',
      }),
      writable: true,
    });

    const header = createDOMRect({ height: 60 });
    const submenu = createDOMRect({ height: 30 });

    const { result } = renderHook(() => useOffsetCalculator(header, submenu, undefined));

    expect(result.current).toEqual(60);
  });
});
