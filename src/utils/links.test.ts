import { DataFrame, Field } from '@grafana/data';

import { LinkConfigType, LinkTarget, LinkType, TimeConfigType } from '@/types';

import { extractParamsByPrefix, prepareLinksToRender, preparePickerTimeRange, prepareUrlWithParams } from './links';

/**
 * extractParamsByPrefix
 */
describe('extractParamsByPrefix', () => {
  it('Should extract only parameters with specified prefix', () => {
    const search = 'var-host=server01&var-env=prod&unrelated=value';
    const result = extractParamsByPrefix(search, 'var-');
    expect(result).toEqual('var-host=server01&var-env=prod');
  });

  it('Should return empty string if no matching prefix found', () => {
    const search = 'foo=bar&baz=qux';
    const result = extractParamsByPrefix(search, 'var-');
    expect(result).toEqual('');
  });
});

/**
 * prepareUrlWithParams
 */
describe('prepareUrlWithParams', () => {
  const timeRange = {
    from: new Date('2023-01-01T00:00:00Z'),
    to: new Date('2023-01-02T00:00:00Z'),
  } as any;

  const replaceVariables = jest.fn();

  beforeEach(() => {
    replaceVariables.mockImplementation((str: string) => str);
  });

  it('Should return empty string if url is not provided', () => {
    const result = prepareUrlWithParams(true, true, timeRange, replaceVariables, 'var-test=123', undefined);
    expect(result).toEqual('');
  });

  it('Should include only variables if includeTimeRange is false', () => {
    const result = prepareUrlWithParams(
      false,
      true,
      timeRange,
      replaceVariables,
      'var-x=1&var-y=2',
      'http://localhost'
    );
    expect(result).toEqual('http://localhost?var-x=1&var-y=2');
  });

  it('Should include only time range if includeVariables is false', () => {
    const result = prepareUrlWithParams(true, false, timeRange, replaceVariables, '', 'http://localhost');
    expect(result).toEqual('http://localhost?from=2023-01-01T00:00:00.000Z&to=2023-01-02T00:00:00.000Z');
  });

  it('Should include both time range and variables', () => {
    const result = prepareUrlWithParams(true, true, timeRange, replaceVariables, 'var-a=abc', 'http://localhost');
    expect(result).toEqual('http://localhost?var-a=abc&from=2023-01-01T00:00:00.000Z&to=2023-01-02T00:00:00.000Z');
  });
});

/**
 * prepareUrlWithParams
 */
describe('prepareLinksToRender', () => {
  const timeRange = {
    from: new Date('2023-01-01T00:00:00Z'),
    to: new Date('2023-01-02T00:00:00Z'),
    raw: {
      from: 'now-1h',
      to: 'now',
    },
  } as any;

  const dashboards = [
    { title: 'A', tags: ['env'], url: '/d/1' },
    { title: 'B', tags: ['env', 'test'], url: '/d/2' },
  ] as any;

  const replaceVariables = jest.fn();

  beforeEach(() => {
    replaceVariables.mockImplementation((str: string) => str);
  });

  it('Should return empty array if no currentGroup', () => {
    const result = prepareLinksToRender({
      currentGroup: undefined,
      dropdowns: [],
      replaceVariables,
      timeRange,
      dashboards,
      params: 'var-x=1',
      dashboardId: '',
      series: [],
    });

    expect(result).toEqual([]);
  });

  it('Should generate SINGLE link correctly', () => {
    const currentGroup = {
      name: 'Test',
      items: [
        {
          type: LinkConfigType.LINK,
          name: 'Link',
          enable: true,
          linkType: LinkType.SINGLE,
          url: 'https://google.com',
          includeVariables: false,
          includeTimeRange: false,
          target: LinkTarget.NEW_TAB,
          tags: [],
          dashboardUrl: '',
          dropdownName: '',
          id: 'test-link0-id',
        },
      ],
    };

    const result = prepareLinksToRender({
      currentGroup,
      dropdowns: [],
      replaceVariables,
      timeRange,
      dashboards,
      params: '',
      dashboardId: '',
      series: [],
    });

    expect(result).toHaveLength(1);
    expect(result[0].links[0].url).toEqual('https://google.com');
    expect(result[0].links[0].isCurrentLink).toEqual(false);
  });

  it('Should generate SINGLE link correctly with Highlight option', () => {
    const currentGroup = {
      name: 'Test',
      items: [
        {
          type: LinkConfigType.LINK,
          name: 'Link',
          enable: true,
          linkType: LinkType.SINGLE,
          url: 'd/test123/?params=test',
          includeVariables: false,
          includeTimeRange: false,
          target: LinkTarget.NEW_TAB,
          tags: [],
          dashboardUrl: '',
          dropdownName: '',
          id: 'test-link0-id',
        },
      ],
    };

    const result = prepareLinksToRender({
      currentGroup,
      dropdowns: [],
      replaceVariables,
      timeRange,
      dashboards,
      params: '',
      dashboardId: 'test123',
      highlightCurrentLink: true,
      highlightCurrentTimepicker: true,
      series: [],
    });

    expect(result).toHaveLength(1);
    expect(result[0].links[0].url).toEqual('d/test123/?params=test');
    expect(result[0].links[0].isCurrentLink).toEqual(true);
  });

  it('Should generate TAGS links correctly', () => {
    const currentGroup = {
      name: 'Test',
      items: [
        {
          type: LinkConfigType.LINK,
          name: 'Tags',
          enable: true,
          linkType: LinkType.TAGS,
          url: 'https://google.com',
          includeVariables: false,
          includeTimeRange: false,
          target: LinkTarget.NEW_TAB,
          tags: ['env'],
          dashboardUrl: '',
          dropdownName: '',
          id: 'test-link0-id',
        },
      ],
    };

    const result = prepareLinksToRender({
      currentGroup,
      dropdowns: [],
      replaceVariables,
      timeRange,
      dashboards,
      params: '',
      dashboardId: '',
      series: [],
    });

    expect(result[0].links).toHaveLength(2);
    expect(result[0].links[0].url).toBe('/d/1');
  });

  it('Should process nested DROPDOWN group', () => {
    const dropdowns = [
      {
        name: 'Nested',
        items: [
          {
            type: LinkConfigType.LINK,
            name: 'Link',
            enable: true,
            linkType: LinkType.SINGLE,
            url: 'https://google.com',
            includeVariables: false,
            includeTimeRange: false,
            target: LinkTarget.NEW_TAB,
            tags: [],
            dashboardUrl: '',
            dropdownName: '',
            id: 'test-link0-dp-id',
          },
        ],
      },
    ];

    const currentGroup = {
      name: 'Test',
      items: [
        {
          type: LinkConfigType.LINK,
          name: 'Dropdown',
          enable: true,
          linkType: LinkType.DROPDOWN,
          url: 'https://google.com',
          includeVariables: false,
          includeTimeRange: false,
          target: LinkTarget.NEW_TAB,
          tags: ['env'],
          dashboardUrl: '',
          dropdownName: 'Nested',
          id: 'test-link0-id',
        },
      ],
    };

    const result = prepareLinksToRender({
      currentGroup,
      dropdowns,
      replaceVariables,
      timeRange,
      dashboards,
      params: '',
      dashboardId: '',
      series: [],
    });

    expect(result).toHaveLength(1);
    expect(result[0].links[0].url).toBe('https://google.com');
  });

  it('Should generate DASHBOARD link correctly', () => {
    const currentGroup = {
      name: 'Test',
      items: [
        {
          type: LinkConfigType.LINK,
          name: 'Link',
          enable: true,
          linkType: LinkType.DASHBOARD,
          url: '',
          includeVariables: false,
          includeTimeRange: false,
          target: LinkTarget.NEW_TAB,
          tags: [],
          dashboardUrl: '/d/urldashboard1',
          dropdownName: '',
          id: 'test-link0-id',
        },
      ],
    };

    const result = prepareLinksToRender({
      currentGroup,
      dropdowns: [],
      replaceVariables,
      timeRange,
      dashboards,
      params: '',
      dashboardId: '',
      series: [],
    });

    expect(result).toHaveLength(1);
    expect(result[0].links[0].url).toEqual('/d/urldashboard1');
  });

  it('Should skip items with unknown linkType', () => {
    const currentGroup = {
      name: 'Test',
      items: [
        {
          type: LinkConfigType.LINK,
          name: 'Link',
          enable: true,
          linkType: 'unknown' as any,
          url: '',
          includeVariables: false,
          includeTimeRange: false,
          target: LinkTarget.NEW_TAB,
          tags: [],
          dashboardUrl: '/d/urldashboard1',
          dropdownName: '',
          id: 'test-link0-id',
        },
      ],
    };

    const result = prepareLinksToRender({
      currentGroup,
      dropdowns: [],
      replaceVariables,
      timeRange,
      dashboards,
      params: '',
      dashboardId: '',
      series: [],
    });

    expect(result).toHaveLength(0);
    expect(result).toEqual([]);
  });

  it('Should generate TIMEPICKER link correctly', () => {
    const currentGroup = {
      name: 'Test',
      items: [
        {
          type: LinkConfigType.LINK,
          name: 'Time Picker',
          enable: true,
          linkType: LinkType.TIMEPICKER,
          url: '',
          includeVariables: false,
          includeTimeRange: false,
          target: LinkTarget.NEW_TAB,
          tags: [],
          dashboardUrl: '',
          dropdownName: '',
          id: 'test-link0-id',
        },
      ],
    };

    const result = prepareLinksToRender({
      currentGroup,
      dropdowns: [],
      replaceVariables,
      timeRange,
      dashboards,
      params: '',
      dashboardId: '',
      series: [],
    });

    expect(result).toHaveLength(1);
    expect(result[0].timeRange).toEqual({
      from: timeRange.raw.from,
      to: timeRange.raw.to,
    });
  });

  it('Should generate TIMEPICKER link correctly with dashboard time range if raw is not a string', () => {
    const currentTimeRange = {
      from: new Date('2023-01-01T00:00:00Z'),
      to: new Date('2023-01-02T00:00:00Z'),
      raw: {
        from: new Date('2025-01-01T00:00:00Z'),
        to: new Date('2025-02-01T00:00:00Z'),
      },
    } as any;

    const currentGroup = {
      name: 'Test',
      items: [
        {
          type: LinkConfigType.LINK,
          name: 'Time Picker',
          enable: true,
          linkType: LinkType.TIMEPICKER,
          url: '',
          includeVariables: false,
          includeTimeRange: false,
          target: LinkTarget.NEW_TAB,
          tags: [],
          dashboardUrl: '',
          dropdownName: '',
          id: 'test-link0-id',
        },
      ],
    };

    const result = prepareLinksToRender({
      currentGroup,
      dropdowns: [],
      replaceVariables,
      timeRange: currentTimeRange,
      dashboards,
      params: '',
      dashboardId: '',
      series: [],
    });

    expect(result).toHaveLength(1);
    expect(result[0].timeRange).toEqual({
      from: 1672531200000,
      to: 1672617600000,
    });
  });
});

describe('preparePickerTimeRange', () => {
  const defaultDashboardTimeRange = {
    from: 'now-6h',
    to: 'now',
  };

  const mockField: Field = {
    name: 'timeField',
    type: 'time' as any,
    config: {},
    values: [1625097600000],
  };

  const mockFrame: DataFrame = {
    fields: [mockField],
    length: 1,
    refId: 'A',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('Should return dashboardTimeRange if no timePickerConfig', () => {
    const result = preparePickerTimeRange({
      item: {},
      series: [],
      dashboardTimeRange: defaultDashboardTimeRange,
    });
    expect(result).toEqual(defaultDashboardTimeRange);
  });

  it('Should handle Relative type with valid relativeTimeRange', () => {
    const result = preparePickerTimeRange({
      item: {
        timePickerConfig: {
          type: TimeConfigType.RELATIVE,
          relativeTimeRange: { from: 3600, to: 0 },
        },
      },
      series: [],
      dashboardTimeRange: defaultDashboardTimeRange,
    });

    expect(result).toEqual({ from: 'now-1h', to: 'now' });
  });

  it('Should handle Relative type with empty relativeTimeRange', () => {
    const result = preparePickerTimeRange({
      item: {
        timePickerConfig: {
          type: TimeConfigType.RELATIVE,
        },
      },
      series: [],
      dashboardTimeRange: defaultDashboardTimeRange,
    });

    expect(result).toEqual(defaultDashboardTimeRange);
  });

  it('Should handle Manual type with valid manualTimeRange', () => {
    const result = preparePickerTimeRange({
      item: {
        timePickerConfig: {
          type: TimeConfigType.MANUAL,
          manualTimeRange: { from: 1747144711, to: 1747144715 },
        },
      },
      series: [],
      dashboardTimeRange: defaultDashboardTimeRange,
    });

    expect(result).toEqual({ from: 1747144711, to: 1747144715 });
  });

  it('Should handle Manual type with partial manualTimeRange', () => {
    const result = preparePickerTimeRange({
      item: {
        timePickerConfig: {
          type: TimeConfigType.MANUAL,
          manualTimeRange: { from: 1747144711 },
        },
      },
      series: [],
      dashboardTimeRange: defaultDashboardTimeRange,
    });

    expect(result).toEqual({ from: 1747144711, to: defaultDashboardTimeRange.to });
  });

  it('Should handle Manual type with partial manualTimeRange to', () => {
    const result = preparePickerTimeRange({
      item: {
        timePickerConfig: {
          type: TimeConfigType.MANUAL,
          manualTimeRange: { to: 1747144711 },
        },
      },
      series: [],
      dashboardTimeRange: defaultDashboardTimeRange,
    });

    expect(result).toEqual({ from: defaultDashboardTimeRange.from, to: 1747144711 });
  });

  it('Should handle Field type with valid Field values', () => {
    const result = preparePickerTimeRange({
      item: {
        timePickerConfig: {
          type: TimeConfigType.FIELD,
          fieldFrom: { name: 'timeField', source: 'A' },
          fieldTo: { name: 'timeField', source: 'A' },
        },
      },
      series: [mockFrame],
      dashboardTimeRange: defaultDashboardTimeRange,
    });

    expect(result).toEqual({ from: 1625097600000, to: 1625097600000 });
  });

  it('Should handle Field type with missing Field values', () => {
    const result = preparePickerTimeRange({
      item: {
        timePickerConfig: {
          type: TimeConfigType.FIELD,
          fieldFrom: { name: 'timeField', source: 'A' },
          fieldTo: { name: 'timeField', source: 'A' },
        },
      },
      series: [],
      dashboardTimeRange: defaultDashboardTimeRange,
    });

    expect(result).toEqual(defaultDashboardTimeRange);
  });

  it('Should return dashboardTimeRange for unknown config type', () => {
    const result = preparePickerTimeRange({
      item: {
        timePickerConfig: {
          type: 'UNKNOWN' as any,
        },
      },
      series: [],
      dashboardTimeRange: defaultDashboardTimeRange,
    });

    expect(result).toEqual(defaultDashboardTimeRange);
  });
});
