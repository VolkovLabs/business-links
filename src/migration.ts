import { PanelModel } from '@grafana/data';

import { PanelOptions } from './types';

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
   * Normalize toolbar download formats if undefined
   */
  if (options.groupsSorting === undefined) {
    options.groupsSorting = false;
  }

  return options as PanelOptions;
};
