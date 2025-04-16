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
   * links
   *
   * @type {LinkConfig[]}
   */
  links: LinkConfig[];
}
