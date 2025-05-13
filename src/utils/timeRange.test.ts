import { RelativeTimeRange, TimeOption } from '@grafana/data';

import { formatDuration, mapRelativeTimeRangeToOption, secondsToRelativeFormat } from './timeRange';

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
