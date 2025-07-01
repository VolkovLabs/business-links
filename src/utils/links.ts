import { DataFrame, dateTime, InterpolateFunction, TimeRange } from '@grafana/data';

import { DashboardMeta, GroupConfig, LinkConfig, LinkType, TimeConfig, TimeConfigType } from '@/types';
import { VisualLink, VisualLinkType } from '@/types/links';

import { filterDashboardsByTags } from './dashboards';
import { getFieldFromFrame, getFrameBySource } from './fields';
import { mapRelativeTimeRangeToOption, timeToSeconds } from './timeRange';

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
  item: LinkConfig,
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

  const kioskParam = extractParamsByPrefix(params, 'kiosk');

  /**
   * Apply all variables states
   */
  if (item.includeVariables) {
    const newParams = extractParamsByPrefix(params, 'var-');

    currentUrl = `${currentUrl}?${newParams}`;
  }

  /**
   * Apply Time Range
   */
  if (item.includeTimeRange) {
    const timeRangeParams = `from=${timeRange.from.toISOString()}&to=${timeRange.to.toISOString()}`;
    currentUrl = `${currentUrl}${item.includeVariables ? `&${timeRangeParams}` : `?${timeRangeParams}`}`;
  }

  /**
   * Apply kiosk param as flag
   */
  if (kioskParam && item.includeKioskMode) {
    currentUrl = `${currentUrl}${currentUrl.includes('?') ? '&' : '?'}kiosk`;
  }
  return currentUrl;
};

/**
 * Prepares a time range based on the time picker configuration.
 * @param item - The item containing the time picker configuration.
 * @param series - The data series.
 * @param dashboardTimeRange - Dashboard Time Range
 * @returns A time range object
 */
export const preparePickerTimeRange = ({
  item,
  series,
  dashboardTimeRange,
}: {
  item: { timePickerConfig?: TimeConfig };
  series: DataFrame[];
  dashboardTimeRange: {
    from: string | number;
    to: string | number;
  };
}): {
  from: string | number;
  to: string | number;
} => {
  const config = item.timePickerConfig;

  /**
   * Return by default
   */
  if (!config) {
    return dashboardTimeRange;
  }

  switch (config.type) {
    case TimeConfigType.RELATIVE: {
      /**
       * Map relative options to raw correct time range
       * if no relative options return empty it will return by default
       */
      const options =
        config.relativeTimeRange?.from || config.relativeTimeRange?.to
          ? mapRelativeTimeRangeToOption(config.relativeTimeRange)
          : { from: '', to: '' };

      return {
        from: options.from || dashboardTimeRange.from,
        to: options.to || dashboardTimeRange.to,
      };
    }

    case TimeConfigType.MANUAL: {
      /**
       * Return manual values
       * or default range
       */
      return {
        from: config.manualTimeRange?.from ?? dashboardTimeRange.from,
        to: config.manualTimeRange?.to ?? dashboardTimeRange.to,
      };
    }

    case TimeConfigType.FIELD: {
      /**
       * Get Frames
       */
      const fromFrame = getFrameBySource(series, config.fieldFrom);
      const toFrame = getFrameBySource(series, config.fieldTo);

      /**
       * Get Values from fields
       */
      const fromValue = getFieldFromFrame(fromFrame, config.fieldFrom)?.values?.[0];
      const toValue = getFieldFromFrame(toFrame, config.fieldTo)?.values?.[0];

      /**
       * return values
       * otherwise return default Range
       */
      return {
        from: fromValue ? dateTime(fromValue)?.valueOf() : dashboardTimeRange.from,
        to: toValue ? dateTime(toValue)?.valueOf() : dashboardTimeRange.to,
      };
    }

    default:
      return dashboardTimeRange;
  }
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
 * @param dashboardId
 * @param highlightCurrentLink
 * @param highlightCurrentTimepicker
 * @param series
 */
export const prepareLinksToRender = ({
  currentGroup,
  dropdowns,
  replaceVariables,
  timeRange,
  dashboards,
  params,
  dashboardId,
  highlightCurrentLink,
  highlightCurrentTimepicker,
  series,
}: {
  currentGroup?: GroupConfig;
  dropdowns: GroupConfig[];
  replaceVariables: InterpolateFunction;
  timeRange: TimeRange;
  dashboards: DashboardMeta[];
  params: string;
  dashboardId: string;
  highlightCurrentLink?: boolean;
  highlightCurrentTimepicker?: boolean;
  series: DataFrame[];
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
       * Time picker
       */
      case LinkType.TIMEPICKER: {
        /**
         * Dashboard Time Range
         */
        const dashboardTimeRange = {
          from: typeof timeRange.raw.from === 'string' ? timeRange.raw.from : timeRange.from.valueOf(),
          to: typeof timeRange.raw.to === 'string' ? timeRange.raw.to : timeRange.to.valueOf(),
        };

        /**
         * Picker Time Range
         */
        const pickerTimeRange = preparePickerTimeRange({
          dashboardTimeRange: dashboardTimeRange,
          item,
          series,
        });

        /**
         * Is current timepicker
         */
        const isCurrentTimepicker =
          highlightCurrentTimepicker &&
          timeToSeconds(pickerTimeRange.from) === timeToSeconds(dashboardTimeRange.from) &&
          timeToSeconds(pickerTimeRange.to) === timeToSeconds(dashboardTimeRange.to);

        result.push({
          type: VisualLinkType.TIMEPICKER,
          id: item.id,
          name: item.name,
          timeRange: pickerTimeRange,
          links: [],
          isCurrentTimepicker,
          showCustomIcons: item.showCustomIcons,
          customIconUrl: item.customIconUrl,
          icon: item.icon,
          alignContentPosition: item.alignContentPosition,
          hideTooltipOnHover: item.hideTooltipOnHover,
        });
        break;
      }

      /**
       * HTML
       */
      case LinkType.HTML: {
        result.push({
          type: VisualLinkType.HTML,
          id: item.id,
          name: item.name,
          content: item.htmlConfig?.content,
          links: [],
        });
        break;
      }

      /**
       * Single link
       */
      case LinkType.SINGLE: {
        const preparedUrl = prepareUrlWithParams(item, timeRange, replaceVariables, params, item.url);

        /**
         * Is current dashboard/link
         */
        const isCurrentDashboard = !!highlightCurrentLink && preparedUrl.includes(dashboardId);

        result.push({
          id: item.id,
          name: item.name,
          type: VisualLinkType.LINK,
          links: [
            {
              ...item,
              isCurrentLink: isCurrentDashboard,
              url: preparedUrl,
            },
          ],
          alignContentPosition: item.alignContentPosition,
          hideTooltipOnHover: item.hideTooltipOnHover,
        });
        break;
      }

      /**
       * Dashboard link
       */
      case LinkType.DASHBOARD: {
        result.push({
          name: item.name,
          id: item.id,
          type: VisualLinkType.LINK,
          links: [
            {
              ...item,
              url: prepareUrlWithParams(item, timeRange, replaceVariables, params, item.dashboardUrl),
            },
          ],
          alignContentPosition: item.alignContentPosition,
          hideTooltipOnHover: item.hideTooltipOnHover,
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
          type: VisualLinkType.LINK,
          icon: item.icon,
          showMenuOnHover: item.showMenuOnHover,
          hoverMenuPosition: item.hoverMenuPosition,
          id: item.id,
          links: availableDashboards.map((availableDashboard) => ({
            ...item,
            name: availableDashboard.title,
            url: prepareUrlWithParams(item, timeRange, replaceVariables, params, availableDashboard.url),
          })),
          showCustomIcons: item.showCustomIcons,
          customIconUrl: item.customIconUrl,
          alignContentPosition: item.alignContentPosition,
          hideTooltipOnHover: item.hideTooltipOnHover,
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
          type: VisualLinkType;
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
            dashboardId,
            highlightCurrentLink,
            highlightCurrentTimepicker,
            series,
          });
        }

        const dropdownLinks = nestedLinks.flatMap((nestedLink) => {
          if (nestedLink.type === VisualLinkType.TIMEPICKER || nestedLink.type === VisualLinkType.LLMAPP) {
            return [
              {
                linkType: nestedLink.type === VisualLinkType.TIMEPICKER ? LinkType.TIMEPICKER : LinkType.LLMAPP,
                ...nestedLink,
              },
            ] as unknown as LinkConfig[];
          }

          return nestedLink.links;
        });

        /**
         * Return Dropdown with all links
         */
        result.push({
          id: item.id,
          name: item.name,
          type: VisualLinkType.MENU,
          dropdownConfig: item.dropdownConfig,
          icon: item.icon,
          showMenuOnHover: item.showMenuOnHover,
          hoverMenuPosition: item.hoverMenuPosition,
          links: dropdownLinks,
          showCustomIcons: item.showCustomIcons,
          customIconUrl: item.customIconUrl,
          alignContentPosition: item.alignContentPosition,
          hideTooltipOnHover: item.hideTooltipOnHover,
        });
        break;
      }

      /**
       * Business AI link
       */
      case LinkType.LLMAPP: {
        result.push({
          type: VisualLinkType.LLMAPP,
          contextPrompt: item.contextPrompt,
          assistantName: item.assistantName,
          id: item.id,
          name: item.name,
          links: [],
          showCustomIcons: item.showCustomIcons,
          customIconUrl: item.customIconUrl,
          icon: item.icon,
          alignContentPosition: item.alignContentPosition,
          hideTooltipOnHover: item.hideTooltipOnHover,
        });
        break;
      }

      default:
        break;
    }
  }
  return result;
};
