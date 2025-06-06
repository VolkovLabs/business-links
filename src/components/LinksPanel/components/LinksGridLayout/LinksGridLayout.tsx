import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

import { cx } from '@emotion/css';
import { DataFrame, InterpolateFunction } from '@grafana/data';
import { locationService } from '@grafana/runtime';
import { Icon, useStyles2 } from '@grafana/ui';
import React, { RefObject, useMemo, useRef } from 'react';
import ReactGridLayout from 'react-grid-layout';

import { TEST_IDS } from '@/constants';
import { GroupConfig, PanelOptions, VisualLink, VisualLinkType } from '@/types';

import { ContentElement } from '../ContentElement';
import { LinkElement } from '../LinkElement';
import { MenuElement } from '../MenuElement';
import { TimePickerElement } from '../TimePickerElement';
import { getStyles } from './LinksGridLayout.styles';

/**
 * Test Ids
 */
const testIds = TEST_IDS.gridLayout;

/**
 * Properties
 */
interface Props {
  /**
   * Current Links
   *
   * @type {VisualLink[]}
   */
  links: VisualLink[];

  /**
   *  Panel width
   *
   * @type {number}
   */
  width: number;

  /**
   *  Panel height
   *
   * @type {number}
   */
  height: number;

  /**
   * Options
   *
   * @type {PanelOptions}
   */
  options: PanelOptions;

  /**
   * Current active group
   *
   * @type {GroupConfig | undefined}
   */
  activeGroup: GroupConfig | undefined;

  /**
   * Options change handler
   *
   */
  onOptionsChange: (options: PanelOptions) => void;

  /**
   * Toolbar active ref
   *
   * @type {RefObject<HTMLDivElement | null>}
   */
  toolbarRowRef: RefObject<HTMLDivElement | null>;

  /**
   * Current panel title
   *
   * @type {string}
   */
  panelTitle: string;

  /**
   * Data
   *
   * @type {DataFrame[]}
   */
  data: DataFrame[];

  /**
   * Replace Variables
   *
   * @type {InterpolateFunction}
   */
  replaceVariables: InterpolateFunction;
}

/**
 * Links Grid Layout
 */
export const LinksGridLayout: React.FC<Props> = ({
  width,
  options,
  links,
  activeGroup,
  toolbarRowRef,
  height,
  panelTitle,
  onOptionsChange,
  data,
  replaceVariables,
}) => {
  /**
   * Styles
   */
  const styles = useStyles2(getStyles);

  /**
   * location service
   */
  const location = locationService.getLocation();

  /**
   * Edit mode
   */
  const urlParams = new URLSearchParams(location.search);
  const isEditMode = urlParams.has('editPanel');

  /**
   * Ref`s
   */
  const gridWrapRef = useRef<HTMLDivElement>(null);

  /**
   * Current max height for grid layout
   * based on panel, panel title, toolbar heights
   */
  const currentMaxHeight = useMemo(() => {
    /**
     * Panel title height
     */
    const titleHeight = panelTitle ? 38 : 0;

    /**
     * Toolbar height
     */
    const toolbarHeight = toolbarRowRef && toolbarRowRef.current ? toolbarRowRef.current.offsetHeight : 0;

    return height - titleHeight - toolbarHeight;
  }, [height, panelTitle, toolbarRowRef]);

  /**
   * Column Size
   */
  const currentColumnsSize = useMemo(() => {
    return activeGroup?.gridColumns ?? 10;
  }, [activeGroup?.gridColumns]);

  /**
   * Dynamic Font Size
   */
  const currentDynamicFontSize = useMemo(() => {
    return activeGroup?.dynamicFontSize ?? false;
  }, [activeGroup?.dynamicFontSize]);

  /**
   * Configured layout
   */
  const linksLayout = useMemo(() => {
    /**
     * Return saved Layout
     */
    if (activeGroup?.manualGridLayout && !!activeGroup?.manualGridLayout.length) {
      return activeGroup.manualGridLayout;
    }

    /**
     * Calculate default layout based on number of columns
     */
    return links.map((currentLink, index) => {
      /**
       * Column size (from 0 to currentColumnsSize - 1)
       */
      const column = index % currentColumnsSize;

      /**
       * Row index
       */
      const row = Math.floor(index / currentColumnsSize);

      return {
        i: currentLink.id,
        x: column,
        y: row,
        w: 1,
        h: 2,
      };
    });
  }, [currentColumnsSize, activeGroup?.manualGridLayout, links]);

  /**
   * Return
   */
  return (
    <div
      {...testIds.root.apply()}
      style={{ height: currentMaxHeight }}
      className={styles.gridLayoutWrapper}
      ref={gridWrapRef}
    >
      <ReactGridLayout
        key={currentColumnsSize}
        layout={linksLayout}
        cols={currentColumnsSize}
        rowHeight={16}
        margin={[5, 5]}
        width={width}
        autoSize={true}
        compactType="vertical"
        isDraggable={isEditMode}
        isResizable={isEditMode}
        draggableHandle=".react-grid-dragHandleExample"
        onLayoutChange={(layout) => {
          const updateGroups = options.groups.map((optionGroup) => {
            if (optionGroup.name === activeGroup?.name) {
              return {
                ...optionGroup,
                manualGridLayout: layout,
              };
            }

            return optionGroup;
          });
          onOptionsChange({
            ...options,
            groups: updateGroups,
          });
        }}
      >
        {links.map((link) => {
          return (
            <div
              key={link.id}
              className={cx(styles.columnItem, isEditMode && styles.columnItemBorder)}
              {...testIds.columnItem.apply(link.name)}
            >
              <div className={styles.linkWrapper} {...testIds.linkWrapper.apply(link.name)}>
                {link.type === VisualLinkType.HTML && (
                  <ContentElement link={link} panelData={data} gridMode={true} replaceVariables={replaceVariables} />
                )}
                {link.type === VisualLinkType.LINK && (
                  <LinkElement link={link} gridMode={true} dynamicFontSize={currentDynamicFontSize} />
                )}
                {link.type === VisualLinkType.TIMEPICKER && (
                  <TimePickerElement link={link} gridMode={true} dynamicFontSize={currentDynamicFontSize} />
                )}
                {link.type === VisualLinkType.MENU && (
                  <MenuElement link={link} gridMode={true} dynamicFontSize={currentDynamicFontSize} />
                )}
              </div>
              {isEditMode && (
                <span
                  className={cx('react-grid-dragHandleExample', styles.dragIcon)}
                  {...testIds.dragHandle.apply(link.name)}
                >
                  <Icon title="Move item" size="sm" name="expand-arrows-alt" />
                </span>
              )}
            </div>
          );
        })}
      </ReactGridLayout>
    </div>
  );
};
