import { fireEvent, render, screen } from '@testing-library/react';
import { createSelector, getJestSelectors } from '@volkovlabs/jest-selectors';
import React from 'react';

import { TEST_IDS } from '@/constants';
import { HoverMenuPositionType, LinkTarget, LinkType } from '@/types';
import { createLinkConfig } from '@/utils';

import { ContentEditor, TimePickerEditor } from './components';
import { LinkEditor } from './LinkEditor';

type Props = React.ComponentProps<typeof LinkEditor>;

const inTestIds = {
  timePickerEditor: createSelector('data-testid time-picker-editor'),
  contentEditor: createSelector('data-testid content-editor'),
};

/**
 * Mock TimePickerEditor
 */
const TimePickerEditorMock = ({ value, onChange }: any) => {
  return (
    <input
      {...inTestIds.timePickerEditor.apply()}
      onChange={() => {
        onChange(value);
      }}
    />
  );
};

/**
 * Mock ContentEditor
 */
const ContentEditorMock = ({ value, onChange }: any) => {
  return (
    <input
      {...inTestIds.contentEditor.apply()}
      onChange={() => {
        onChange(value);
      }}
    />
  );
};

jest.mock('./components', () => ({
  TimePickerEditor: jest.fn(),
  ContentEditor: jest.fn(),
}));

describe('LinkEditor', () => {
  /**
   * Selectors
   */
  const getSelectors = getJestSelectors({ ...TEST_IDS.linkEditor, ...inTestIds });
  const selectors = getSelectors(screen);

  /**
   * Change
   */
  const onChange = jest.fn();

  /**
   * Get component
   */
  const getComponent = (props: Partial<Props>) => {
    return (
      <LinkEditor
        value={createLinkConfig()}
        onChange={onChange}
        dashboards={[]}
        optionId=""
        dropdowns={[]}
        {...(props as any)}
      />
    );
  };

  beforeEach(() => {
    jest.mocked(TimePickerEditor).mockImplementation(TimePickerEditorMock);
    jest.mocked(ContentEditor).mockImplementation(ContentEditorMock);
  });

  it('Should allow to change Link Type to Dropdown for groups', () => {
    render(getComponent({ optionId: 'groups' }));

    expect(selectors.fieldLinkType()).toBeInTheDocument();
    expect(selectors.fieldLinkType()).toHaveValue(LinkType.SINGLE);

    fireEvent.change(selectors.fieldLinkType(), { target: { values: LinkType.DROPDOWN } });

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        linkType: LinkType.DROPDOWN,
      })
    );
  });

  it('Should not allow to change Link Type to Dropdown for Dropdowns', () => {
    render(getComponent({ optionId: 'dropdowns' }));

    expect(selectors.fieldLinkType()).toBeInTheDocument();
    expect(selectors.fieldLinkType()).toHaveValue(LinkType.SINGLE);

    fireEvent.change(selectors.fieldLinkType(), { target: { values: LinkType.DROPDOWN } });

    /**
     * Get value via Select mock
     */
    expect(onChange).not.toHaveBeenCalledWith();
  });

  it('Should allow change url for single type', () => {
    render(getComponent({ optionId: 'groups' }));

    expect(selectors.fieldUrl()).toBeInTheDocument();
    expect(selectors.fieldUrl()).toHaveValue('');

    fireEvent.change(selectors.fieldUrl(), { target: { value: 'url.test' } });

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        url: 'url.test',
      })
    );
  });

  it('Should allow change tags for TAGS type', () => {
    render(getComponent({ optionId: 'groups', value: createLinkConfig({ linkType: LinkType.TAGS }) }));

    expect(selectors.fieldTags()).toBeInTheDocument();
    expect(selectors.fieldTags()).toHaveValue('');

    fireEvent.change(selectors.fieldTags(), { target: { value: 'tag' } });

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        tags: 'tag',
      })
    );
  });

  it('Should allow change dashboard for DASHBOARD type', () => {
    const dashboardsMock = [
      { url: 'dash/1', title: 'dash-1' },
      { url: 'dash/2', title: 'dash-2' },
      { url: 'dash/3', title: 'dash-3' },
    ] as any;
    render(
      getComponent({
        optionId: 'dropdowns',
        value: createLinkConfig({ linkType: LinkType.DASHBOARD, dashboardUrl: 'dash/1' }),
        dashboards: dashboardsMock,
      })
    );

    expect(selectors.fieldDashboard()).toBeInTheDocument();
    expect(selectors.fieldDashboard()).toHaveValue('dash/1');

    fireEvent.change(selectors.fieldDashboard(), { target: { values: 'dash/3' } });

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        dashboardUrl: 'dash/3',
      })
    );
  });

  it('Should allow change dropdown for DROPDOWN type', () => {
    const dropdowns = ['dropdown-1', 'dropdown-2', 'dropdown-3'];
    render(
      getComponent({
        optionId: 'groups',
        value: createLinkConfig({ linkType: LinkType.DROPDOWN, dropdownName: 'dropdown-1' }),
        dropdowns,
      })
    );

    expect(selectors.fieldDropdown()).toBeInTheDocument();
    expect(selectors.fieldDropdown()).toHaveValue('dropdown-1');

    fireEvent.change(selectors.fieldDropdown(), { target: { values: 'dropdown-3' } });

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        dropdownName: 'dropdown-3',
      })
    );
  });

  it('Should allow change menu action for DROPDOWN type', () => {
    const dropdowns = ['dropdown-1', 'dropdown-2', 'dropdown-3'];
    render(
      getComponent({
        optionId: 'groups',
        value: createLinkConfig({ linkType: LinkType.DROPDOWN, dropdownName: 'dropdown-1' }),
        dropdowns,
      })
    );

    expect(selectors.fieldShowMenu()).toBeInTheDocument();
    fireEvent.click(selectors.fieldShowMenu());

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        showMenuOnHover: true,
      })
    );
  });

  it('Should allow change menu position for DROPDOWN type if not specified', () => {
    const dropdowns = ['dropdown-1', 'dropdown-2', 'dropdown-3'];
    render(
      getComponent({
        optionId: 'groups',
        value: createLinkConfig({
          linkType: LinkType.DROPDOWN,
          dropdownName: 'dropdown-1',
          showMenuOnHover: true,
          hoverMenuPosition: undefined,
        }),
        dropdowns,
      })
    );

    expect(selectors.fieldHoverPosition()).toBeInTheDocument();
    expect(selectors.fieldHoverPosition()).toHaveValue(HoverMenuPositionType.BOTTOM);

    fireEvent.change(selectors.fieldHoverPosition(), { target: { values: HoverMenuPositionType.TOP } });

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        showMenuOnHover: true,
        hoverMenuPosition: HoverMenuPositionType.TOP,
      })
    );
  });

  it('Should allow change menu position for DROPDOWN type ', () => {
    const dropdowns = ['dropdown-1', 'dropdown-2', 'dropdown-3'];
    render(
      getComponent({
        optionId: 'groups',
        value: createLinkConfig({
          linkType: LinkType.DROPDOWN,
          dropdownName: 'dropdown-1',
          showMenuOnHover: true,
          hoverMenuPosition: HoverMenuPositionType.LEFT,
        }),
        dropdowns,
      })
    );

    expect(selectors.fieldHoverPosition()).toBeInTheDocument();
    expect(selectors.fieldHoverPosition()).toHaveValue(HoverMenuPositionType.LEFT);

    fireEvent.change(selectors.fieldHoverPosition(), { target: { values: HoverMenuPositionType.TOP } });

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        showMenuOnHover: true,
        hoverMenuPosition: HoverMenuPositionType.TOP,
      })
    );
  });

  it('Should allow change menu position for TAGS type if not specified', () => {
    const dropdowns = ['dropdown-1', 'dropdown-2', 'dropdown-3'];
    render(
      getComponent({
        optionId: 'groups',
        value: createLinkConfig({
          linkType: LinkType.TAGS,
          dropdownName: 'dropdown-1',
          showMenuOnHover: true,
          hoverMenuPosition: undefined,
        }),
        dropdowns,
      })
    );

    expect(selectors.fieldHoverPosition()).toBeInTheDocument();
    expect(selectors.fieldHoverPosition()).toHaveValue(HoverMenuPositionType.BOTTOM);

    fireEvent.change(selectors.fieldHoverPosition(), { target: { values: HoverMenuPositionType.TOP } });

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        showMenuOnHover: true,
        hoverMenuPosition: HoverMenuPositionType.TOP,
      })
    );
  });

  it('Should allow change menu position for Tags type ', () => {
    const dropdowns = ['dropdown-1', 'dropdown-2', 'dropdown-3'];
    render(
      getComponent({
        optionId: 'groups',
        value: createLinkConfig({
          linkType: LinkType.TAGS,
          dropdownName: 'dropdown-1',
          showMenuOnHover: true,
          hoverMenuPosition: HoverMenuPositionType.LEFT,
        }),
        dropdowns,
      })
    );

    expect(selectors.fieldHoverPosition()).toBeInTheDocument();
    expect(selectors.fieldHoverPosition()).toHaveValue(HoverMenuPositionType.LEFT);

    fireEvent.change(selectors.fieldHoverPosition(), { target: { values: HoverMenuPositionType.TOP } });

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        showMenuOnHover: true,
        hoverMenuPosition: HoverMenuPositionType.TOP,
      })
    );
  });

  it('Should not show menuPosition for Tags if showMenuOnHover is false ', () => {
    const dropdowns = ['dropdown-1', 'dropdown-2', 'dropdown-3'];
    render(
      getComponent({
        optionId: 'groups',
        value: createLinkConfig({
          linkType: LinkType.TAGS,
          dropdownName: 'dropdown-1',
          showMenuOnHover: false,
          hoverMenuPosition: HoverMenuPositionType.LEFT,
        }),
        dropdowns,
      })
    );

    expect(selectors.fieldHoverPosition(true)).not.toBeInTheDocument();
  });

  it('Should not show menuPosition for DROPDOWN if showMenuOnHover is false ', () => {
    const dropdowns = ['dropdown-1', 'dropdown-2', 'dropdown-3'];
    render(
      getComponent({
        optionId: 'groups',
        value: createLinkConfig({
          linkType: LinkType.DROPDOWN,
          dropdownName: 'dropdown-1',
          showMenuOnHover: false,
          hoverMenuPosition: HoverMenuPositionType.LEFT,
        }),
        dropdowns,
      })
    );

    expect(selectors.fieldHoverPosition(true)).not.toBeInTheDocument();
  });

  it('Should allow change menu action for TAGS type', () => {
    render(getComponent({ optionId: 'groups', value: createLinkConfig({ linkType: LinkType.TAGS }) }));

    expect(selectors.fieldShowMenu()).toBeInTheDocument();
    fireEvent.click(selectors.fieldShowMenu());

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        showMenuOnHover: true,
      })
    );
  });

  it('Should not display the showMenuOnHover option for the TAGS type if the editor is not groups.', () => {
    render(getComponent({ optionId: 'dropdowns', value: createLinkConfig({ linkType: LinkType.TAGS }) }));
    expect(selectors.fieldShowMenu(true)).not.toBeInTheDocument();
  });

  it('Should not display the showMenuOnHover option for the DROPDOWN type if the editor is not groups.', () => {
    render(getComponent({ optionId: 'dropdowns', value: createLinkConfig({ linkType: LinkType.DROPDOWN }) }));
    expect(selectors.fieldDropdown(true)).not.toBeInTheDocument();
    expect(selectors.fieldShowMenu(true)).not.toBeInTheDocument();
  });

  it('Should allow change Icon', () => {
    render(
      getComponent({
        optionId: 'groups',
        value: createLinkConfig({ linkType: LinkType.SINGLE }),
      })
    );

    expect(selectors.fieldIcon()).toBeInTheDocument();
    expect(selectors.fieldIcon()).toHaveValue('');

    fireEvent.change(selectors.fieldIcon(), { target: { values: 'link' } });

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        icon: 'link',
      })
    );
  });

  it('Should allow change target', () => {
    render(
      getComponent({
        optionId: 'groups',
        value: createLinkConfig({ linkType: LinkType.SINGLE }),
      })
    );

    expect(selectors.fieldTarget()).toBeInTheDocument();
    fireEvent.click(selectors.fieldTargetOption(false, LinkTarget.NEW_TAB));

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        target: LinkTarget.NEW_TAB,
      })
    );
  });

  it('Should allow change Include Time Range', () => {
    render(
      getComponent({
        optionId: 'groups',
        value: createLinkConfig({ linkType: LinkType.SINGLE }),
      })
    );

    expect(selectors.fieldIncludeTimeRange()).toBeInTheDocument();
    fireEvent.click(selectors.fieldIncludeTimeRange());

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        includeTimeRange: true,
      })
    );
  });

  it('Should allow change Include Time Range', () => {
    render(
      getComponent({
        optionId: 'groups',
        value: createLinkConfig({ linkType: LinkType.SINGLE }),
      })
    );

    expect(selectors.fieldIncludeVariables()).toBeInTheDocument();
    fireEvent.click(selectors.fieldIncludeVariables());

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        includeVariables: true,
      })
    );
  });

  it('Should render TimePickerEditor', () => {
    render(getComponent({ optionId: 'groups', value: createLinkConfig({ linkType: LinkType.TIMEPICKER }) }));

    expect(selectors.fieldLinkType()).toBeInTheDocument();
    expect(selectors.fieldLinkType()).toHaveValue(LinkType.TIMEPICKER);

    expect(selectors.timePickerEditor()).toBeInTheDocument();
  });

  it('Should render ContentEditor', () => {
    render(getComponent({ optionId: 'groups', value: createLinkConfig({ linkType: LinkType.HTML }) }));

    expect(selectors.fieldLinkType()).toBeInTheDocument();
    expect(selectors.fieldLinkType()).toHaveValue(LinkType.HTML);

    expect(selectors.contentEditor()).toBeInTheDocument();
  });
});
