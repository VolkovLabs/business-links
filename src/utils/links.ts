import { InterpolateFunction, TimeRange } from '@grafana/data';

import { DashboardMeta, GroupConfig, LinkConfig, LinkType } from '@/types';
import { VisualLink } from '@/types/links';

import { filterDashboardsByTags } from './dashboards';

/**
 * extractParamsByPrefix
 * @param search
 * @param prefix
 */
export const extractParamsByPrefix = (search: string, prefix: string): string => {
  const params = new URLSearchParams(search);
  const result = new URLSearchParams();

  for (const [key, value] of params.entries()) {
    if (key.startsWith(prefix)) {
      result.append(key, value);
    }
  }

  return result.toString();
};

/**
 * prepareUrlWithParams
 * @param includeTimeRange
 * @param includeVariables
 * @param timeRange
 * @param replaceVariables
 * @param params
 * @param url
 */
export const prepareUrlWithParams = (
  includeTimeRange: boolean,
  includeVariables: boolean,
  timeRange: TimeRange,
  replaceVariables: InterpolateFunction,
  params: string,
  url?: string
) => {
  /**
   * Return empty URL
   */
  if (!url) {
    return '';
  }

  /**
   * Apply replaceVariables
   */
  let currentUrl = replaceVariables(url);

  /**
   * Apply all variables states
   */
  if (includeVariables) {
    const newParams = extractParamsByPrefix(params, 'var-');

    currentUrl = `${currentUrl}?${newParams}`;
  }

  /**
   * Apply Time Range
   */
  if (includeTimeRange) {
    const timeRangeParams = `from=${timeRange.from.toISOString()}&to=${timeRange.to.toISOString()}`;
    currentUrl = `${currentUrl}${includeVariables ? `&${timeRangeParams}` : `?${timeRangeParams}`}`;
  }

  return currentUrl;
};

/**
 * prepareLinksToRender
 *
 * @param currentGroup
 * @param dropdowns
 * @param replaceVariables
 * @param timeRange
 * @param dashboards
 * @param params
 */
export const prepareLinksToRender = ({
  currentGroup,
  dropdowns,
  replaceVariables,
  timeRange,
  dashboards,
  params,
}: {
  currentGroup?: GroupConfig;
  dropdowns: GroupConfig[];
  replaceVariables: InterpolateFunction;
  timeRange: TimeRange;
  dashboards: DashboardMeta[];
  params: string;
}): VisualLink[] => {
  /**
   * Return empty [] if no groups
   */
  if (!currentGroup) {
    return [];
  }

  const result: VisualLink[] = [];

  /**
   * All enable items
   */
  const enabledItems = currentGroup.items.filter((item) => item.enable);

  for (const item of enabledItems) {
    switch (item.linkType) {
      /**
       * Single link
       */
      case LinkType.SINGLE: {
        result.push({
          name: item.name,
          links: [
            {
              ...item,
              url: prepareUrlWithParams(
                item.includeTimeRange,
                item.includeVariables,
                timeRange,
                replaceVariables,
                params,
                item.url
              ),
            },
          ],
        });
        break;
      }

      /**
       * Dashboard link
       */
      case LinkType.DASHBOARD: {
        result.push({
          name: item.name,
          links: [
            {
              ...item,
              url: prepareUrlWithParams(
                item.includeTimeRange,
                item.includeVariables,
                timeRange,
                replaceVariables,
                params,
                item.dashboardUrl
              ),
            },
          ],
        });
        break;
      }

      /**
       * Tags link
       */
      case LinkType.TAGS: {
        /**
         * Available dashboards by tags
         */
        const availableDashboards = filterDashboardsByTags(dashboards, item.tags);

        result.push({
          name: item.name,
          icon: item.icon,
          links: availableDashboards.map((availableDashboard) => ({
            ...item,
            name: availableDashboard.title,
            url: prepareUrlWithParams(
              item.includeTimeRange,
              item.includeVariables,
              timeRange,
              replaceVariables,
              params,
              availableDashboard.url
            ),
          })),
        });
        break;
      }

      /**
       * DROPDOWN link
       */
      case LinkType.DROPDOWN: {
        /**
         * Get nested group
         */
        const nestedGroup = dropdowns.find((group) => group.name === item.dropdownName);

        /**
         * Nested links
         */
        let nestedLinks: Array<{
          name: string;
          links: LinkConfig[];
        }> = [];

        if (nestedGroup) {
          nestedLinks = prepareLinksToRender({
            currentGroup: nestedGroup,
            dropdowns,
            replaceVariables,
            timeRange,
            dashboards,
            params,
          });
        }

        const dropdownLinks = nestedLinks.flatMap((nestedLink) => nestedLink.links);

        /**
         * Return Dropdown with all links
         */
        result.push({
          name: item.name,
          icon: item.icon,
          links: dropdownLinks,
        });
        break;
      }

      default:
        break;
    }
  }
  return result;
};
