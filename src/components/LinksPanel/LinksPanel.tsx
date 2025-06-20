import { css, cx } from '@emotion/css';
import { PanelProps } from '@grafana/data';
import { Alert, ToolbarButton, ToolbarButtonRow, useStyles2 } from '@grafana/ui';
import React, { useEffect, useMemo, useRef, useState } from 'react';

import { TEST_IDS } from '@/constants';
import { useContentPosition, useGrafanaLocationService, useSavedState } from '@/hooks';
import { DashboardMeta, PanelOptions } from '@/types';
import { getAllDashboards, prepareLinksToRender } from '@/utils';

import { LinksGridLayout, LinksLayout } from './components';
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
export const LinksPanel: React.FC<Props> = ({
  id,
  width,
  options,
  replaceVariables,
  timeRange,
  height,
  title,
  data,
  onOptionsChange,
}) => {
  /**
   * Styles
   */
  const styles = useStyles2(getStyles);

  /**
   * Ref`s
   */
  const toolbarRowRef = useRef<HTMLDivElement>(null);

  /**
   * Location service via hook with subscription
   */
  const location = useGrafanaLocationService();

  /**
   * currentDashboardId
   */
  const currentDashboardId = useMemo(() => replaceVariables('${__dashboard.uid}'), [replaceVariables]);

  /**
   * State
   */
  const [dashboards, setDashboards] = useState<DashboardMeta[]>([]);

  /**
   * Current group
   */
  const [currentGroup, setCurrentGroup] = useSavedState<string>({
    key: `volkovlabs.links.panel.${id}.${currentDashboardId}`,
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
   * Links for render
   */
  const currentLinks = useMemo(() => {
    return prepareLinksToRender({
      currentGroup: activeGroup,
      dropdowns: options.dropdowns,
      replaceVariables,
      timeRange,
      dashboards,
      params: location.search,
      dashboardId: currentDashboardId,
      highlightCurrentLink: activeGroup?.highlightCurrentLink,
      highlightCurrentTimepicker: activeGroup?.highlightCurrentTimepicker,
      series: data.series,
    });
  }, [
    activeGroup,
    dashboards,
    currentDashboardId,
    data.series,
    options.dropdowns,
    replaceVariables,
    timeRange,
    location,
  ]);

  /**
   * Show selected group first
   */
  const sortedGroups = useMemo(() => {
    const activeGroup = options.groups.find((group) => group.name === currentGroup);

    /**
     * Selected group is not found
     * Or tabsSorting disabled
     */
    if (!activeGroup || !options.groupsSorting) {
      return options.groups;
    }

    const withoutActive = options.groups.filter((group) => group.name !== currentGroup);

    return [activeGroup, ...withoutActive];
  }, [currentGroup, options.groups, options.groupsSorting]);

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

  /**
   * Sticky position
   */
  useContentPosition({
    panelId: id,
    sticky: options.sticky,
  });

  /**
   * Return
   */
  return (
    <div
      {...testIds.root.apply()}
      className={cx(css`
        padding: ${options.customPadding}px;
      `)}
    >
      {isToolbarVisible && (
        <div className={styles.header} ref={toolbarRowRef}>
          <ToolbarButtonRow
            alignment="left"
            key={currentGroup}
            className={styles.tabs}
            {...TEST_IDS.panel.tabRow.apply()}
          >
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
                  {...testIds.tab.apply(group.name)}
                >
                  {group.name}
                </ToolbarButton>
              ))}
          </ToolbarButtonRow>
        </div>
      )}
      <div>
        {currentLinks.length < 1 && (
          <Alert severity="info" title="Links" {...testIds.alert.apply()}>
            Please add at least one link to proceed.
          </Alert>
        )}
        <LinksLayout
          activeGroup={activeGroup}
          currentLinks={currentLinks}
          panelData={data.series}
          replaceVariables={replaceVariables}
        />
        {activeGroup?.gridLayout && (
          <LinksGridLayout
            panelTitle={title}
            options={options}
            links={currentLinks}
            width={width}
            height={height}
            activeGroup={activeGroup}
            onOptionsChange={onOptionsChange}
            toolbarRowRef={toolbarRowRef}
            data={data.series}
            replaceVariables={replaceVariables}
          />
        )}
      </div>
    </div>
  );
};
