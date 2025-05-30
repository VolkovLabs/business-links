import { dateTime, rangeUtil, RelativeTimeRange, TimeOption } from '@grafana/data';

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

  const { from } = rangeUtil.convertRawToRange({ from: raw, to: raw });
  return from.valueOf();
};
