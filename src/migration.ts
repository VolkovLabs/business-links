import { PanelModel } from '@grafana/data';
import { v4 as uuidv4 } from 'uuid';

import { GroupConfig, PanelOptions, TimeConfigType } from './types';
import { createDropdownConfig } from './utils';

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
      /**
       * Normalize links items
       */
      const normalizedItems = group.items.map((item) => {
        const normalizedId = !item.id || item.id === undefined ? uuidv4() : item.id;

        const normalizedTimeConfigType =
          !item.timePickerConfig?.type || item.timePickerConfig?.type === undefined
            ? TimeConfigType.FIELD
            : item.timePickerConfig.type;

        const normalizedDropdownConfig =
          !item.dropdownConfig || item.dropdownConfig === undefined ? createDropdownConfig() : item.dropdownConfig;

        const normalizedIncludeKioskMode =
          !item.includeKioskMode || item.includeKioskMode === undefined ? false : item.includeKioskMode;

        return {
          ...item,
          id: normalizedId,
          dropdownConfig: normalizedDropdownConfig,
          timePickerConfig: {
            ...item.timePickerConfig,
            type: normalizedTimeConfigType,
          },
          includeKioskMode: normalizedIncludeKioskMode,
        };
      });

      /**
       * Normalize Group defined
       */
      const normalizedGroup = {
        ...group,
        items: normalizedItems,
      } as GroupConfig;

      /**
       * Normalize highlight link
       */
      if (normalizedGroup.highlightCurrentLink === undefined) {
        normalizedGroup.highlightCurrentLink = false;
      }

      /**
       * Normalize highlight timepicker
       */
      if (normalizedGroup.highlightCurrentTimepicker === undefined) {
        normalizedGroup.highlightCurrentTimepicker = false;
      }

      /**
       * Normalize gridLayout
       */
      if (normalizedGroup.gridLayout === undefined) {
        normalizedGroup.gridLayout = false;
      }

      /**
       * Normalize manualGridLayout
       */
      if (normalizedGroup.manualGridLayout === undefined) {
        normalizedGroup.manualGridLayout = [];
      }

      /**
       * Normalize gridColumns
       */
      if (normalizedGroup.gridColumns === undefined) {
        normalizedGroup.gridColumns = 10;
      }

      return normalizedGroup;
    });
  }

  /**
   * Normalize toolbar download formats if undefined
   */
  if (options.groupsSorting === undefined) {
    options.groupsSorting = false;
  }

  return options as PanelOptions;
};
