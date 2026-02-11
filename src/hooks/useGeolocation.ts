import { useState, useEffect } from 'react';
import type { GpsLocation } from '../types/index.js';

interface GeolocationState {
  location: GpsLocation | null;
  loading: boolean;
  error: string | null;
}

export function useGeolocation(): GeolocationState {
  const [state, setState] = useState<GeolocationState>({
    location: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setState({ location: null, loading: false, error: 'Geolocation not supported' });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude: lat, longitude: lng } = position.coords;
        let address: string | undefined;

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
          );
          const data = await res.json();
          address = data.display_name;
        } catch {
          // address remains undefined
        }

        setState({ location: { lat, lng, address }, loading: false, error: null });
      },
      (err) => {
        setState({ location: null, loading: false, error: err.message });
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  return state;
}
