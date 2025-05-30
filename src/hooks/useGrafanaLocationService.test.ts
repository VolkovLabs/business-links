import { locationService } from '@grafana/runtime';
import { act, renderHook } from '@testing-library/react';
import { Observable, Subscription } from 'rxjs';

import { useGrafanaLocationService } from './useGrafanaLocationService';

/**
 * Mock @grafana/runtime
 */
jest.mock('@grafana/runtime', () => ({
  locationService: {
    getLocation: jest.fn(),
    getLocationObservable: jest.fn(),
  },
}));

describe('useGrafanaLocationService', () => {
  const mockInitialLocation = {
    pathname: '/initial',
    search: '?x=1',
    hash: '',
  } as Location;

  const mockUpdatedLocation = {
    pathname: '/updated',
    search: '?x=2',
    hash: '',
  } as Location;

  let subscriberCallback: ((loc: Location) => void) | null = null;

  beforeEach(() => {
    jest.clearAllMocks();
    subscriberCallback = null;

    jest.mocked(locationService.getLocation).mockReturnValue(mockInitialLocation);

    jest.mocked(locationService.getLocationObservable).mockReturnValue(
      new Observable<Location>((subscriber) => {
        subscriberCallback = (loc: Location) => subscriber.next(loc);
        return new Subscription();
      })
    );
  });

  it('Should return initial value', () => {
    const { result } = renderHook(() => useGrafanaLocationService());

    expect(result.current).toEqual(mockInitialLocation);
  });

  it('Should update on change location', () => {
    const { result } = renderHook(() => useGrafanaLocationService());

    act(() => {
      subscriberCallback?.(mockUpdatedLocation);
    });

    expect(result.current).toEqual(mockUpdatedLocation);
  });
});
