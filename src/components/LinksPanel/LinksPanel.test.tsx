import { act, fireEvent, render, screen } from '@testing-library/react';
import { getJestSelectors } from '@volkovlabs/jest-selectors';
import React from 'react';

import { TEST_IDS } from '@/constants';
import { useSavedState } from '@/hooks';
import { LinkType } from '@/types';
import { createGroupConfig, createLinkConfig, createPanelOptions, getAllDashboards } from '@/utils';

import { LinksPanel } from './LinksPanel';

/**
 * Props
 */
type Props = React.ComponentProps<typeof LinksPanel>;

/**
 * Mock getAllDashboards utils
 */
jest.mock('@/utils', () => ({
  ...jest.requireActual('@/utils'),
  getAllDashboards: jest.fn(),
}));

jest.mock('../../hooks/useSavedState', () => ({
  useSavedState: jest.fn(jest.requireActual('../../hooks/useSavedState').useSavedState),
}));

/**
 * Panel
 */
describe('LinksPanel', () => {
  /**
   * Selectors
   */
  const getSelectors = getJestSelectors(TEST_IDS.panel);
  const selectors = getSelectors(screen);

  /**
   * Default Time range
   */
  const defaultTimeRange = {
    from: new Date('2023-01-01T00:00:00Z'),
    to: new Date('2023-01-02T00:00:00Z'),
  } as any;

  const replaceVariables = jest.fn();

  /**
   * Panel Data
   */
  const data = {
    series: [],
  };

  /**
   * Panel Options
   */
  const defaultOptions = createPanelOptions();

  /**
   * Get Tested Component
   */
  const getComponent = (props: Partial<Props>) => {
    return (
      <LinksPanel
        width={400}
        height={400}
        data={data}
        options={defaultOptions}
        timeRange={defaultTimeRange}
        replaceVariables={replaceVariables}
        {...(props as any)}
      />
    );
  };

  beforeEach(() => {
    replaceVariables.mockImplementation((str: string) => str);
    jest.mocked(useSavedState).mockImplementation(jest.requireActual('../../hooks/useSavedState').useSavedState);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Renders', () => {
    it('Should find component', async () => {
      await act(async () => render(getComponent({})));
      expect(selectors.root()).toBeInTheDocument();
    });

    it('Should show alert message if no links in groups', async () => {
      const options = createPanelOptions({
        groups: [createGroupConfig({ name: 'Test empty group' })],
      });

      await act(async () => render(getComponent({ options })));
      expect(selectors.root()).toBeInTheDocument();
      expect(selectors.alert()).toBeInTheDocument();
    });
  });

  it('Should display links and groups', async () => {
    jest.mocked(getAllDashboards).mockReturnValue([
      {
        id: 1,
        tags: [],
        title: 'Test dashboard 1',
        type: 'dash-db',
        uid: 'test123',
        uri: 'db/test',
        url: '/d/test123/test',
      },
      {
        id: 2,
        tags: [],
        title: 'Test dashboard 2',
        type: 'dash-db',
        uid: 'test12345',
        uri: 'db/test2',
        url: '/d/test12345/test',
      },
    ] as any);

    const links = [
      createLinkConfig(),
      createLinkConfig({ name: 'Empty link' }),
      createLinkConfig({ name: 'Link 2', url: 'test.com' }),
      createLinkConfig({ name: 'Tags', tags: [], linkType: LinkType.TAGS }),
    ];

    const options = createPanelOptions({
      groupsSorting: true,
      groups: [
        createGroupConfig({
          name: 'Group1',
          items: links,
        }),
        createGroupConfig({
          name: 'Group2',
          items: [
            createLinkConfig({ name: 'Link 3', url: 'test3.com' }),
            createLinkConfig({ name: 'Link 4', url: 'test4.com' }),
          ],
        }),
      ],
    });

    await act(async () => render(getComponent({ options })));

    /**
     * Container
     */
    expect(selectors.root()).toBeInTheDocument();

    /**
     * Links
     */
    expect(selectors.buttonSingleLink(false, 'Link 2')).toBeInTheDocument();
    expect(selectors.buttonEmptySingleLink(false, 'Empty link')).toBeInTheDocument();
    expect(selectors.buttonSingleLink(false, 'Link 2')).toBeInTheDocument();
    expect(selectors.dropdown(false, 'Tags')).toBeInTheDocument();
    expect(selectors.buttonDropdown(false, 'Tags')).toBeInTheDocument();

    /**
     * Groups
     */
    expect(selectors.tab(false, 'Group2')).toBeInTheDocument();
    expect(selectors.tabRow()).toBeInTheDocument();
    expect(selectors.tabRow()).toHaveTextContent('Group1Group2');

    /**
     * Select group2
     */
    await act(async () => fireEvent.click(selectors.tab(false, 'Group2')));

    expect(selectors.buttonSingleLink(true, 'Link 1')).not.toBeInTheDocument();
    expect(selectors.buttonSingleLink(true, 'Link 2')).not.toBeInTheDocument();

    expect(selectors.buttonSingleLink(false, 'Link 3')).toBeInTheDocument();
    expect(selectors.buttonSingleLink(false, 'Link 4')).toBeInTheDocument();

    /**
     * Selected group shows first
     */
    expect(selectors.tabRow()).toHaveTextContent('Group2Group1');
  });
});
