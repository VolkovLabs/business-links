import { useMemo } from 'react';

/**
 * Hook to calculate the top offset based on element dimensions.
 * @param headerRect - DOMRect of the header element
 * @param submenuRect - DOMRect of the submenu element
 * @param controlsRect - DOMRect of the controls element
 * @returns Calculated offsetTop in pixels
 */
export const useOffsetCalculator = (
  headerRect: DOMRect | undefined,
  submenuRect: DOMRect | undefined,
  controlsRect: DOMRect | undefined
): number => {
  return useMemo(() => {
    const headerH = headerRect ? headerRect.height : 0;

    let submenuH = 0;
    if (
      submenuRect &&
      getComputedStyle(document.querySelector('[aria-label="Dashboard submenu"]')!).position === 'sticky' &&
      getComputedStyle(document.querySelector('[aria-label="Dashboard submenu"]')!).visibility !== 'hidden'
    ) {
      submenuH = submenuRect.height;
    }

    const controlsBottom = controlsRect?.bottom ?? 0;

    return controlsBottom || headerH + submenuH;
  }, [headerRect, submenuRect, controlsRect]);
};
