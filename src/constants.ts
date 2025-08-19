import { selectors } from '@grafana/e2e-selectors';
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
  contentElement: {
    root: createSelector((name: unknown) => `data-testid content-element ${name}`),
    alert: createSelector((name: unknown) => `content-element alert ${name}`),
    alertText: createSelector('data-testid content-element alert-text'),
  },
  customCodeEditor: {
    root: createSelector('data-testid custom-code-editor'),
  },
  fieldPicker: {
    root: createSelector('data-testid field-picker'),
  },
  timePickerEditor: {
    fieldTimeRangeType: createSelector('data-testid time-picker-editor field-time-range-type'),
    fieldTimeRangeTypeOption: createSelector(
      (name: unknown) => `time-picker-editor field-time-range-type-option-${name}`
    ),
    fieldFromPicker: createSelector('data-testid time-picker-editor field-from-picker'),
    fieldToPicker: createSelector('data-testid time-picker-editor field-to-picker'),
    fieldFromDateTimePicker: createSelector('data-testid time-picker-editor field-from-date-time-picker'),
    fieldToDateTimePicker: createSelector('data-testid time-picker-editor field-to-date-time-picker'),
    fieldRelativeTimeRange: createSelector('data-testid time-picker-editor field-field-relative-time-range'),
    fieldTimePickerDifference: createSelector('data-testid time-picker-editor field-time-picker-difference'),
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
    customIconImg: createSelector((name: unknown) => `data-testid link-element custom-icon-img-${name}`),
    customIconSvg: createSelector((name: unknown) => `data-testid link-element custom-icon-svg-${name}`),
  },
  timePickerElement: {
    buttonPicker: createSelector((name: unknown) => `data-testid time-picker-element button-picker-${name}`),
  },
  menuElement: {
    root: createSelector('data-testid menu-element'),
    link: createSelector((name: unknown) => `data-testid menu-element link-${name}`),
    defaultButton: createSelector((name: unknown) => `data-testid menu-element default-element-${name}`),
  },
  gridLayout: {
    root: createSelector('data-testid grid-layout'),
    columnItem: createSelector((name: unknown) => `data-testid grid-layout column-item-${name}`),
    linkWrapper: createSelector((name: unknown) => `data-testid grid-layout link-wrapper-${name}`),
    dragHandle: createSelector((name: unknown) => `data-testid grid-layout drag-handle-${name}`),
    mockGridLayout: createSelector('data-testid grid-layout mock-grid-layout'),
    mockFieldInputChangeLayout: createSelector('data-testid grid-layout mock-field-input-change-layout'),
  },
  linksLayout: {
    root: createSelector('data-testid links-layout'),
  },
  linkEditor: {
    root: createSelector((name: unknown) => `data-testid link editor ${name}`),
    fieldLinkType: createSelector('data-testid link-editor field-link-type'),
    fieldIncludeTimeRange: createSelector('data-testid link-editor field-include-time-range'),
    fieldIncludeVariables: createSelector('data-testid link-editor field-include-variables'),
    fieldIncludeKioskMode: createSelector('data-testid link-editor field-include-kiosk-mode'),
    fieldDashboard: createSelector('data-testid link-editor field-dashboard'),
    fieldDropdown: createSelector('data-testid link-editor field-dropdown'),
    fieldHoverPosition: createSelector('data-testid link-editor field-hover-position'),
    fieldIcon: createSelector('data-testid link-editor field-icon'),
    fieldUrl: createSelector('data-testid link-editor field-url'),
    fieldTarget: createSelector('data-testid link-editor field-target'),
    fieldTargetOption: createSelector((name: unknown) => `link-editor field-target-option-${name}`),
    fieldTags: createSelector('data-testid link-editor field-tags'),
    fieldShowMenu: createSelector('data-testid link-editor field-show-menu'),
    fieldDropdownType: createSelector('data-testid link-editor field-dropdown-type'),
    fieldDropdownTypeOption: createSelector((name: unknown) => `link-editor field-dropdown-type-${name}`),
    fieldDropdownAlign: createSelector('data-testid link-editor field-dropdown-align'),
    fieldDropdownAlignOption: createSelector((name: unknown) => `link-editor field-dropdown-align-${name}`),
    fieldDropdownButtonSize: createSelector('data-testid link-editor field-dropdown-button-size'),
    fieldDropdownButtonSizeOption: createSelector((name: unknown) => `link-editor field-dropdown-button-size-${name}`),
    fieldShowCustomIcon: createSelector('data-testid link-editor field-show-custom-icon'),
    fieldCustomIconUrl: createSelector('data-testid link-editor field-custom-icon-url'),
    fieldAlignContent: createSelector('data-testid link-editor field-align-content'),
    fieldAlignContentOption: createSelector((name: unknown) => `link-editor field-align-content-${name}`),
    fieldHideTooltipOnHover: createSelector('data-testid link-editor field-hide-tooltip'),
    fieldContextPrompt: createSelector('data-testid link-editor field-context-prompt'),
    fieldLlmTemperature: createSelector('data-testid link-editor field-llm-temperature'),
    fieldAssistantName: createSelector('data-testid link-editor field-assistant-name'),
    fieldUseDefaultMcp: createSelector('data-testid link-editor field-use-default-mcp'),
    fieldShowSpinner: createSelector('data-testid link-editor field-show-spinner'),
  },
  groupsEditor: {
    root: createSelector((name: unknown) => `data-testid groups-editor root ${name}`),
    buttonAddNew: createSelector('data-testid groups-editor button-add-new'),
    buttonRemove: createSelector('data-testid groups-editor button-remove'),
    buttonStartRename: createSelector('data-testid groups-editor button-start-rename'),
    buttonCancelRename: createSelector('data-testid groups-editor button-cancel-rename'),
    buttonSaveRename: createSelector('data-testid groups-editor button-save-rename'),
    noItemsMessage: createSelector('data-testid groups-editor no-items-message'),
    item: createSelector((name: unknown) => `data-testid groups-editor item-${name}`),
    fieldName: createSelector('data-testid groups-editor field-name'),
    itemHeader: createSelector((name: unknown) => `data-testid groups-editor item-header-${name}`),
    itemTitle: createSelector((name: unknown) => `data-testid groups-editor item-title-${name}`),
    itemContent: createSelector((name: unknown) => `data-testid groups-editor item-content-${name}`),
    newItem: createSelector('data-testid groups-editor new-level'),
    newItemName: createSelector('data-testid groups-editor new-item-name'),
  },
  groupEditor: {
    root: createSelector((name: unknown) => `data-testid group-editor ${name}`),
    fieldHighlightLink: createSelector('data-testid group-editor field-highlight-link'),
    fieldHighlightTimepicker: createSelector('data-testid group-editor field-highlight-timepicker'),
    fieldGridLayout: createSelector('data-testid group-editor field-manual-layout'),
    fieldColumnsInManualLayout: createSelector('data-testid group-editor field-columns-in-manual-layout'),
    fieldRowsInManualLayout: createSelector('data-testid group-editor field-rows-in-manual-layout'),
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
    fieldDynamicFontSize: createSelector('data-testid group-editor field-dynamic-font-size'),
  },
  general: {
    tooltipPosition: createSelector(selectors.components.Tooltip.container),
  },
  drawerElement: {
    chatDrawer: createSelector('data-testid drawer-element chat-drawer'),
    chatDrawerEmptyState: createSelector('data-testid chat-drawer empty-state'),
    drawerCloseButton: createSelector('data-testid chat-drawer close'),
    input: createSelector('data-testid chat-drawer input'),
    message: createSelector((name: unknown) => `data-testid chat-drawer message-${name}`),
    messageAwait: createSelector((name: unknown) => `data-testid chat-drawer message-${name}-await`),
    attachment: createSelector('data-testid chat-drawer attachment'),
    attachmentImage: createSelector((name: unknown) => `data-testid chat-drawer attachment-image-${name}`),
    attachmentImageIcon: createSelector('data-testid chat-drawer attachment-image-icon'),
    attachedFilesPreview: createSelector('data-testid chat-drawer attached-files-preview'),
    attachedFilesPreviewIcon: createSelector('data-testid chat-drawer attached-files-preview-icon'),
    attachButton: createSelector('data-testid-file-upload-input-field'),
    removeButton: createSelector('data-testid chat-drawer remove-button'),
    sendButton: createSelector('data-testid chat-drawer send-button'),
    messageSender: createSelector((name: unknown) => `data-testid chat-drawer message-sender-${name}`),
    inputPanel: createSelector('data-testid chat-drawer input-panel'),
    fileDropzoneOverlay: createSelector('data-testid chat-drawer file-dropzone-overlay'),
    fileDropzone: createSelector('data-testid chat-drawer file-dropzone'),
    mcpToolsInfo: createSelector('data-testid chat-drawer mcp-tools-info'),
  },
  mcpServersEditor: {
    root: createSelector('data-testid mcp-servers-editor'),
    newItem: createSelector('data-testid new-mcp-server'),
    newItemName: createSelector('data-testid new-mcp-server-name'),
    newItemUrl: createSelector('data-testid new-mcp-server-url'),
    buttonAddNew: createSelector('data-testid add-mcp-server'),
    itemHeader: createSelector((name: unknown) => `data-testid mcp-server-header-${name}`),
    itemContent: createSelector((name: unknown) => `data-testid mcp-server-content-${name}`),
    fieldName: createSelector('data-testid mcp-server-name-field'),
    fieldUrl: createSelector('data-testid mcp-server-url-field'),
    fieldEnabled: createSelector('data-testid mcp-server-enabled-field'),
    buttonStartRename: createSelector('data-testid start-rename-mcp-server'),
    buttonCancelRename: createSelector('data-testid cancel-rename-mcp-server'),
    buttonSaveRename: createSelector('data-testid save-rename-mcp-server'),
    buttonRemove: createSelector('data-testid remove-mcp-server'),
    buttonEdit: createSelector('data-testid edit-mcp-server'),
    buttonToggleEnabled: createSelector('data-testid toggle-mcp-server-enabled'),
  },
};

/**
 * Sticky Position
 */
export const STICKY_OPTIONS = [
  { value: true, label: 'Enabled', description: 'Follow when scrolling.' },
  { value: false, label: 'Disabled', description: 'Scroll with dashboard.' },
];

/**
 * Default MCP Client Config
 */
export const DEFAULT_MCP_CLIENT_CONFIG = {
  name: 'volkovlabs-links-panel',
  version: '2.1.0',
};

/**
 * Default Grid Column Size
 */
export const GRID_COLUMN_SIZE = 10;

/**
 * Default Grid Row Size
 */
export const GRID_ROW_SIZE = 16;

/**
 * Panel Title height
 */
export const PANEL_TITLE_HEIGHT = 38;

/**
 * Default Grid margin gap
 */
export const GRID_MARGIN_GAP = 5;
