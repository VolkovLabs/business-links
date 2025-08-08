import { GroupConfig, LinkConfig, PanelOptions, TimeConfig } from './panel';

/**
 * Outdated TimeConfig
 */
export interface OutdatedTimeConfig extends Omit<TimeConfig, 'customTimeRange'> {
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
 * Outdated LinkConfig
 */
export interface OutdatedLinkConfig extends Omit<LinkConfig, 'timePickerConfig'> {
  /**
   * Time picker config
   *
   * Modified in 2.2.0
   */
  timePickerConfig?: OutdatedTimeConfig;
}

/**
 * Outdated GroupConfig
 */
export interface OutdatedGroupConfig extends Omit<GroupConfig, 'items'> {
  /**
   * Items
   * Modified in 2.2.0
   *
   * @type {OutdatedLinkConfig[]}
   */
  items: OutdatedLinkConfig[];
}

/**
 * Outdated Panel Options
 */
export interface OutdatedPanelOptions extends Omit<PanelOptions, 'groupsSorting' | 'groups' | 'dropdowns'> {
  /**
   * Groups Sorting
   *
   * Introduced in 1.1.0
   */
  groupsSorting?: boolean;

  /**
   * Groups
   *
   * Modified in 2.2.0
   *
   * @type {OutdatedGroupConfig[]}
   */
  groups: OutdatedGroupConfig[];

  /**
   * Dropdowns
   *
   * Modified in 2.2.0
   *
   * @type {OutdatedGroupConfig[]}
   */
  dropdowns: OutdatedGroupConfig[];
}
