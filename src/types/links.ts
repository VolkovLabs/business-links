import { IconName } from '@grafana/ui';

import { HoverMenuPositionType, LinkConfig } from './panel';

export interface NestedLinkConfig extends LinkConfig {
  /**
   * Current dashboard/link
   *
   * @type {boolean}
   */
  isCurrentLink?: boolean;
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
}
