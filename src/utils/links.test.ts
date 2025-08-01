import { DataFrame, Field } from '@grafana/data';
import dayjs from 'dayjs';

import { AlignContentPositionType, LinkConfig, LinkTarget, LinkType, TimeConfigType, VisualLinkType } from '@/types';

import {
  extractParamsByPrefix,
  prepareFromAndToParams,
  prepareLinksToRender,
  preparePickerTimeRange,
  prepareUrlWithParams,
} from './links';
import { createDropdownConfig } from './test';

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
    const result = prepareUrlWithParams(
      { includeKioskMode: false, includeTimeRange: true, includeVariables: true } as LinkConfig,
      timeRange,
      replaceVariables,
      'var-test=123',
      undefined
    );
    expect(result).toEqual('');
  });

  it('Should include only variables if includeTimeRange is false', () => {
    const result = prepareUrlWithParams(
      { includeKioskMode: false, includeTimeRange: false, includeVariables: true } as LinkConfig,
      timeRange,
      replaceVariables,
      'var-x=1&var-y=2',
      'http://localhost'
    );
    expect(result).toEqual('http://localhost?var-x=1&var-y=2');
  });

  it('Should include only time range if includeVariables is false', () => {
    const result = prepareUrlWithParams(
      { includeKioskMode: false, includeTimeRange: true, includeVariables: true } as LinkConfig,
      timeRange,
      replaceVariables,
      '',
      'http://localhost'
    );
    expect(result).toEqual('http://localhost?&from=2023-01-01T00:00:00.000Z&to=2023-01-02T00:00:00.000Z');
  });

  it('Should include both time range and variables', () => {
    const result = prepareUrlWithParams(
      { includeKioskMode: false, includeTimeRange: true, includeVariables: true } as LinkConfig,
      timeRange,
      replaceVariables,
      'var-a=abc',
      'http://localhost'
    );
    expect(result).toEqual('http://localhost?var-a=abc&from=2023-01-01T00:00:00.000Z&to=2023-01-02T00:00:00.000Z');
  });

  it('Should include kiosk mode & time range and variables', () => {
    const result = prepareUrlWithParams(
      { includeKioskMode: true, includeTimeRange: true, includeVariables: true } as LinkConfig,
      timeRange,
      replaceVariables,
      'var-a=abc&kiosk',
      'http://localhost'
    );
    expect(result).toEqual(
      'http://localhost?var-a=abc&from=2023-01-01T00:00:00.000Z&to=2023-01-02T00:00:00.000Z&kiosk'
    );
  });

  it('Should include kiosk mode', () => {
    const result = prepareUrlWithParams(
      { includeKioskMode: true, includeTimeRange: false, includeVariables: false } as LinkConfig,
      timeRange,
      replaceVariables,
      'var-a=abc&kiosk',
      'http://localhost'
    );
    expect(result).toEqual('http://localhost?kiosk');
  });

  it('Should not include kiosk mode if not kiosk in params', () => {
    const result = prepareUrlWithParams(
      { includeKioskMode: true, includeTimeRange: false, includeVariables: false } as LinkConfig,
      timeRange,
      replaceVariables,
      'var-a=abc',
      'http://localhost'
    );
    expect(result).toEqual('http://localhost');
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
          name: 'Link',
          enable: true,
          linkType: LinkType.SINGLE,
          url: 'https://google.com',
          includeVariables: false,
          includeKioskMode: false,
          includeTimeRange: false,
          target: LinkTarget.NEW_TAB,
          tags: [],
          dashboardUrl: '',
          dropdownName: '',
          id: 'test-link0-id',
          dropdownConfig: createDropdownConfig(),
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
          name: 'Link',
          enable: true,
          linkType: LinkType.SINGLE,
          url: 'd/test123/?params=test',
          includeVariables: false,
          includeTimeRange: false,
          includeKioskMode: false,
          target: LinkTarget.NEW_TAB,
          tags: [],
          dashboardUrl: '',
          dropdownName: '',
          id: 'test-link0-id',
          dropdownConfig: createDropdownConfig(),
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
          name: 'Tags',
          enable: true,
          linkType: LinkType.TAGS,
          url: 'https://google.com',
          includeVariables: false,
          includeKioskMode: false,
          includeTimeRange: false,
          target: LinkTarget.NEW_TAB,
          tags: ['env'],
          dashboardUrl: '',
          dropdownName: '',
          id: 'test-link0-id',
          dropdownConfig: createDropdownConfig(),
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
            name: 'Link',
            enable: true,
            linkType: LinkType.SINGLE,
            url: 'https://google.com',
            includeVariables: false,
            includeKioskMode: false,
            includeTimeRange: false,
            target: LinkTarget.NEW_TAB,
            tags: [],
            dashboardUrl: '',
            dropdownName: '',
            id: 'test-link0-dp-id',
            dropdownConfig: createDropdownConfig(),
          },
        ],
      },
    ];

    const currentGroup = {
      name: 'Test',
      items: [
        {
          name: 'Dropdown',
          enable: true,
          linkType: LinkType.DROPDOWN,
          url: 'https://google.com',
          includeVariables: false,
          includeKioskMode: false,
          includeTimeRange: false,
          target: LinkTarget.NEW_TAB,
          tags: ['env'],
          dashboardUrl: '',
          dropdownName: 'Nested',
          id: 'test-link0-id',
          dropdownConfig: createDropdownConfig(),
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

  it('Should process nested DROPDOWN group with time picker', () => {
    const dropdowns = [
      {
        name: 'Nested',
        items: [
          {
            name: 'Link',
            enable: true,
            linkType: LinkType.SINGLE,
            url: 'https://google.com',
            includeVariables: false,
            includeKioskMode: false,
            includeTimeRange: false,
            target: LinkTarget.NEW_TAB,
            tags: [],
            dashboardUrl: '',
            dropdownName: '',
            id: 'test-link0-dp-id',
            dropdownConfig: createDropdownConfig(),
          },
          {
            name: 'Link-2',
            enable: true,
            linkType: LinkType.TIMEPICKER,
            url: '',
            includeVariables: false,
            includeTimeRange: false,
            includeKioskMode: false,
            target: LinkTarget.NEW_TAB,
            tags: [],
            dashboardUrl: '',
            dropdownName: '',
            id: 'test-link0-dp-id-2',
            dropdownConfig: createDropdownConfig(),
          },
        ],
      },
    ];

    const currentGroup = {
      name: 'Test',
      items: [
        {
          name: 'Dropdown',
          enable: true,
          linkType: LinkType.DROPDOWN,
          url: 'https://google.com',
          includeKioskMode: false,
          includeVariables: false,
          includeTimeRange: false,
          target: LinkTarget.NEW_TAB,
          tags: ['env'],
          dashboardUrl: '',
          dropdownName: 'Nested',
          id: 'test-link0-id',
          dropdownConfig: createDropdownConfig(),
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
    expect(result[0].links[1].linkType).toBe(LinkType.TIMEPICKER);
  });

  it('Should generate DASHBOARD link correctly', () => {
    const currentGroup = {
      name: 'Test',
      items: [
        {
          name: 'Link',
          enable: true,
          linkType: LinkType.DASHBOARD,
          url: '',
          includeVariables: false,
          includeKioskMode: false,
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
          name: 'Link',
          enable: true,
          linkType: 'unknown' as any,
          url: '',
          includeVariables: false,
          includeKioskMode: false,
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
          name: 'Time Picker',
          enable: true,
          linkType: LinkType.TIMEPICKER,
          url: '',
          includeVariables: false,
          includeTimeRange: false,
          includeKioskMode: false,
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

  it('Should generate HTML link correctly', () => {
    const currentGroup = {
      name: 'Test',
      items: [
        {
          name: 'HTML',
          enable: true,
          linkType: LinkType.HTML,
          url: '',
          includeVariables: false,
          includeTimeRange: false,
          target: LinkTarget.NEW_TAB,
          tags: [],
          dashboardUrl: '',
          dropdownName: '',
          id: 'test-link0-id',
          includeKioskMode: false,
          htmlConfig: {
            content: 'line',
          },
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
    expect(result[0]).toMatchObject({
      content: 'line',
      id: 'test-link0-id',
      links: [],
      name: 'HTML',
      type: VisualLinkType.HTML,
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
          includeKioskMode: false,
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

  it('Should generate Business AI link correctly', () => {
    const currentGroup = {
      name: 'Test',
      items: [
        {
          name: 'Business AI',
          enable: true,
          linkType: LinkType.LLMAPP,
          showCustomIcons: true,
          customIconUrl: '/custom-icon.png',
          icon: undefined,
          contextPrompt: 'Initial prompt for AI',
          assistantName: 'Business AI',
          alignContentPosition: 'left' as AlignContentPositionType,
          hideTooltipOnHover: true,
          url: '',
          includeVariables: false,
          includeKioskMode: false,
          includeTimeRange: false,
          target: LinkTarget.NEW_TAB,
          tags: [],
          dashboardUrl: '/d/urldashboard1',
          dropdownName: '',
          id: 'llm-1',
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
      dashboardId: '1',
      series: [],
    });

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      type: VisualLinkType.LLMAPP,
      id: 'llm-1',
      name: 'Business AI',
      contextPrompt: 'Initial prompt for AI',
      assistantName: 'Business AI',
      links: [],
      showCustomIcons: true,
      customIconUrl: '/custom-icon.png',
      icon: undefined,
      alignContentPosition: 'left',
      hideTooltipOnHover: true,
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
});
