import { describe, expect, it } from 'vitest';

import { DASHBOARD_MOCK_DATA, DASHBOARD_NAV_ITEMS } from '@/features/home/dashboard-config';

describe('dashboard configuration', () => {
  it('keeps the TripSpend bottom navigation order', () => {
    expect(DASHBOARD_NAV_ITEMS.map((item) => item.label)).toEqual([
      'Home',
      'Expenses',
      'Add',
      'Settle',
      'Settings',
    ]);
  });

  it('keeps demo dashboard values internally consistent', () => {
    expect(DASHBOARD_MOCK_DATA.trip.spent).toBeLessThanOrEqual(DASHBOARD_MOCK_DATA.trip.budget);
    expect(DASHBOARD_MOCK_DATA.today.spent).toBeGreaterThanOrEqual(0);
    expect(DASHBOARD_MOCK_DATA.today.limit).toBeGreaterThan(0);
  });
});
