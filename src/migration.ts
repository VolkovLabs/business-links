import { PanelModel } from '@grafana/data';
import { v4 as uuidv4 } from 'uuid';

import { GRID_COLUMN_SIZE, GRID_ROW_SIZE } from './constants';
import { GroupConfig, OutdatedPanelOptions, PanelOptions } from './types';
import { createDropdownConfig, migrateTimePickerConfiguration } from './utils';

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

        const normalizedTimePickerConfig = migrateTimePickerConfiguration(item.timePickerConfig);
        const normalizedDropdownConfig =
          !item.dropdownConfig || item.dropdownConfig === undefined ? createDropdownConfig() : item.dropdownConfig;

        const normalizedIncludeKioskMode =
          !item.includeKioskMode || item.includeKioskMode === undefined ? false : item.includeKioskMode;

        const normalizedShowCustomIcons =
          !item.showCustomIcons || item.showCustomIcons === undefined ? false : item.showCustomIcons;

        const normalizedCustomIconUrl =
          !item.customIconUrl || item.customIconUrl === undefined ? '' : item.customIconUrl;

        const normalizedAlignContentPosition =
          !item.alignContentPosition || item.alignContentPosition === undefined ? 'left' : item.alignContentPosition;

        const normalizedHideTitleOnHover =
          !item.hideTooltipOnHover || item.hideTooltipOnHover === undefined ? false : item.hideTooltipOnHover;

        const normalizedUseDefaultGrafanaMcp =
          !item.useDefaultGrafanaMcp || item.useDefaultGrafanaMcp === undefined ? false : item.useDefaultGrafanaMcp;

        return {
          ...item,
          id: normalizedId,
          dropdownConfig: normalizedDropdownConfig,
          timePickerConfig: normalizedTimePickerConfig,
          includeKioskMode: normalizedIncludeKioskMode,
          showCustomIcons: normalizedShowCustomIcons,
          customIconUrl: normalizedCustomIconUrl,
          alignContentPosition: normalizedAlignContentPosition,
          hideTooltipOnHover: normalizedHideTitleOnHover,
          useDefaultGrafanaMcp: normalizedUseDefaultGrafanaMcp,
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
        normalizedGroup.gridColumns = GRID_COLUMN_SIZE;
      }

      /**
       * Normalize gridRows
       */
      if (normalizedGroup.gridRowHeight === undefined) {
        normalizedGroup.gridRowHeight = GRID_ROW_SIZE;
      }

      /**
       * Normalize dynamicFontSize
       */
      if (normalizedGroup.dynamicFontSize === undefined) {
        normalizedGroup.dynamicFontSize = false;
      }

      return normalizedGroup;
    });
  }

  /**
   * Normalize drop downs
   */
  if (options.dropdowns && options.dropdowns.length > 0) {
    const items = options.dropdowns;

    options.dropdowns = items.map((dropdown) => {
      /**
       * Normalize links items
       */
      const normalizedItems = dropdown.items.map((item) => {
        const normalizedId = !item.id || item.id === undefined ? uuidv4() : item.id;

        const normalizedTimePickerConfig = migrateTimePickerConfiguration(item.timePickerConfig);

        const normalizedIncludeKioskMode =
          !item.includeKioskMode || item.includeKioskMode === undefined ? false : item.includeKioskMode;

        const normalizedShowCustomIcons =
          !item.showCustomIcons || item.showCustomIcons === undefined ? false : item.showCustomIcons;

        const normalizedCustomIconUrl =
          !item.customIconUrl || item.customIconUrl === undefined ? '' : item.customIconUrl;

        const normalizedAlignContentPosition =
          !item.alignContentPosition || item.alignContentPosition === undefined ? 'left' : item.alignContentPosition;

        const normalizedHideTitleOnHover =
          !item.hideTooltipOnHover || item.hideTooltipOnHover === undefined ? false : item.hideTooltipOnHover;

        const normalizedUseDefaultGrafanaMcp =
          !item.useDefaultGrafanaMcp || item.useDefaultGrafanaMcp === undefined ? false : item.useDefaultGrafanaMcp;

        return {
          ...item,
          id: normalizedId,
          timePickerConfig: normalizedTimePickerConfig,
          includeKioskMode: normalizedIncludeKioskMode,
          showCustomIcons: normalizedShowCustomIcons,
          customIconUrl: normalizedCustomIconUrl,
          alignContentPosition: normalizedAlignContentPosition,
          hideTooltipOnHover: normalizedHideTitleOnHover,
          useDefaultGrafanaMcp: normalizedUseDefaultGrafanaMcp,
        };
      });

      /**
       * Normalize Dropdown defined
       */
      const normalizedDropdown = {
        ...dropdown,
        items: normalizedItems,
      } as GroupConfig;

      return normalizedDropdown;
    });
  }

  /**
   * Normalize toolbar download formats if undefined
   */
  if (options.groupsSorting === undefined) {
    options.groupsSorting = false;
  }

  /**
   * Normalize padding value if undefined
   */
  if (options.customPadding === undefined) {
    options.customPadding = 0;
  }

  return options as PanelOptions;
};
