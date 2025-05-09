import { v4 as uuidv4 } from 'uuid';

import { GroupConfig, LinkConfig, LinkConfigType, LinkTarget, LinkType, PanelOptions } from '@/types';
import { NestedLinkConfig, VisualLink } from '@/types/links';

/**
 * Create Link
 */
export const createLinkConfig = (item: Partial<LinkConfig> = {}): LinkConfig => ({
  type: LinkConfigType.LINK,
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
  ...item,
});

/**
 * Create Panel Options
 */
export const createGroupConfig = (options: Partial<GroupConfig> = {}): GroupConfig => ({
  name: 'Group',
  items: [],
  highlightCurrentLink: false,
  ...options,
});

/**
 * Create Panel Options
 */
export const createPanelOptions = (options: Partial<PanelOptions> = {}): PanelOptions => ({
  groups: [],
  dropdowns: [],
  groupsSorting: false,
  ...options,
});

/**
 * Create Link
 */
export const createVisualLinkConfig = (item: Partial<VisualLink> = {}): VisualLink => ({
  name: 'Link1',
  showMenuOnHover: false,
  links: [],
  id: uuidv4(),
  ...item,
});

/**
 * Create Link
 */
export const createNestedLinkConfig = (item: Partial<NestedLinkConfig> = {}): NestedLinkConfig => ({
  type: LinkConfigType.LINK,
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
  ...item,
});
