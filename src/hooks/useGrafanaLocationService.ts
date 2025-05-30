import { locationService } from '@grafana/runtime';
import { useEffect, useState } from 'react';

export function useGrafanaLocationService(): Location {
  const [location, setLocation] = useState(() => locationService.getLocation());

  useEffect(() => {
    const subscription = locationService.getLocationObservable().subscribe((newLocation) => {
      setLocation(newLocation);
    });

    return () => subscription.unsubscribe();
  }, []);

  return location;
}
