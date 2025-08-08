import { dateTime, makeTimeRange, rangeUtil } from '@grafana/data';

import { OutdatedTimeConfig, TimeConfig, TimeConfigType } from '@/types';

import { secondsToRelativeFormat } from './timeRange';

/**
 * Migrate TimePickerConfiguration for links
 * @param timePickerConfig
 */
export const migrateTimePickerConfiguration = (timePickerConfig?: OutdatedTimeConfig): TimeConfig => {
  /**
   * Return default
   */
  if (!timePickerConfig || !timePickerConfig.type) {
    return {
      type: TimeConfigType.FIELD,
    };
  }

  /**
   * Migrate Manual type before 2.2.0
   */
  if (timePickerConfig && timePickerConfig.type === TimeConfigType.MANUAL) {
    const from = dateTime(timePickerConfig.manualTimeRange?.from);
    const to = dateTime(timePickerConfig.manualTimeRange?.to);
    const timeRangeResult = makeTimeRange(from, to);

    /**
     * return as Custom (new) type
     */
    return {
      type: TimeConfigType.CUSTOM,
      customTimeRange: timeRangeResult,
    };
  }

  /**
   * Migrate RELATIVE type before 2.2.0
   */
  if (timePickerConfig && timePickerConfig.type === TimeConfigType.RELATIVE) {
    if (!timePickerConfig.relativeTimeRange?.from) {
      return {
        type: TimeConfigType.CUSTOM,
      };
    }
    const relativeFrom = secondsToRelativeFormat(timePickerConfig.relativeTimeRange?.from);
    const relativeTo = secondsToRelativeFormat(timePickerConfig.relativeTimeRange?.to);

    const timeRangeResult = rangeUtil.convertRawToRange({
      from: relativeFrom,
      to: relativeTo,
    });

    /**
     * return as Custom (new) type
     */
    return {
      type: TimeConfigType.CUSTOM,
      customTimeRange: timeRangeResult,
    };
  }

  /**
   * Return config if specified correctly before
   */
  return timePickerConfig;
};
