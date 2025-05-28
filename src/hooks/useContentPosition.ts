import { useLayoutEffect, useRef } from 'react';

/**
 * Finds the nearest ancestor element (or window) that is actually scrollable.
 * If the document itself scrolls, returns the Window.
 * @param el - The starting element to search upwards from
 * @returns The scrollable parent element or window
 */
export const getScrollParent = (el: HTMLElement): HTMLElement | Window => {
  const overflowRegex = /(auto|scroll)/;
  let parent: HTMLElement | null = el;

  while ((parent = parent.parentElement)) {
    const style = getComputedStyle(parent);
    const hasOverflow = overflowRegex.test(style.overflow + style.overflowY + style.overflowX);
    const canScroll = parent.scrollHeight > parent.clientHeight;

    if (hasOverflow && canScroll && parent !== document.body && parent !== document.documentElement) {
      return parent;
    }
  }
  return window;
};

/**
 * Calculates the top offset to account for header, submenu, and controls heights.
 * @returns Total vertical offset in pixels
 */
export const calcOffsetTop = (): number => {
  const headerEl = document.querySelector<HTMLElement>('header');
  const headerH = headerEl ? headerEl.getBoundingClientRect().height : 0;

  let submenuH = 0;
  const submenuEl = document.querySelector<HTMLElement>('[aria-label="Dashboard submenu"]');
  if (
    submenuEl &&
    getComputedStyle(submenuEl).position === 'sticky' &&
    getComputedStyle(submenuEl).visibility !== 'hidden'
  ) {
    submenuH = submenuEl.getBoundingClientRect().height;
  }

  let controlsBottom = 0;
  const controlsEl = document.querySelector<HTMLElement>('[data-testid="data-testid dashboard controls"]');
  if (controlsEl?.parentElement) {
    controlsBottom = controlsEl.parentElement.getBoundingClientRect().bottom;
  }

  return controlsBottom || headerH + submenuH;
};

/**
 * Hook to position and optionally stick content based on scroll position.
 * @param panelId - Identifier for the target panel element
 * @param sticky - Whether sticky behavior is enabled
 * @returns Ref for the container element
 */
export const useContentPosition = ({ panelId, sticky }: { panelId: number | string; sticky: boolean }) => {
  /**
   * Refs
   */
  const containerRef = useRef<HTMLElement | null>(null);

  useLayoutEffect(() => {
    /**
     * Select element by two possible data attributes
     */
    const wrapper =
      document.querySelector<HTMLElement>(`[data-griditem-key="grid-item-${panelId}"]`) ||
      document.querySelector<HTMLElement>(`[data-panelid="${panelId}"]`);

    if (!wrapper || !sticky) {
      return;
    }

    containerRef.current = wrapper;

    const offsetTop = calcOffsetTop();

    /**
     * Set initial styles
     */
    wrapper.style.position = 'fixed';
    wrapper.style.top = `${offsetTop}px`;
    wrapper.style.zIndex = '999';
    wrapper.style.willChange = 'transform';

    /**
     * Extract initial translateX value via DOMMatrix
     */
    const preserveTranslateX = () => {
      const style = window.getComputedStyle(wrapper);
      const matrix = style.transform && style.transform !== 'none' ? new DOMMatrix(style.transform) : new DOMMatrix();
      wrapper.style.transform = `translateX(${matrix.m41}px)`;
    };

    /**
     * Initial transform settings
     */
    preserveTranslateX();

    /**
     * Subscribe to window resize
     */
    window.addEventListener('resize', preserveTranslateX);

    return () => {
      window.removeEventListener('resize', preserveTranslateX);

      /**
       * Reset styles
       */
      wrapper.style.position = '';
      wrapper.style.top = '';
      wrapper.style.transform = '';
      wrapper.style.willChange = '';
      wrapper.style.zIndex = '';
    };
  }, [panelId, sticky]);

  return { containerRef };
};
