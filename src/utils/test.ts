import { v4 as uuidv4 } from 'uuid';

import {
  AlignContentPositionType,
  ButtonSize,
  DropdownAlign,
  DropdownConfig,
  DropdownType,
  GroupConfig,
  LinkConfig,
  LinkTarget,
  LinkType,
  PanelOptions,
  TimeConfig,
  TimeConfigType,
} from '@/types';
import { NestedLinkConfig, VisualLink, VisualLinkType } from '@/types/links';

/**
 * Create Dropdown Config
 */
export const createDropdownConfig = (item: Partial<DropdownConfig> = {}): DropdownConfig => ({
  type: DropdownType.DROPDOWN,
  align: DropdownAlign.LEFT,
  buttonSize: ButtonSize.MD,
  ...item,
});

/**
 * Create Link
 */
export const createLinkConfig = (item: Partial<LinkConfig> = {}): LinkConfig => ({
  linkType: LinkType.SINGLE,
  name: 'Link',
  enable: true,
  url: '',
  includeTimeRange: false,
  includeVariables: false,
  dashboardUrl: '',
  target: LinkTarget.SELF_TAB,
  showMenuOnHover: false,
  id: uuidv4(),
  timePickerConfig: {
    type: TimeConfigType.FIELD,
  },
  dropdownConfig: createDropdownConfig(),
  includeKioskMode: false,
  showCustomIcons: false,
  customIconUrl: '',
  alignContentPosition: AlignContentPositionType.LEFT,
  hideTooltipOnHover: false,
  ...item,
});

/**
 * Create Panel Options
 */
export const createGroupConfig = (options: Partial<GroupConfig> = {}): GroupConfig => ({
  name: 'Group',
  items: [],
  highlightCurrentLink: false,
  highlightCurrentTimepicker: false,
  ...options,
});

/**
 * Create Panel Options
 */
export const createPanelOptions = (options: Partial<PanelOptions> = {}): PanelOptions => ({
  groups: [],
  dropdowns: [],
  groupsSorting: false,
  sticky: false,
  customPadding: 0,
  ...options,
});

/**
 * Create Link
 */
export const createVisualLinkConfig = (item: Partial<VisualLink> = {}): VisualLink => ({
  name: 'Link1',
  showMenuOnHover: false,
  type: VisualLinkType.LINK,
  links: [],
  id: uuidv4(),
  ...item,
});

/**
 * Create Link
 */
export const createNestedLinkConfig = (item: Partial<NestedLinkConfig> = {}): NestedLinkConfig => ({
  linkType: LinkType.SINGLE,
  name: 'Link',
  enable: true,
  url: '',
  includeTimeRange: false,
  includeVariables: false,
  dashboardUrl: '',
  target: LinkTarget.SELF_TAB,
  showMenuOnHover: false,
  id: uuidv4(),
  dropdownConfig: createDropdownConfig(),
  includeKioskMode: false,
  ...item,
});

/**
 * Create Time Config
 */
export const createTimeConfig = (item: Partial<TimeConfig> = {}): TimeConfig => ({
  type: TimeConfigType.RELATIVE,
  ...item,
});
