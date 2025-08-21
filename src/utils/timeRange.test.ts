import { RelativeTimeRange, TimeOption } from '@grafana/data';

import {
  formatDuration,
  isTimeRangeMatch,
  mapRelativeTimeRangeToOption,
  prepareFromAndToParams,
  secondsToRelativeFormat,
  timeToSeconds,
} from './timeRange';
import dayjs from 'dayjs';
import { TimeConfigType } from '@/types';

describe('formatDuration', () => {
  it('Should format seconds correctly', () => {
    expect(formatDuration(1)).toEqual('1s');
    expect(formatDuration(60)).toEqual('1m');
    expect(formatDuration(3600)).toEqual('1h');
    expect(formatDuration(86400)).toEqual('1d');
    expect(formatDuration(604800)).toEqual('1w');
  });

  it('Should handle non-divisible seconds with seconds unit', () => {
    expect(formatDuration(61)).toEqual('61s');
    expect(formatDuration(3661)).toEqual('3661s');
  });

  it('Should handle more non-divisible seconds to cover least significant unit', () => {
    expect(formatDuration(2)).toEqual('2s'); // Non-divisible by 60 or higher
    expect(formatDuration(121)).toEqual('121s'); // Non-divisible by 60 or higher
    expect(formatDuration(3661)).toEqual('3661s'); // Non-divisible by 3600 or higher
    expect(formatDuration(86401)).toEqual('86401s'); // Non-divisible by 86400 or higher
    expect(formatDuration(604801)).toEqual('604801s'); // Non-divisible by 604800
  });

  it('Should handle leastSignificant', () => {
    expect(formatDuration(0.125)).toEqual('0.125s');
  });

  it('Should handle multiple units correctly', () => {
    expect(formatDuration(2 * 604800)).toEqual('2w');
    expect(formatDuration(3 * 86400)).toEqual('3d');
    expect(formatDuration(4 * 3600)).toEqual('4h');
  });
});

describe('secondsToRelativeFormat', () => {
  it('Should return "now" for zero seconds', () => {
    expect(secondsToRelativeFormat(0)).toEqual('now');
  });

  it('Should format positive seconds as "now-"', () => {
    expect(secondsToRelativeFormat(60)).toEqual('now-1m');
    expect(secondsToRelativeFormat(3600)).toEqual('now-1h');
    expect(secondsToRelativeFormat(86400)).toEqual('now-1d');
  });

  it('Should format negative seconds as "now+"', () => {
    expect(secondsToRelativeFormat(-60)).toEqual('now+1m');
    expect(secondsToRelativeFormat(-3600)).toEqual('now+1h');
    expect(secondsToRelativeFormat(-86400)).toEqual('now+1d');
  });

  it('Should handle non-divisible seconds', () => {
    expect(secondsToRelativeFormat(61)).toEqual('now-61s');
    expect(secondsToRelativeFormat(-61)).toEqual('now+61s');
  });
});

describe('mapRelativeTimeRangeToOption', () => {
  it('Should correctly map RelativeTimeRange to TimeOption', () => {
    const range: RelativeTimeRange = { from: 3600, to: 0 };
    const expected: TimeOption = {
      from: 'now-1h',
      to: 'now',
      display: 'now-1h to now',
    };
    expect(mapRelativeTimeRangeToOption(range)).toEqual(expected);
  });

  it('Should handle negative and positive seconds', () => {
    const range: RelativeTimeRange = { from: -3600, to: 60 };
    const expected: TimeOption = {
      from: 'now+1h',
      to: 'now-1m',
      display: 'now+1h to now-1m',
    };
    expect(mapRelativeTimeRangeToOption(range)).toEqual(expected);
  });

  it('Should handle zero for both from and to', () => {
    const range: RelativeTimeRange = { from: 0, to: 0 };
    const expected: TimeOption = {
      from: 'now',
      to: 'now',
      display: 'now to now',
    };
    expect(mapRelativeTimeRangeToOption(range)).toEqual(expected);
  });

  it('Should handle complex durations', () => {
    const range: RelativeTimeRange = { from: 604800, to: -86400 };
    const expected: TimeOption = {
      from: 'now-1w',
      to: 'now+1d',
      display: 'now-1w to now+1d',
    };
    expect(mapRelativeTimeRangeToOption(range)).toEqual(expected);
  });
});

describe('timeToSeconds', () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  test('Should return the same timestamp for a numeric input (ms)', () => {
    const timestamp = 1747353600000;
    expect(timeToSeconds(timestamp)).toEqual(timestamp);
  });

  test('Should return the same timestamp for a numeric input (ms)', () => {
    const timestamp = 1748563200000;
    expect(timeToSeconds(timestamp)).toEqual(timestamp);
  });

  test('Should return the timestamp from date converted to utc', () => {
    const timestamp = 1748563200000;
    const date = '2025-05-30T00:00:00.000Z';

    const result = timeToSeconds(date);
    expect(result).toEqual(timestamp);
  });

  test('Should convert the ISO date string to a valid timestamp (ms)', () => {
    const isoString = '2021-12-31T23:59:59.000Z';
    const expectedTs = new Date(isoString).getTime();
    expect(timeToSeconds(isoString)).toEqual(expectedTs);
  });

  test('Should handle "now" and relative expressions "now-1h"/"now+1h" correctly', () => {
    const baseDate = new Date('2025-05-16T00:00:00Z');
    jest.setSystemTime(baseDate);
    expect(timeToSeconds('now')).toEqual(baseDate.getTime());
    expect(timeToSeconds('now-1h')).toEqual(baseDate.getTime() - 60 * 60 * 1000);
    expect(timeToSeconds('now+1h')).toEqual(baseDate.getTime() + 60 * 60 * 1000);
  });
});

describe('prepareFromAndToParams', () => {
  const fromDate = dayjs('2023-01-01T00:00:00.000Z');
  const toDate = dayjs('2023-01-02T00:00:00.000Z');

  it('Should return raw string values if from and to are strings', () => {
    const timeRange = {
      from: fromDate,
      to: toDate,
      raw: {
        from: 'now-1h',
        to: 'now',
      },
    } as any;

    const result = prepareFromAndToParams(timeRange);
    expect(result).toEqual({ from: 'now-1h', to: 'now' });
  });

  it('Should return ISO strings if raw values are not strings', () => {
    const timeRange = {
      from: fromDate,
      to: toDate,
      raw: {
        from: fromDate,
        to: toDate,
      },
    } as any;

    const result = prepareFromAndToParams(timeRange);
    expect(result).toEqual({
      from: fromDate.toISOString(),
      to: toDate.toISOString(),
    });
  });

  it('Should handle mixed raw values (from string, to DateTime)', () => {
    const timeRange = {
      from: fromDate,
      to: toDate,
      raw: {
        from: '2023-01-01T12:00:00Z',
        to: toDate,
      },
    } as any;

    const result = prepareFromAndToParams(timeRange);
    expect(result).toEqual({
      from: '2023-01-01T12:00:00Z',
      to: toDate.toISOString(),
    });
  });

  it('Should handle mixed raw values (from DateTime, to string)', () => {
    const timeRange = {
      from: fromDate,
      to: toDate,
      raw: {
        from: fromDate,
        to: 'now',
      },
    } as any;

    const result = prepareFromAndToParams(timeRange);
    expect(result).toEqual({
      from: fromDate.toISOString(),
      to: 'now',
    });
  });

  it('Should handle from DateTime, to string if raw is empty', () => {
    const timeRange = {
      from: fromDate,
      to: toDate,
      raw: {
        from: '',
        to: '',
      },
    } as any;

    const result = prepareFromAndToParams(timeRange);
    expect(result).toEqual({
      from: fromDate.toISOString(),
      to: toDate.toISOString(),
    });
  });

  it('Should return empty from and to if timeRange is undefined', () => {
    const result = prepareFromAndToParams(undefined);
    expect(result).toEqual({
      from: '',
      to: '',
    });
  });
});

describe('isTimeRangeMatch', () => {
  const baseTime = 1711305978000; // example timestamp

  it('Should returns true when timestamps are equal', () => {
    expect(isTimeRangeMatch(baseTime, baseTime)).toEqual(true);
  });

  it('Should returns true for CUSTOM pickerType only if exact match', () => {
    const diffTime = baseTime + 1000;
    expect(isTimeRangeMatch(baseTime, baseTime, TimeConfigType.CUSTOM)).toEqual(true);
    expect(isTimeRangeMatch(baseTime, diffTime, TimeConfigType.CUSTOM)).toEqual(false);
  });

  it('Should returns true if difference is within allowed threshold', () => {
    const diffTime = baseTime + 5000;
    expect(isTimeRangeMatch(baseTime, diffTime, TimeConfigType.FIELD, 5)).toEqual(true);
    expect(isTimeRangeMatch(baseTime, diffTime, TimeConfigType.FIELD, 3)).toEqual(false);
  });

  it('Should returns false if difference exceeds allowed threshold', () => {
    const diffTime = baseTime + 10000;
    expect(isTimeRangeMatch(baseTime, diffTime, undefined, 5)).toEqual(false);
  });

  it('Should returns true if no threshold provided and timestamps equal', () => {
    expect(isTimeRangeMatch(baseTime, baseTime)).toEqual(true);
  });

  it('Should returns true if timestamps are different and no threshold provided', () => {
    const diffTime = baseTime + 1000;
    expect(isTimeRangeMatch(baseTime, diffTime)).toEqual(true);
  });

  it('Should returns true if timestamps are different and in threshold', () => {
    expect(isTimeRangeMatch(1755179814721, 1755179812795, undefined, 33)).toEqual(true);
  });
});
