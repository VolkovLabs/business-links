import { cx } from '@emotion/css';
import { locationService } from '@grafana/runtime';
import { Button, useStyles2 } from '@grafana/ui';
import React, { useCallback, useEffect, useState } from 'react';

import { TEST_IDS } from '@/constants';
import { ButtonSize } from '@/types';
import { VisualLink } from '@/types/links';

import { getStyles } from './TimePickerElement.styles';

/**
 * Test Ids
 */
const testIds = TEST_IDS.timePickerElement;

/**
 * Properties
 */
interface Props {
  /**
   * Link
   *
   * @type {VisualLink}
   */
  link: VisualLink;

  /**
   * Is link use for grid mode
   *
   * @type {boolean}
   */
  gridMode?: boolean;

  /**
   * IButton Size
   *
   * @type {ButtonSize}
   */
  buttonSize?: ButtonSize;

  /**
   * Dynamic font size
   *
   * @type {boolean}
   */
  dynamicFontSize?: boolean;
}

/**
 * Time Picker Element
 */
export const TimePickerElement: React.FC<Props> = ({ link, buttonSize, gridMode = false, dynamicFontSize = false }) => {
  /**
   * Styles
   */
  const styles = useStyles2(getStyles, { dynamicFontSize });

  /**
   * States
   */
  const [linkWidth, setLinkWidth] = useState(0);
  const [linkEl, setLinkEl] = useState<HTMLElement | null>(null);

  /**
   * Get link ref
   */
  const btnRef = useCallback((node: HTMLElement | null) => {
    setLinkEl(node);
  }, []);

  useEffect(() => {
    if (!dynamicFontSize || !linkEl) {
      return;
    }

    /**
     * Track link element width changes
     */
    const resize = new ResizeObserver(([entry]) => {
      setLinkWidth(Math.floor(entry.contentRect.width));
    });
    resize.observe(linkEl);

    return () => resize.disconnect();
  }, [dynamicFontSize, linkEl]);

  /**
   * Mapping of content alignment positions to their corresponding styles.
   */
  const alignClassMap = {
    center: styles.alignLinkContentCenter,
    left: styles.alignLinkContentLeft,
    right: styles.alignLinkContentRight,
  } as const;

  /**
   * Return
   */
  return (
    <div
      ref={btnRef}
      style={dynamicFontSize ? ({ '--btn-width': `${linkWidth}px` } as React.CSSProperties) : undefined}
    >
      <Button
        variant="secondary"
        className={cx(
          styles.link,
          gridMode && styles.linkGridMode,
          link.isCurrentTimepicker && styles.currentTimePicker,
          link.alignContentPosition && alignClassMap[link.alignContentPosition]
        )}
        key={link.name}
        icon={!link.showCustomIcons ? link.icon : undefined}
        size={buttonSize}
        fill="outline"
        onClick={() => {
          if (link.timeRange) {
            locationService.partial(
              {
                [`from`]: link.timeRange.from,
                [`to`]: link.timeRange.to,
              },
              true
            );
          }
        }}
        title={link.name}
        tooltip={link.name}
        {...testIds.buttonPicker.apply(link.name)}
      >
        {link.showCustomIcons && link.customIconUrl && !!link.customIconUrl.length && (
          <img src={link.customIconUrl} alt="" className={styles.customIcon} />
        )}
        {link.name}
      </Button>
    </div>
  );
};
