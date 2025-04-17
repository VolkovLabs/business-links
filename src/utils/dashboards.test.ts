import { getBackendSrv } from '@grafana/runtime';
import { lastValueFrom } from 'rxjs';

import { filterDashboardsByTags, getAllDashboards } from './dashboards';

jest.mock('@grafana/runtime', () => ({
  getBackendSrv: jest.fn(),
}));

jest.mock('rxjs', () => ({
  lastValueFrom: jest.fn(),
}));

/**
 * filterDashboardsByTags
 */
describe('filterDashboardsByTags', () => {
  const dashboards: any = [
    { id: 1, title: 'Dashboard 1', tags: ['dev', 'test'] },
    { id: 2, title: 'Dashboard 2', tags: ['prod'] },
    { id: 3, title: 'Dashboard 3', tags: ['dev', 'prod'] },
    { id: 4, title: 'Dashboard 4', tags: [] },
  ];

  it('Should return all dashboards if testTags is undefined', () => {
    const result = filterDashboardsByTags(dashboards);
    expect(result).toEqual(dashboards);
  });

  it('Should return all dashboards if testTags is an empty array', () => {
    const result = filterDashboardsByTags(dashboards, []);
    expect(result).toEqual(dashboards);
  });

  it('Should filter dashboards that contain all testTags', () => {
    const result = filterDashboardsByTags(dashboards, ['dev']);
    expect(result).toEqual([
      { id: 1, title: 'Dashboard 1', tags: ['dev', 'test'] },
      { id: 3, title: 'Dashboard 3', tags: ['dev', 'prod'] },
    ]);
  });

  it('Should return dashboards that contain multiple required tags', () => {
    const result = filterDashboardsByTags(dashboards, ['dev', 'prod']);
    expect(result).toEqual([{ id: 3, title: 'Dashboard 3', tags: ['dev', 'prod'] }]);
  });

  it('Should return empty array if no dashboards match the tags', () => {
    const result = filterDashboardsByTags(dashboards, ['nonexistent']);
    expect(result).toEqual([]);
  });

  it('Should ignore dashboards with empty tags if testTags are provided', () => {
    const result = filterDashboardsByTags(dashboards, ['dev']);
    expect(result).not.toContainEqual({ id: 4, title: 'Dashboard 4', tags: [] });
  });
});

/**
 * getAllDashboards
 */
describe('getAllDashboards', () => {
  const mockDashboards = [
    { id: 1, title: 'Dashboard 1', uid: 'aeivkiz2o5csga', url: '/d/aeivkiz2o5csga/dashboard-second' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('Should fetch and return dashboards', async () => {
    jest.mocked(getBackendSrv).mockReturnValue({
      fetch: jest.fn(() => ({
        toPromise: jest.fn(() => Promise.resolve({ data: mockDashboards })),
      })),
    } as any);

    jest.mocked(lastValueFrom).mockResolvedValue({ data: mockDashboards });

    const result = await getAllDashboards();

    expect(getBackendSrv).toHaveBeenCalled();
    expect(lastValueFrom).toHaveBeenCalled();
    expect(result).toEqual(mockDashboards);
  });
});
