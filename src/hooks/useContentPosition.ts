import { useEffect, useLayoutEffect, useRef, useState } from 'react';

import { useElementResize } from './useElementResize';
import { useOffsetCalculator } from './useOffsetCalculator';

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

  /**
   * State
   */
  const [windowWidth, setWindowWidth] = useState<number>(() => (typeof window !== 'undefined' ? window.innerWidth : 0));

  /**
   * Observe element sizes
   */
  const headerRect = useElementResize('header', sticky);
  const submenuRect = useElementResize('[aria-label="Dashboard submenu"]', sticky);
  const controlsRect = useElementResize('[data-testid="data-testid dashboard controls"]', sticky);

  /**
   * Calculate offsetTop
   */
  const offsetTop = useOffsetCalculator(headerRect, submenuRect, controlsRect);

  /**
   * Update windowWidth state
   */
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useLayoutEffect(() => {
    /**
     * Select element by two possible data attributes
     */
    const wrapper =
      document.querySelector<HTMLElement>(`[data-griditem-key="grid-item-${panelId}"]`) ||
      document.querySelector<HTMLElement>(`[data-panelid="${panelId}"]`);

    if (!wrapper || !sticky || offsetTop === undefined) {
      return;
    }

    containerRef.current = wrapper;

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
  }, [panelId, sticky, windowWidth, offsetTop]);

  return { containerRef };
};
