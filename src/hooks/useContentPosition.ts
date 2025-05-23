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
}

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
  const initialTranslateRefY = useRef<number>(0);
  const thresholdRef = useRef<number>(0);

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

    /**
     * Extract initial translateY value via DOMMatrix
     */
    const computedStyle = window.getComputedStyle(wrapper);
    const matrix =
      computedStyle.transform && computedStyle.transform !== 'none'
        ? new DOMMatrix(computedStyle.transform)
        : new DOMMatrix();
    initialTranslateRefY.current = matrix.m42;

    /**
     * Determine scroll threshold
     */
    const offsetTop = calcOffsetTop();
    const rect = wrapper.getBoundingClientRect();
    thresholdRef.current = rect.top + window.scrollY - offsetTop;


    /**
     * Applies transform to the wrapper, maintaining initial X offset and adding delta to Y.
     */
    const applyTransform = () => {
      const scrollParent = getScrollParent(wrapper);
      const scrollY =
        scrollParent === window ? window.scrollY || window.pageYOffset : (scrollParent as HTMLElement).scrollTop;

      const delta = scrollY > thresholdRef.current ? scrollY - thresholdRef.current : 0;

      /**
       * Re-extract current translateX to preserve horizontal offset
       */
      const currentMatrix =
        window.getComputedStyle(wrapper).transform && window.getComputedStyle(wrapper).transform !== 'none'
          ? new DOMMatrix(window.getComputedStyle(wrapper).transform)
          : new DOMMatrix();
      const initialX = currentMatrix.m41;

      const translateY = initialTranslateRefY.current + delta;
      wrapper.style.transform = `translate(${initialX}px, ${translateY}px)`;
      wrapper.style.willChange = 'transform';
      wrapper.style.zIndex = '999';
    };

    /**
     * Subscribe to scroll on correct container and window resize
     */
    const scrollParent = getScrollParent(wrapper);
    scrollParent.addEventListener('scroll', () => window.requestAnimationFrame(applyTransform), { passive: true });
    window.addEventListener('resize', applyTransform);

    /**
     * Initial transform application
     */
    applyTransform();

    return () => {
      scrollParent.removeEventListener('scroll', () => window.requestAnimationFrame(applyTransform));
      window.removeEventListener('resize', applyTransform);
      /**
       * Reset styles
       */
      wrapper.style.transform = '';
      wrapper.style.willChange = '';
      wrapper.style.zIndex = '';
    };
  }, [panelId, sticky]);

  return { containerRef };
};
