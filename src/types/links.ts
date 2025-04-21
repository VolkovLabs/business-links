import { IconName } from '@grafana/ui';

import { LinkConfig } from './panel';

export interface VisualLink {
  /**
   * Name
   *
   * @type {string}
   */
  name: string;

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
   * links
   *
   * @type {LinkConfig[]}
   */
  links: LinkConfig[];
}
