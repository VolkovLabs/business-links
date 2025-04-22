import { LinkConfigType, LinkTarget, LinkType } from '@/types';

import { extractParamsByPrefix, prepareLinksToRender, prepareUrlWithParams } from './links';

/**
 * extractParamsByPrefix
 */
describe('extractParamsByPrefix', () => {
  it('should extract only parameters with specified prefix', () => {
    const search = 'var-host=server01&var-env=prod&unrelated=value';
    const result = extractParamsByPrefix(search, 'var-');
    expect(result).toEqual('var-host=server01&var-env=prod');
  });

  it('should return empty string if no matching prefix found', () => {
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
      dashboardPath: '',
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
      dashboardPath: '',
    });

    expect(result).toHaveLength(1);
    expect(result[0].links[0].url).toEqual('https://google.com');
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
      dashboardPath: '',
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
      dashboardPath: '',
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
      dashboardPath: '',
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
      dashboardPath: '',
    });

    expect(result).toHaveLength(0);
    expect(result).toEqual([]);
  });
});
