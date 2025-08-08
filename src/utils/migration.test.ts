import { OutdatedTimeConfig, TimeConfigType } from '@/types';
import { migrateTimePickerConfiguration } from './migration';
import { dateTime } from '@grafana/data';
import { secondsToRelativeFormat } from './timeRange';

jest.mock('@grafana/data', () => {
  const actual = jest.requireActual('@grafana/data');
  return {
    ...actual,
    dateTime: jest.fn((val) => ({ mocked: true, val })),
    // rangeUtil: {
    //   convertRawToRange: jest.fn((raw) => ({ converted: true, raw })),
    // },
  };
});

jest.mock('./timeRange', () => ({
  secondsToRelativeFormat: jest.fn((val: number) => `${val}s`),
}));

describe('migrateTimePickerConfiguration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('Should return default config when input is undefined', () => {
    expect(migrateTimePickerConfiguration(undefined)).toEqual({
      type: TimeConfigType.FIELD,
    });
  });

  it('Should return default config when type is missing', () => {
    expect(migrateTimePickerConfiguration({} as OutdatedTimeConfig)).toEqual({
      type: TimeConfigType.FIELD,
    });
  });

  it('Should migrate MANUAL type to CUSTOM type', () => {
    const input: OutdatedTimeConfig = {
      type: TimeConfigType.MANUAL,
      manualTimeRange: { from: 1000, to: 2000 },
    };

    const result = migrateTimePickerConfiguration(input);

    expect(dateTime).toHaveBeenCalledWith(1000);
    expect(dateTime).toHaveBeenCalledWith(2000);
    expect(result.type).toEqual(TimeConfigType.CUSTOM);
    expect(result.customTimeRange).toBeDefined();
  });

  it('Should migrate RELATIVE type to CUSTOM type', () => {
    const input: OutdatedTimeConfig = {
      type: TimeConfigType.RELATIVE,
      relativeTimeRange: { from: 60, to: 120 },
    };

    const result = migrateTimePickerConfiguration(input);

    expect(secondsToRelativeFormat).toHaveBeenCalledWith(60);
    expect(secondsToRelativeFormat).toHaveBeenCalledWith(120);
    expect(result.type).toEqual(TimeConfigType.CUSTOM);
    expect(result.customTimeRange).toBeDefined();
  });

  it('Should migrate RELATIVE type without "from" to CUSTOM without customTimeRange', () => {
    const input: OutdatedTimeConfig = {
      type: TimeConfigType.RELATIVE,
      relativeTimeRange: { from: undefined as any, to: 120 },
    };

    const result = migrateTimePickerConfiguration(input);

    expect(result).toEqual({
      type: TimeConfigType.CUSTOM,
    });
  });

  it('Should return the same config if already valid', () => {
    const config = {
      type: TimeConfigType.CUSTOM,
      customTimeRange: { from: 'now-1h', to: 'now' } as any,
    };

    expect(migrateTimePickerConfiguration(config)).toEqual(config);
  });
});
