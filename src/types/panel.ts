import { IconName } from '@grafana/ui';

import { LinkTarget } from './editor';

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
 * Link config type
 */
export enum LinkConfigType {
  LINK = 'link',
  HTML_CONTENT = 'html_content',
}

/**
 * Link type
 */
export enum LinkType {
  SINGLE = 'single',
  DROPDOWN = 'dropdown',
  TAGS = 'tags',
  DASHBOARD = 'dashboard',
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
 * Base Link Config
 */
export interface LinkConfig {
  /**
   * Type
   *
   * @type {LinkConfigType}
   */
  type: LinkConfigType;

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
