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
  HTML = 'html',
  LLMAPP = 'llmapp',
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
 * Align Content Position Type
 */
export enum AlignContentPositionType {
  CENTER = 'center',
  LEFT = 'left',
  RIGHT = 'right',
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
 * Dropdown type
 */
export enum DropdownType {
  DROPDOWN = 'dropdown',
  ROW = 'row',
}

/**
 * Dropdown align
 */
export enum DropdownAlign {
  LEFT = 'left',
  RIGHT = 'right',
}

/**
 * Button size
 */
export enum ButtonSize {
  SM = 'sm',
  MD = 'md',
  LG = 'lg',
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
 * HTML Config
 *
 */
export interface HtmlConfig {
  /**
   * Content manual
   *
   * @type {string}
   */
  content?: string;
}

/**
 * Dropdown Config
 *
 */
export interface DropdownConfig {
  /**
   * Type
   *
   * @type {DropdownType}
   */
  type?: DropdownType;

  /**
   * Type
   *
   * @type {DropdownAlign}
   */
  align?: DropdownAlign;

  /**
   * Button size
   *
   * @type {ButtonSize}
   */
  buttonSize?: ButtonSize;
}

/**
 * MCP Server Configuration
 */
export interface McpServerConfig {
  /**
   * Server name
   *
   * @type {string}
   */
  name: string;

  /**
   * Server URL
   *
   * @type {string}
   */
  url: string;

  /**
   * Whether the server is enabled
   *
   * @type {boolean}
   */
  enabled: boolean;
}

/**
 * Link Config
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

  /**
   * Time picker config
   *
   * @type {HtmlConfig}
   */
  htmlConfig?: HtmlConfig;

  /**
   * Dropdown config
   *
   * @type {DropdownConfig}
   */
  dropdownConfig?: DropdownConfig;

  /**
   * Include kiosk mode
   *
   * @type {boolean}
   */
  includeKioskMode: boolean;

  /**
   * Use custom images
   *
   * @type {boolean}
   */
  showCustomIcons?: boolean;

  /**
   * Custom image url
   *
   * @type {string}
   */
  customIconUrl?: string;

  /**
   * Align content position
   *
   * @type {AlignContentPositionType}
   */
  alignContentPosition?: AlignContentPositionType;

  /**
   * Hide tooltip on hover
   *
   * @type {boolean}
   */
  hideTooltipOnHover?: boolean;

  /**
   * Context prompt for Business AI
   *
   * @type {string}
   */
  contextPrompt?: string;

  /**
   * Temperature for LLM (0-1)
   * 0 is most deterministic, 1 is most creative
   *
   * @type {number}
   */
  llmTemperature?: number;

  /**
   * Custom Assistant Name for Business AI
   *
   * @type {string}
   */
  assistantName?: string;

  /**
   * Use default Grafana MCP server
   *
   * @type {boolean}
   */
  useDefaultGrafanaMcp?: boolean;

  /**
   * MCP Servers configuration for Business AI
   *
   * @type {McpServerConfig[]}
   */
  mcpServers?: McpServerConfig[];
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
   * Highlight the current timepicker
   *
   * @type {boolean}
   */
  highlightCurrentTimepicker?: boolean;

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
   * @type {number}
   */
  gridColumns?: number;

  /**
   * Grid minimum row height
   *
   * @type {number}
   */
  gridRowHeight?: number;

  /**
   * Items
   *
   * @type {LinkConfig[]}
   */
  items: LinkConfig[];

  /**
   * Dynamic font size
   *
   * @type {boolean}
   */
  dynamicFontSize?: boolean;
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

  /**
   * Use Sticky position
   *
   * @type {boolean}
   */
  sticky: boolean;

  /**
   * Padding in pixels
   *
   * @type {number}
   */
  customPadding: number;
}
