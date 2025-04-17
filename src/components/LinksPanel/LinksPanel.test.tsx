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
  describe('Links', () => {
    it('Should show links ', async () => {
      const replaceVariables = jest.fn();
      replaceVariables.mockImplementation((str: string) => str);

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
        groups: [
          createGroupConfig({
            name: 'Test ',
            items: links,
          }),
        ],
      });

      await act(async () => render(getComponent({ options, replaceVariables })));

      expect(selectors.root()).toBeInTheDocument();

      expect(selectors.buttonEmptySingleLink(false, 'Empty link')).toBeInTheDocument();
      expect(selectors.buttonSingleLink(false, 'Link 2')).toBeInTheDocument();

      expect(selectors.dropdown(false, 'Tags')).toBeInTheDocument();
      expect(selectors.buttonDropdown(false, 'Tags')).toBeInTheDocument();
    });
  });

  it('Should switch groups', async () => {
    const replaceVariables = jest.fn();
    replaceVariables.mockImplementation((str: string) => str);

    const options = createPanelOptions({
      groups: [
        createGroupConfig({
          name: 'Group1',
          items: [
            createLinkConfig({ name: 'Link 1', url: 'test1.com' }),
            createLinkConfig({ name: 'Link 2', url: 'test2.com' }),
          ],
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

    await act(async () => render(getComponent({ options, replaceVariables })));

    expect(selectors.root()).toBeInTheDocument();

    expect(selectors.buttonSingleLink(false, 'Link 1')).toBeInTheDocument();
    expect(selectors.buttonSingleLink(false, 'Link 2')).toBeInTheDocument();

    expect(selectors.tab(false, 'Group2')).toBeInTheDocument();

    /**
     * Select group2
     */
    await act(async () => fireEvent.click(selectors.tab(false, 'Group2')));

    expect(selectors.buttonSingleLink(true, 'Link 1')).not.toBeInTheDocument();
    expect(selectors.buttonSingleLink(true, 'Link 2')).not.toBeInTheDocument();

    expect(selectors.buttonSingleLink(false, 'Link 3')).toBeInTheDocument();
    expect(selectors.buttonSingleLink(false, 'Link 4')).toBeInTheDocument();
  });

  // it('Should use first group', async () => {
  //   const tables = [
  //     createTableConfig({
  //       name: 'group1',
  //       items: [
  //         createColumnConfig({
  //           field: { name: 'group1Field', source: '' },
  //         }),
  //       ],
  //     }),
  //     createTableConfig({
  //       name: 'group2',
  //       items: [],
  //     }),
  //   ];

  //   await act(async () =>
  //     render(
  //       getComponent({
  //         options: createPanelOptions({
  //           tables,
  //         }),
  //       })
  //     )
  //   );

  //   expect(useTable).toHaveBeenCalledWith(
  //     expect.objectContaining({
  //       columns: [
  //         expect.objectContaining({
  //           field: {
  //             name: 'group1Field',
  //             source: '',
  //           },
  //         }),
  //       ],
  //     })
  //   );
  // });

  // it('Should switch tables and scroll to selected', async () => {
  //   const tables = [
  //     createTableConfig({
  //       name: 'group1',
  //       items: [createColumnConfig({ field: { name: 'group1Field', source: '' } })],
  //     }),
  //     createTableConfig({
  //       name: 'group2',
  //       items: [createColumnConfig({ field: { name: 'group2Field', source: '' } })],
  //     }),
  //   ];
  //   await act(async () =>
  //     render(
  //       getComponent({
  //         options: createPanelOptions({
  //           tables,
  //         }),
  //       })
  //     )
  //   );

  //   /**
  //    * Select group2
  //    */
  //   await act(async () => fireEvent.click(selectors.tab(false, 'group2')));

  //   /**
  //    * Check if group selected
  //    */
  //   expect(useTable).toHaveBeenCalledWith(
  //     expect.objectContaining({
  //       columns: [
  //         expect.objectContaining({
  //           field: {
  //             name: 'group2Field',
  //             source: '',
  //           },
  //         }),
  //       ],
  //     })
  //   );
  // });

  // it('Should work if no tables', async () => {
  //   await act(async () =>
  //     render(
  //       getComponent({
  //         options: createPanelOptions({
  //           tables: null as never,
  //         }),
  //       })
  //     )
  //   );

  //   expect(selectors.root()).toBeInTheDocument();
  // });

  // it('Should allow to download data', async () => {
  //   const tables = [createTableConfig({})];

  //   await act(async () =>
  //     render(
  //       getComponent({
  //         options: createPanelOptions({
  //           tables,
  //           toolbar: createToolbarOptions({
  //             export: true,
  //             exportFormats: [ExportFormatType.CSV, ExportFormatType.XLSX],
  //           }),
  //         }),
  //       })
  //     )
  //   );

  //   expect(selectors.buttonDownload()).toBeInTheDocument();

  //   fireEvent.click(selectors.buttonDownload());

  //   expect(onExportMock).toHaveBeenCalled();
  // });

  // it('Should allow to change download format data', async () => {
  //   const tables = [createTableConfig({})];

  //   await act(async () =>
  //     render(
  //       getComponent({
  //         options: createPanelOptions({
  //           tables,
  //           toolbar: createToolbarOptions({
  //             export: false,
  //             exportFormats: [ExportFormatType.CSV, ExportFormatType.XLSX],
  //           }),
  //         }),
  //       })
  //     )
  //   );

  //   expect(selectors.dropdown()).toBeInTheDocument();
  //   expect(selectors.buttonFormat()).toBeInTheDocument();
  //   expect(selectors.buttonFormat()).toHaveTextContent('csv');

  //   expect(selectors.buttonSetFormat(true, 'csv')).not.toBeInTheDocument();
  //   expect(selectors.buttonSetFormat(true, 'xlsx')).not.toBeInTheDocument();

  //   /**
  //    * Open Dropdown menu
  //    */
  //   fireEvent.click(selectors.dropdown());

  //   expect(selectors.buttonSetFormat(true, 'csv')).toBeInTheDocument();
  //   expect(selectors.buttonSetFormat(true, 'xlsx')).toBeInTheDocument();

  //   /**
  //    * Change format
  //    */
  //   await act(() => fireEvent.click(selectors.buttonSetFormat(false, 'xlsx')));
  //   expect(selectors.buttonFormat()).toHaveTextContent('xlsx');

  //   /**
  //    * Change format
  //    */
  //   fireEvent.click(selectors.dropdown());
  //   await act(() => fireEvent.click(selectors.buttonSetFormat(false, 'csv')));
  //   expect(selectors.buttonFormat()).toHaveTextContent('csv');
  // });

  // it('Should show ScrollContainer since grafana 11.5.0', async () => {
  //   /**
  //    * Set version 11.5.0
  //    * by default config returns invalid version 1.0 cause error in test
  //    */
  //   Object.assign(config, {
  //     buildInfo: { version: '11.5.0' },
  //   });
  //   const tables = [
  //     createTableConfig({
  //       name: 'group1',
  //       items: [
  //         createColumnConfig({
  //           field: { name: 'group1Field', source: '' },
  //         }),
  //       ],
  //     }),
  //     createTableConfig({
  //       name: 'group2',
  //       items: [],
  //     }),
  //   ];

  //   await act(async () =>
  //     render(
  //       getComponent({
  //         options: createPanelOptions({
  //           tables,
  //         }),
  //       })
  //     )
  //   );

  //   expect(selectors.defaultScrollContainer(true)).not.toBeInTheDocument();
  //   expect(selectors.scrollContainer()).toBeInTheDocument();
  // });

  // it('Should switch tables and apply different highlight options', async () => {
  //   const tables = [
  //     createTableConfig({
  //       name: 'group1',
  //       items: [createColumnConfig({ field: { name: 'group1Field', source: '' } })],
  //       rowHighlight: createRowHighlightConfig({}),
  //     }),
  //     createTableConfig({
  //       name: 'group2',
  //       items: [createColumnConfig({ field: { name: 'group2Field', source: '' } })],
  //       rowHighlight: createRowHighlightConfig({
  //         enabled: true,
  //         smooth: true,
  //       }),
  //     }),
  //   ];
  //   await act(async () =>
  //     render(
  //       getComponent({
  //         options: createPanelOptions({
  //           tables,
  //         }),
  //       })
  //     )
  //   );

  //   /**
  //    * Select group2
  //    */
  //   await act(async () => fireEvent.click(selectors.tab(false, 'group2')));

  //   /**
  //    * Check if group selected
  //    */
  //   expect(useTable).toHaveBeenCalledWith(
  //     expect.objectContaining({
  //       rowHighlightConfig: expect.objectContaining({
  //         smooth: true,
  //         enabled: true,
  //       }),
  //     })
  //   );
  // });
  // it('Should show open Drawer Button', async () => {
  //   const tables = [
  //     createTableConfig({
  //       name: 'group1',
  //       items: [
  //         createColumnConfig({
  //           field: { name: 'group1Field', source: '' },
  //         }),
  //       ],
  //     }),
  //   ];

  //   await act(async () =>
  //     render(
  //       getComponent({
  //         options: createPanelOptions({
  //           tables,
  //           isColumnManagerAvailable: true,
  //         }),
  //       })
  //     )
  //   );
  //   expect(selectors.buttonOpenDrawer(false, 'group1')).toBeInTheDocument();
  //   await act(async () => fireEvent.click(selectors.buttonOpenDrawer(false, 'group1')));

  //   expect(useTable).toHaveBeenCalledWith(
  //     expect.objectContaining({
  //       columns: [
  //         expect.objectContaining({
  //           field: {
  //             name: 'group1Field',
  //             source: '',
  //           },
  //         }),
  //       ],
  //     })
  //   );

  //   expect(Table).toHaveBeenLastCalledWith(expect.objectContaining({ isDrawerOpen: true }), expect.anything());
  // });

  // it('Should show open Drawer Button for current group', async () => {
  //   const tables = [
  //     createTableConfig({
  //       name: 'group1',
  //       items: [createColumnConfig({ field: { name: 'group1Field', source: '' } })],
  //       rowHighlight: createRowHighlightConfig({}),
  //     }),
  //     createTableConfig({
  //       name: 'group2',
  //       items: [createColumnConfig({ field: { name: 'group2Field', source: '' } })],
  //       rowHighlight: createRowHighlightConfig({
  //         enabled: true,
  //         smooth: true,
  //       }),
  //     }),
  //   ];
  //   await act(async () =>
  //     render(
  //       getComponent({
  //         options: createPanelOptions({
  //           tables,
  //           isColumnManagerAvailable: true,
  //         }),
  //       })
  //     )
  //   );

  //   /**
  //    * Select group2
  //    */
  //   await act(async () => fireEvent.click(selectors.tab(false, 'group2')));

  //   /**
  //    * Check if group selected
  //    */
  //   expect(useTable).toHaveBeenCalledWith(
  //     expect.objectContaining({
  //       rowHighlightConfig: expect.objectContaining({
  //         smooth: true,
  //         enabled: true,
  //       }),
  //     })
  //   );

  //   expect(selectors.buttonOpenDrawer(false, 'group2')).toBeInTheDocument();
  //   await act(async () => fireEvent.click(selectors.buttonOpenDrawer(false, 'group2')));

  //   expect(Table).toHaveBeenLastCalledWith(expect.objectContaining({ isDrawerOpen: true }), expect.anything());
  // });
});
