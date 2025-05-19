import { IconName } from '@grafana/ui';

import { DropdownConfig, HoverMenuPositionType, LinkConfig } from './panel';

export interface NestedLinkConfig extends LinkConfig {
  /**
   * Current dashboard/link
   *
   * @type {boolean}
   */
  isCurrentLink?: boolean;
}

/**
 * Visual Link Type
 */
export enum VisualLinkType {
  LINK = 'link',
  TIMEPICKER = 'timepicker',
  HTML = 'html',
  MENU = 'menu',
}

export interface VisualLink {
  /**
   * Name
   *
   * @type {string}
   */
  name: string;

  /**
   * Id
   *
   * @type {string}
   */
  id: string;

  /**
   * Visual link type
   *
   * @type {VisualLinkType}
   */
  type: VisualLinkType;

  /**
   * Icon
   *
   * @type {IconName}
   */
  icon?: IconName;

  /**
   * Icon
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
   * links
   *
   * @type {NestedLinkConfig[]}
   */
  links: NestedLinkConfig[];

  /**
   * Time picker range
   *
   */
  timeRange?: {
    /**
     * From range
     *
     * @type {string | number}
     */
    from: string | number;

    /**
     * To range
     *
     * @type {string | number}
     */
    to: string | number;
  };

  /**
   * HTML content
   *
   */
  content?: string;

  /**
   * Dropdown config
   *
   * @type {DropdownConfig}
   */
  dropdownConfig?: DropdownConfig;
}

/**
 * Field Source
 */
export interface FieldSource {
  /**
   * Field Name
   *
   * @type {string}
   */
  name: string;

  /**
   * Data Frame ID or Frame Index if no specified
   */
  source: string | number;
}
