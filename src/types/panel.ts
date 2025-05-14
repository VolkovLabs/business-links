import { IconName } from '@grafana/ui';
// eslint-disable-next-line @typescript-eslint/naming-convention
import ReactGridLayout from 'react-grid-layout';

import { LinkTarget } from './editor';
import { FieldSource } from './links';

/**
 * Recursive Partial
 */
export type RecursivePartial<T> = {
  [P in keyof T]?: T[P] extends Array<infer U>
    ? Array<RecursivePartial<U>>
    : T[P] extends object | undefined
      ? RecursivePartial<T[P]>
      : T[P];
};

/**
 * Link type
 */
export enum LinkType {
  SINGLE = 'single',
  DROPDOWN = 'dropdown',
  TAGS = 'tags',
  DASHBOARD = 'dashboard',
  TIMEPICKER = 'timepicker',
}

/**
 * Hover Menu Position Type
 */
export enum HoverMenuPositionType {
  BOTTOM = 'bottom',
  TOP = 'top',
  RIGHT = 'right',
  LEFT = 'left',
}

/**
 * Time config type
 */
export enum TimeConfigType {
  FIELD = 'field',
  MANUAL = 'manual',
  RELATIVE = 'relative',
}

/**
 * Time Config
 *
 */
export interface TimeConfig {
  /**
   * Type
   *
   * @type {TimeConfigType}
   */
  type?: TimeConfigType;

  /**
   * Field from
   *
   * @type {FieldSource}
   */
  fieldFrom?: FieldSource;

  /**
   * Field to
   *
   * @type {FieldSource}
   */
  fieldTo?: FieldSource;

  /**
   * Manual time range config
   */
  manualTimeRange?: {
    /**
     * From
     *
     * @type {number}
     */
    from?: number;

    /**
     * To
     *
     * @type {number}
     */
    to?: number;
  };

  /**
   * Relative Time Range
   *
   */
  relativeTimeRange?: {
    /**
     * From
     *
     * @type {number}
     */
    from: number;

    /**
     * To
     *
     * @type {number}
     */
    to: number;
  };
}
/**
 * Base Link Config
 */
export interface LinkConfig {
  /**
   * Link type
   *
   * @type {LinkType}
   */
  linkType: LinkType;

  /**
   * Name
   *
   * @type {string}
   */
  name: string;

  /**
   * Enabled
   *
   * @type {boolean}
   */
  enable: boolean;

  /**
   * Icon
   *
   * @type {IconName}
   */
  icon?: IconName;

  /**
   * URL
   *
   * @type {IconName}
   */
  url?: string;

  /**
   * Include current time range
   *
   * @type {boolean}
   */
  includeTimeRange: boolean;

  /**
   * Include Variables values
   *
   * @type {boolean}
   */
  includeVariables: boolean;

  /**
   * Open in new tab or current
   *
   * @type {LinkTarget}
   */
  target: LinkTarget;

  /**
   * Tags
   *
   * @type {string[]}
   */
  tags?: string[];

  /**
   * Dashboard url link
   *
   * @type {string}
   */
  dashboardUrl: string;

  /**
   * Icon
   *
   * @type {string}
   */
  dropdownName?: string;

  /**
   * Show menu (tags,dropdown) on hover
   *
   * @type {boolean}
   */
  showMenuOnHover?: boolean;

  /**
   * Hover menu position
   *
   * @type {HoverMenuPositionType}
   */
  hoverMenuPosition?: HoverMenuPositionType;

  /**
   * Unique Link id
   *
   * @type {string}
   */
  id: string;

  /**
   * Time picker config
   *
   * @type {TimeConfig}
   */
  timePickerConfig?: TimeConfig;
}

/**
 * Group Config
 */
export interface GroupConfig {
  /**
   * Name
   *
   * @type {string}
   */
  name: string;

  /**
   * Highlight the current dashboard/link
   *
   * @type {boolean}
   */
  highlightCurrentLink?: boolean;

  /**
   * Manual layout (grid)
   *
   * @type {boolean}
   */
  gridLayout?: boolean;

  /**
   * Manual grid Layout
   *
   * @type {ReactGridLayout.Layout[]}
   */
  manualGridLayout?: ReactGridLayout.Layout[];

  /**
   * Grid columns
   *
   * @type {[]}
   */
  gridColumns?: number;

  /**
   * Items
   *
   * @type {LinkConfig[]}
   */
  items: LinkConfig[];
}

/**
 * Options
 */
export interface PanelOptions {
  /**
   * Tabs Sorting
   *
   * @type {boolean}
   */
  groupsSorting: boolean;

  /**
   * Groups
   *
   * @type {GroupConfig[]}
   */
  groups: GroupConfig[];

  /**
   * Dropdowns
   *
   * @type {GroupConfig[]}
   */
  dropdowns: GroupConfig[];
}
