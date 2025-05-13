import { createTheme } from '@grafana/data';
import { locationService } from '@grafana/runtime';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { createSelector, getJestSelectors } from '@volkovlabs/jest-selectors';
import React, { useRef } from 'react';

import { TEST_IDS } from '@/constants';
import { createGroupConfig, createLinkConfig, createNestedLinkConfig, createVisualLinkConfig } from '@/utils';

import { LinkElement } from '../LinkElement';
import { TimePickerElement } from '../TimePickerElement';
import { LinksGridLayout } from './LinksGridLayout';
import { VisualLinkType } from '@/types';

/**
 * Props
 */
type Props = React.ComponentProps<typeof LinksGridLayout>;
type ExtendedProps = Partial<Props> & {
  toolbarHeight?: number;
};

/**
 * Mock locationService
 */
jest.mock('@grafana/runtime', () => ({
  locationService: {
    getLocation: jest.fn(),
  },
}));

/**
 * In Test Ids
 */
const inTestIds = {
  linkElement: createSelector('data-testid link-element'),
  timePickerElement: createSelector('data-testid time-picker-element'),
  buttonLevelsUpdate: createSelector('data-testid button-levels-update'),
};

/**
 * Mock Link Element
 */
const LinkElementMock = () => <div {...inTestIds.linkElement.apply()} />;

jest.mock('../LinkElement', () => ({
  LinkElement: jest.fn(),
}));

/**
 * Mock Time Picker Element
 */
const TimePickerMock = () => <div {...inTestIds.timePickerElement.apply()} />;

jest.mock('../TimePickerElement', () => ({
  TimePickerElement: jest.fn(),
}));

describe('Grid layout', () => {
  /**
   * Theme
   */
  const theme = createTheme();

  /**
   * Default
   */
  const nestedLink = createNestedLinkConfig({ name: 'Link1', url: '', isCurrentLink: true });

  const defaultLink = createVisualLinkConfig({
    name: 'Link1',
    links: [nestedLink],
  });

  const defaultLinks = [defaultLink];

  /**
   * Get Tested Component
   * @param props
   */
  const Component = (props: ExtendedProps) => {
    /**
     * Element ref
     */
    const toolbarRowRef = useRef<HTMLDivElement | null>(null);

    return (
      <>
        <div ref={toolbarRowRef} style={{ height: props.toolbarHeight ? props.toolbarHeight : 50 }}></div>
        <LinksGridLayout toolbarRowRef={toolbarRowRef} {...(props as any)} />
      </>
    );
  };

  const getComponent = (props: ExtendedProps) => {
    return <Component {...props} />;
  };
  /**
   * Selectors
   */
  const getSelectors = getJestSelectors({
    ...TEST_IDS.gridLayout,
    ...inTestIds,
  });

  const selectors = getSelectors(screen);

  beforeEach(() => {
    jest.mocked(LinkElement).mockImplementation(LinkElementMock);
    jest.mocked(TimePickerElement).mockImplementation(TimePickerMock);
    jest.mocked(locationService.getLocation).mockReturnValue({
      search: '?panel=16',
    } as Location);
  });

  it('Should render Layout', async () => {
    const onOptionsChange = jest.fn();
    const options = {
      groups: [],
      groupsSorting: true,
      dropdowns: [],
    };

    const activeGroup = createGroupConfig({
      items: [createLinkConfig({ name: 'Link1', url: '' })],
    });

    const defaultLink = createVisualLinkConfig({
      name: 'Link1',
      links: [nestedLink],
    });

    const defaultTimePickerLink = createVisualLinkConfig({
      name: 'Link2',
      type: VisualLinkType.TIMEPICKER,
    });

    await act(async () =>
      render(
        getComponent({
          width: 400,
          height: 400,
          links: [defaultLink, defaultTimePickerLink],
          options: options,
          onOptionsChange: onOptionsChange,
          activeGroup: activeGroup,
          panelTitle: 'Title',
        })
      )
    );

    expect(selectors.root()).toBeInTheDocument();
    expect(selectors.root()).toHaveStyle('height: 362px');
    expect(selectors.timePickerElement()).toBeInTheDocument();
  });

  it('Should render Layout and calculate max height if no title', async () => {
    const onOptionsChange = jest.fn();
    const options = {
      groups: [],
      groupsSorting: true,
      dropdowns: [],
    };

    const activeGroup = createGroupConfig({
      items: [createLinkConfig({ name: 'Link1', url: '' })],
    });

    await act(async () =>
      render(
        getComponent({
          width: 400,
          height: 400,
          links: defaultLinks,
          options: options,
          onOptionsChange: onOptionsChange,
          activeGroup: activeGroup,
          panelTitle: '',
        })
      )
    );

    expect(selectors.root()).toBeInTheDocument();
    expect(selectors.root()).toHaveStyle('height: 400px');
  });

  it('Should render Layout and apply styles for edit mode', async () => {
    jest.mocked(locationService.getLocation).mockReturnValue({
      search: '?editPanel=1',
    } as Location);

    const onOptionsChange = jest.fn();
    const options = {
      groups: [],
      groupsSorting: true,
      dropdowns: [],
    };

    const activeGroup = createGroupConfig({
      items: [createLinkConfig({ name: 'Link1', url: '' })],
    });

    await act(async () =>
      render(
        getComponent({
          width: 400,
          height: 400,
          links: defaultLinks,
          options: options,
          onOptionsChange: onOptionsChange,
          activeGroup: activeGroup,
          panelTitle: '',
        })
      )
    );

    expect(selectors.root()).toBeInTheDocument();
    expect(selectors.columnItem(false, defaultLink.name)).toBeInTheDocument();
    expect(selectors.columnItem(false, defaultLink.name)).toHaveStyle(`border: 1px solid  ${theme.colors.border.weak}`);
  });

  it('Should call onOptionsChange to resize or drag and drop in editMode', async () => {
    jest.mocked(locationService.getLocation).mockReturnValue({
      search: '?editPanel=1',
    } as Location);

    const triggeredLayout = [{ i: '1a', x: 0, y: 0, w: 2, h: 2 }];
    const defaultGroup = createGroupConfig({
      name: 'Default',
      items: [createLinkConfig({ name: 'Link0', url: '' })],
    });

    const activeGroup = createGroupConfig({
      items: [createLinkConfig({ name: 'Link1', url: '' })],
      manualGridLayout: [{ i: 'default', x: 1, y: 1, w: 3, h: 4 }],
    });

    const onOptionsChange = jest.fn();
    const options = {
      groups: [defaultGroup, activeGroup],
      groupsSorting: true,
      dropdowns: [],
    };

    await act(async () =>
      render(
        getComponent({
          width: 400,
          height: 400,
          links: defaultLinks,
          options: options,
          onOptionsChange: onOptionsChange,
          activeGroup: activeGroup,
          panelTitle: '',
        })
      )
    );

    expect(selectors.root()).toBeInTheDocument();
    expect(selectors.columnItem(false, defaultLink.name)).toBeInTheDocument();

    /**
     * Use mocked grid layout
     */
    expect(selectors.mockGridLayout()).toBeInTheDocument();
    expect(selectors.mockFieldInputChangeLayout()).toBeInTheDocument();

    /**
     * Simulate resize or drag and call onLayoutChange
     * based on mocked ReactGridLayout set triggeredLayout as JSON string
     */
    fireEvent.change(selectors.mockFieldInputChangeLayout(), {
      target: {
        value: JSON.stringify(triggeredLayout),
      },
    });

    expect(onOptionsChange).toHaveBeenCalled();
    expect(onOptionsChange).toHaveBeenCalledWith(
      expect.objectContaining({
        groups: expect.arrayContaining([
          expect.objectContaining({ name: defaultGroup.name }),
          expect.objectContaining({ name: activeGroup.name, manualGridLayout: triggeredLayout }),
        ]),
      })
    );
  });
});
