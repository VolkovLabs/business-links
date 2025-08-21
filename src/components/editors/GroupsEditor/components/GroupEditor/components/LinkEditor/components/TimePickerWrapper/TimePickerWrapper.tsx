import { config } from '@grafana/runtime';
import React, { useEffect, useRef } from 'react';
import semver from 'semver';

import { TEST_IDS } from '@/constants';

/**
 * Properties
 */
interface Props {
  /**
   * Children
   */
  children: React.ReactNode | React.ReactNode[];
}

/**
 * Time Picker Wrapper
 * Use to create a wrapper for Grafana versions below 12.0.0
 * And override the behavior of time selection, such as overlapping with the edit panel
 */
export const TimePickerWrapper: React.FC<Props> = ({ children }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateSectionPosition = () => {
      /**
       * Check version and container
       */
      if (!containerRef.current || semver.gte(config.buildInfo.version, '12.0.0')) {
        return;
      }

      /**
       * Get button element
       * to get correct position on page
       * and section container
       */
      const buttonElement = containerRef.current?.querySelector('button') as HTMLElement | null;
      const section = document.querySelector('section[role="dialog"]') as HTMLElement | null;

      if (buttonElement && section) {
        const rect = buttonElement.getBoundingClientRect();
        /**
         * Use button position
         * override section container
         */
        section.style.position = 'fixed';
        section.style.left = '0px';
        section.style.top = '0px';
        section.style.transform = `translate(${rect.left}px, ${rect.bottom}px)`;
      }
    };

    /**
     * Use MutationObserver
     * Provides the ability to watch for changes being made to the DOM tree.
     */
    const observer = new MutationObserver(updateSectionPosition);
    observer.observe(document.body, { childList: true, subtree: true });

    window.addEventListener('resize', updateSectionPosition);
    window.addEventListener('scroll', updateSectionPosition);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateSectionPosition);
      window.removeEventListener('scroll', updateSectionPosition);
    };
  }, []);

  return (
    <div ref={containerRef} {...TEST_IDS.timePickerWrapper.root.apply()}>
      {children}
    </div>
  );
};
