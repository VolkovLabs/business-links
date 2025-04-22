import { PanelModel } from '@grafana/data';

import { GroupConfig, PanelOptions } from './types';

/**
 * Outdated Panel Options
 */
interface OutdatedPanelOptions extends Omit<PanelOptions, 'groupsSorting'> {
  /**
   * Groups Sorting
   *
   * Introduced in 1.1.0
   */
  groupsSorting?: boolean;
}

/**
 * Get Migrated Options
 * @param panel
 */
export const getMigratedOptions = async (panel: PanelModel<OutdatedPanelOptions>): Promise<PanelOptions> => {
  const { ...options } = panel.options;

  /**
   * Normalize groups
   */
  if (options.groups && options.groups.length > 0) {
    const items = options.groups;
    options.groups = items.map((group) => {
      const normalizedGroup = {
        ...group,
      } as GroupConfig;

      if (normalizedGroup.highlightCurrentLink === undefined) {
        normalizedGroup.highlightCurrentLink = false;
      }

      return normalizedGroup;
    });
  }

  return options as PanelOptions;
};
