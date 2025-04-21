import { GroupConfig, LinkConfig, LinkConfigType, LinkTarget, LinkType, PanelOptions } from '@/types';

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
  ...item,
});

/**
 * Create Panel Options
 */
export const createGroupConfig = (options: Partial<GroupConfig> = {}): GroupConfig => ({
  name: 'Group',
  items: [],
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
