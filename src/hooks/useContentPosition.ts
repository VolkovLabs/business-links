import { useLayoutEffect, useRef } from 'react';

import { calcOffsetTop } from '@/utils';

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
