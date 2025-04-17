import { getBackendSrv } from '@grafana/runtime';
import { lastValueFrom } from 'rxjs';

import { DashboardMeta } from '@/types';

/**
 * Get Dashboards Tags
 */
export const getAllDashboards = async (): Promise<DashboardMeta[]> => {
  try {
    /**
     * Fetch
     */
    const response = await lastValueFrom(
      getBackendSrv().fetch<DashboardMeta[]>({
        method: 'GET',
        url: `/api/search`,
        params: {
          type: 'dash-db',
        },
      })
    );

    if (response && response.data) {
      return response.data;
    }

    return [];
  } catch {
    return [];
  }
};

/**
 * Filter Dashboards By Tags
 * @param availableDashboards
 * @param testTags
 */
export const filterDashboardsByTags = (availableDashboards: DashboardMeta[], testTags?: string[]): DashboardMeta[] => {
  /**
   * Return all dashboards
   */
  if (!testTags || testTags.length === 0) {
    return availableDashboards;
  }

  /**
   * Filter dashboards by tags
   */
  return availableDashboards.filter((dashboard) => testTags.every((tag) => dashboard.tags.includes(tag)));
};
