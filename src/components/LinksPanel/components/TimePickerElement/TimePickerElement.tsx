import { cx } from '@emotion/css';
import { locationService } from '@grafana/runtime';
import { Button, useStyles2 } from '@grafana/ui';
import React from 'react';

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
}

/**
 * Time Picker Element
 */
export const TimePickerElement: React.FC<Props> = ({ link, buttonSize, gridMode = false }) => {
  /**
   * Styles
   */
  const styles = useStyles2(getStyles);

  /**
   * Return
   */
  return (
    <Button
      variant="secondary"
      className={cx(styles.link, gridMode && styles.linkGridMode, link.isCurrentTimepicker && styles.currentTimePicker)}
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
  );
};
