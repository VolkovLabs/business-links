import { useEffect, useState } from 'react';

/**
 * Hook to observe size changes of an element.
 * @param selector - CSS selector for the target element
 * @param enabled - Whether observation is enabled
 * @returns DOMRect of the element or undefined if not found
 */
export const useElementResize = (selector: string, enabled = true): DOMRect | undefined => {
  const [rect, setRect] = useState<DOMRect | undefined>(undefined);

  useEffect(() => {
    if (!enabled) return;

    const element = document.querySelector<HTMLElement>(selector);
    if (!element) return;

    const updateRect = () => {
      setRect(element.getBoundingClientRect());
    };

    /**
     * Initial size
     */
    updateRect();

    const resizeObserver = new ResizeObserver(() => {
      updateRect();
    });

    resizeObserver.observe(element);
    return () => resizeObserver.disconnect();
  }, [selector, enabled]);

  return rect;
};
