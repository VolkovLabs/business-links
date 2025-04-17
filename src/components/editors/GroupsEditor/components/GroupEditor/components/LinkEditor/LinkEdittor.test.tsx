import { toDataFrame } from '@grafana/data';
import { fireEvent, render, screen } from '@testing-library/react';
import { createSelector, getJestSelectors } from '@volkovlabs/jest-selectors';
import React from 'react';

import { TEST_IDS } from '@/constants';
import { createLinkConfig } from '@/utils';

import { LinkEditor } from './LinkEditor';
import { LinkTarget, LinkType } from '@/types';

type Props = React.ComponentProps<typeof LinkEditor>;

describe('LinkEditor', () => {
  /**
   * Selectors
   */
  const getSelectors = getJestSelectors(TEST_IDS.linkEditor);
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

  beforeEach(() => {});

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
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        linkType: 'unable to find option',
      })
    );
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
});
