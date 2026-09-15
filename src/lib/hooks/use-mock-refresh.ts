import { useCallback, useState } from 'react';

/**
 * Drives pull-to-refresh on screens backed by local mock data. There's no
 * server to refetch from yet, so this just gives the gesture a real,
 * short-lived spinner instead of doing nothing - swap the body for a real
 * refetch once a backend exists, the return shape won't need to change.
 */
export function useMockRefresh(delayMs = 700) {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), delayMs);
  }, [delayMs]);

  return { refreshing, onRefresh };
}
