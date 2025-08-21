import { dateTime, rangeUtil, RelativeTimeRange, TimeOption, TimeRange } from '@grafana/data';
import dayjs from 'dayjs';

import { TimeConfigType } from '@/types';

/**
 * Formats the given duration in seconds into a human-readable string representation.
 *
 * @param range - Relative Time Range.
 */
export const mapRelativeTimeRangeToOption = (range: RelativeTimeRange): TimeOption => {
  const from = secondsToRelativeFormat(range.from);
  const to = secondsToRelativeFormat(range.to);

  return { from, to, display: `${from} to ${to}` };
};

/**
 * Formats seconds to relative format
 *
 * @param seconds - Seconds.
 */
export const secondsToRelativeFormat = (seconds: number): string => {
  if (seconds === 0) {
    return 'now';
  }

  const absoluteSeconds = Math.abs(seconds);
  if (seconds < 0) {
    return `now+${formatDuration(absoluteSeconds)}`;
  }

  return `now-${formatDuration(absoluteSeconds)}`;
};

/**
 * Formats the given duration in seconds into a human-readable string representation.
 *
 * @param seconds - The duration in seconds.
 * @returns The formatted duration string.
 */
export function formatDuration(seconds: number): string {
  const units = [
    { unit: 'w', value: 7 * 24 * 60 * 60 },
    { unit: 'd', value: 24 * 60 * 60 },
    { unit: 'h', value: 60 * 60 },
    { unit: 'm', value: 60 },
    { unit: 's', value: 1 },
  ];

  for (const { unit, value } of units) {
    if (seconds % value === 0) {
      const quotient = seconds / value;
      return `${quotient}${unit}`;
    }
  }

  /**
   * If no perfect division, use the least significant unit
   */
  const leastSignificant = units[units.length - 1];
  return `${seconds}${leastSignificant.unit}`;
}

/**
 * Convert a raw time input (ms number, ISO string, or relative expression)
 * into an absolute timestamp in milliseconds.
 *
 * @param time – a number (ms), ISO date string, or relative expression
 * @returns timestamp in ms
 */
export const timeToSeconds = (time: string | number): number => {
  const raw = typeof time === 'number' ? dateTime(time) : time;

  const { from } = rangeUtil.convertRawToRange({ from: raw, to: raw }, 'utc');
  return from.valueOf();
};

/**
 * Compare time ranges for pickers
 * include type of time picker and second difference
 * into an absolute timestamp in milliseconds.
 *
 * @param timeRangeA – number (ms)
 * @param timeRangeB – number (ms)
 * @param pickerType
 * @param timeDifference - number (s)
 * @returns boolean
 */
export const isTimeRangeMatch = (
  timeRangeA: number,
  timeRangeB: number,
  pickerType?: TimeConfigType,
  timeDifference?: number
): boolean => {
  const currentDifference = timeDifference ?? 30;

  if (pickerType === TimeConfigType.CUSTOM) {
    return timeRangeA === timeRangeB;
  }

  if (timeRangeA === timeRangeB) {
    return true;
  }

  const diffSec = Math.abs(dayjs(timeRangeA).diff(dayjs(timeRangeB), 'second'));

  if (timeRangeA !== timeRangeB && diffSec <= currentDifference) {
    return true;
  }

  return false;
};

/**
 * prepareFromAndToParams
 * @param timeRange
 */
export const prepareFromAndToParams = (timeRange?: TimeRange) => {
  let fromValue = '';
  let toValue = '';

  if (!timeRange) {
    return {
      from: fromValue,
      to: toValue,
    };
  }

  if (timeRange.raw?.from && typeof timeRange.raw?.from === 'string') {
    fromValue = timeRange.raw.from;
  } else {
    fromValue = timeRange.from.toISOString();
  }

  if (timeRange.raw?.to && typeof timeRange.raw?.to === 'string') {
    toValue = timeRange.raw.to;
  } else {
    toValue = timeRange.to.toISOString();
  }

  return {
    from: fromValue,
    to: toValue,
  };
};
