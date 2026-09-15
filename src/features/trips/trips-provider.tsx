import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

import { TRIPS as INITIAL_TRIPS, type TripSummary } from '@/features/trips/trips-config';

export type NewTripInput = Omit<TripSummary, 'id' | 'isLive'>;

type TripsListContextValue = {
  trips: TripSummary[];
  addTrip: (input: NewTripInput) => TripSummary;
};

const TripsListContext = createContext<TripsListContextValue | null>(null);

let nextTripSuffix = 1;

export function TripsListProvider({ children }: { children: ReactNode }) {
  const [addedTrips, setAddedTrips] = useState<TripSummary[]>([]);

  const value = useMemo<TripsListContextValue>(
    () => ({
      trips: [...INITIAL_TRIPS, ...addedTrips],
      addTrip: (input) => {
        const trip: TripSummary = { ...input, id: `custom-${nextTripSuffix++}`, isLive: false };
        setAddedTrips((current) => [...current, trip]);
        return trip;
      },
    }),
    [addedTrips],
  );

  return <TripsListContext.Provider value={value}>{children}</TripsListContext.Provider>;
}

export function useTripsList() {
  const context = useContext(TripsListContext);
  if (!context) {
    throw new Error('useTripsList must be used within a TripsListProvider');
  }
  return context;
}
