import { PanelProps } from '@grafana/data';
import { locationService } from '@grafana/runtime';
import {
  Alert,
  Button,
  Dropdown,
  LinkButton,
  MenuItem,
  ToolbarButton,
  ToolbarButtonRow,
  useStyles2,
} from '@grafana/ui';
import React, { useEffect, useMemo, useState } from 'react';

import { TEST_IDS } from '@/constants';
import { useSavedState } from '@/hooks';
import { DashboardMeta, PanelOptions } from '@/types';
import { VisualLink } from '@/types/links';
import { getAllDashboards, prepareLinksToRender } from '@/utils';

import { getStyles } from './LinksPanel.styles';

/**
 * Test Ids
 */
const testIds = TEST_IDS.panel;

/**
 * Properties
 */
type Props = PanelProps<PanelOptions>;

/**
 * Links Panel
 */
export const LinksPanel: React.FC<Props> = ({ id, width, options, replaceVariables, timeRange }) => {
  /**
   * Styles
   */
  const styles = useStyles2(getStyles);

  /**
   * location service
   */
  const location = locationService.getLocation();

  /**
   * State
   */
  const [dashboards, setDashboards] = useState<DashboardMeta[]>([]);

  /**
   * Current group
   */
  const [currentGroup, setCurrentGroup] = useSavedState<string>({
    key: `volkovlabs.links.panel.${id}`,
    initialValue: options.groups?.[0]?.name || '',
  });

  /**
   * Active group
   */
  const activeGroup = useMemo(() => {
    const currentGroupName = currentGroup || options.groups?.[0]?.name;
    return options.groups.find((group) => group.name === currentGroupName);
  }, [currentGroup, options.groups]);

  /**
   * All dashboards exclude current
   */
  const availableDashboards = useMemo(() => {
    return dashboards?.filter((dashboard) => dashboard.url !== location.pathname);
  }, [dashboards, location.pathname]);

  /**
   * Links for render
   */
  const currentLinks = useMemo(() => {
    return prepareLinksToRender({
      currentGroup: activeGroup,
      dropdowns: options.dropdowns,
      replaceVariables,
      timeRange,
      dashboards: availableDashboards,
      params: location.search,
    });
  }, [activeGroup, availableDashboards, location.search, options.dropdowns, replaceVariables, timeRange]);

  /**
   * Show selected group first
   */
  const sortedGroups = useMemo(() => {
    const activeGroup = options.groups.find((group) => group.name === currentGroup);

    /**
     * Selected group is not found
     */
    if (!activeGroup) {
      return options.groups;
    }

    const withoutActive = options.groups.filter((group) => group.name !== currentGroup);

    return [activeGroup, ...withoutActive];
  }, [currentGroup, options.groups]);

  console.log('options -> ', options);

  /**
   * Is Toolbar Visible
   */
  const isToolbarVisible = useMemo(() => {
    return sortedGroups.length > 1;
  }, [sortedGroups.length]);

  useEffect(() => {
    /**
     * Dashboards
     */
    const getDashboards = async () => {
      const dashboards = await getAllDashboards();
      setDashboards(dashboards);
    };

    getDashboards();
  }, []);

  const renderLink = (link: VisualLink) => {
    /**
     * Dropdown render
     */
    if (link.links.length > 1) {
      /**
       * Menu links
       */
      const menuLinks = link.links.map((dropdownLink) => {
        return (
          <MenuItem
            key={dropdownLink.url}
            label={dropdownLink.name}
            url={dropdownLink.url}
            target={dropdownLink.target}
            className={styles.menuItem}
            icon={dropdownLink.icon}
            {...TEST_IDS.panel.dropdownMenuItem.apply(dropdownLink.name)}
          />
        );
      });

      return (
        <Dropdown
          key={link.name}
          overlay={<div className={styles.menu}>{menuLinks}</div>}
          {...TEST_IDS.panel.dropdown.apply(link.name)}
        >
          <Button
            variant="secondary"
            className={styles.link}
            size="md"
            icon={link.icon}
            fill="outline"
            {...TEST_IDS.panel.buttonDropdown.apply(link.name)}
          >
            {link.name}
          </Button>
        </Dropdown>
      );
    }

    /**
     * One link available
     */
    if (link.links.length === 1) {
      const currentLink = link.links[0];

      if (currentLink.url) {
        return (
          <LinkButton
            key={currentLink.url}
            className={styles.link}
            icon={currentLink.icon}
            href={currentLink.url}
            title={currentLink.name}
            target={currentLink.target}
            variant="secondary"
            fill="outline"
            {...TEST_IDS.panel.buttonSingleLink.apply(link.name)}
          >
            {currentLink.name}
          </LinkButton>
        );
      }

      return (
        <Button
          variant="secondary"
          className={styles.link}
          key={currentLink.name}
          fill="outline"
          title={currentLink.name}
          icon={currentLink.icon}
          tooltip="Empty URL"
          {...TEST_IDS.panel.buttonEmptySingleLink.apply(link.name)}
        >
          {currentLink.name}
        </Button>
      );
    }

    /**
     * Default empty link
     */
    return (
      <Button
        variant="secondary"
        className={styles.link}
        key={link.name}
        fill="outline"
        title={link.name}
        tooltip="Empty URL"
        {...TEST_IDS.panel.buttonEmptyLink.apply(link.name)}
      >
        {link.name}
      </Button>
    );
  };

  /**
   * Return
   */
  return (
    <div {...testIds.root.apply()}>
      {isToolbarVisible && (
        <div className={styles.header}>
          <ToolbarButtonRow alignment="left" key={currentGroup} className={styles.tabs}>
            {sortedGroups.length > 1 &&
              sortedGroups.map((group, index) => (
                <ToolbarButton
                  key={group.name}
                  variant={currentGroup === group.name ? 'active' : 'default'}
                  onClick={() => {
                    setCurrentGroup(group.name);
                  }}
                  className={styles.tabButton}
                  style={{
                    maxWidth: index === 0 ? width - 60 : undefined,
                  }}
                  {...TEST_IDS.panel.tab.apply(group.name)}
                >
                  {group.name}
                </ToolbarButton>
              ))}
          </ToolbarButtonRow>
        </div>
      )}
      <div>
        {currentLinks.length < 1 && (
          <Alert severity="info" title="Links" {...TEST_IDS.panel.alert.apply()}>
            Please add at least one link to proceed.
          </Alert>
        )}
        {currentLinks.map((link) => {
          return renderLink(link);
        })}
      </div>
    </div>
  );
};
