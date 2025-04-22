import { createSelector } from '@volkovlabs/jest-selectors';

/**
 * Test Identifiers
 */
export const TEST_IDS = {
  panel: {
    root: createSelector('data-testid panel'),
    alert: createSelector('data-testid panel alert'),
    tab: createSelector((name: unknown) => `data-testid panel tab-${name}`),
    tabRow: createSelector('data-testid panel tab-row'),
  },
  linkElement: {
    buttonEmptyLink: createSelector((name: unknown) => `data-testid link-element button empty-link-${name}`),
    buttonEmptySingleLink: createSelector(
      (name: unknown) => `data-testid link-element button empty-single-link-${name}`
    ),
    buttonSingleLink: createSelector((name: unknown) => `data-testid link-element button single-link-${name}`),
    buttonDropdown: createSelector((name: unknown) => `data-testid link-element button dropdown-${name}`),
    dropdown: createSelector((name: unknown) => `data-testid link-element dropdown-${name}`),
    dropdownMenuItem: createSelector((name: unknown) => `data-testid link-element dropdown menu-item-${name}`),
    tooltipMenu: createSelector((name: unknown) => `data-testid link-element tooltip-${name}`),
  },
  linkEditor: {
    fieldLinkType: createSelector('data-testid link-editor field-link-type'),
    fieldIncludeTimeRange: createSelector('data-testid link-editor field-include-time-range'),
    fieldIncludeVariables: createSelector('data-testid link-editor field-include-variables'),
    fieldDashboard: createSelector('data-testid link-editor field-dashboard'),
    fieldDropdown: createSelector('data-testid link-editor field-dropdown'),
    fieldIcon: createSelector('data-testid link-editor field-icon'),
    fieldUrl: createSelector('data-testid link-editor field-url'),
    fieldTarget: createSelector('data-testid link-editor field-target'),
    fieldTargetOption: createSelector((name: unknown) => `link-editor field-target-option-${name}`),
    fieldTags: createSelector('data-testid link-editor field-tags'),
    fieldShowMenu: createSelector('data-testid link-editor field-show-menu'),
  },
  groupsEditor: {
    buttonAddNew: createSelector('data-testid groups-editor button-add-new'),
    buttonRemove: createSelector('data-testid groups-editor button-remove'),
    buttonStartRename: createSelector('data-testid groups-editor button-start-rename'),
    buttonCancelRename: createSelector('data-testid groups-editor button-cancel-rename'),
    buttonSaveRename: createSelector('data-testid groups-editor button-save-rename'),
    noItemsMessage: createSelector('data-testid groups-editor no-items-message'),
    item: createSelector((name: unknown) => `data-testid groups-editor item-${name}`),
    fieldName: createSelector('data-testid groups-editor field-name'),
    itemHeader: createSelector((name: unknown) => `data-testid groups-editor item-header-${name}`),
    itemContent: createSelector((name: unknown) => `data-testid groups-editor item-content-${name}`),
    newItem: createSelector('data-testid groups-editor new-level'),
    newItemName: createSelector('data-testid groups-editor new-item-name'),
  },
  groupEditor: {
    root: createSelector('data-testid group-editor'),
    fieldHighlight: createSelector('data-testid group-editor field-highlight'),
    buttonAddNew: createSelector('data-testid group-editor button-add-new'),
    buttonRemove: createSelector('data-testid group-editor button-remove'),
    buttonToggleVisibility: createSelector('data-testid group-editor button-toggle-visibility'),
    itemHeader: createSelector((name: unknown) => `data-testid group-editor item-${name}`),
    itemContent: createSelector((name: unknown) => `data-testid group-editor item-content-${name}`),
    newItem: createSelector('data-testid group-editor new-item'),
    buttonStartRename: createSelector('data-testid group-editor button-start-rename'),
    buttonCancelRename: createSelector('data-testid group-editor button-cancel-rename'),
    buttonSaveRename: createSelector('data-testid group-editor button-save-rename'),
    fieldName: createSelector('data-testid group-editor field-name'),
    newItemName: createSelector('data-testid group-editor new-item-name'),
  },
};
