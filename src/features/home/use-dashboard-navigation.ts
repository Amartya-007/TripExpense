import { router } from 'expo-router';

import { DASHBOARD_NAV_ITEMS } from '@/features/home/dashboard-config';
import { appToast } from '@/lib/toast/app-toast';

type NavKey = (typeof DASHBOARD_NAV_ITEMS)[number]['key'];

const ROUTE_BY_KEY: Partial<Record<NavKey, '/dashboard' | '/expenses' | '/settle' | '/settings'>> = {
  home: '/dashboard',
  expenses: '/expenses',
  settle: '/settle',
  settings: '/settings',
};

export function useDashboardNavigation(activeKey: NavKey) {
  function handleNavigate(key: NavKey) {
    if (key === activeKey) return;

    const route = ROUTE_BY_KEY[key];
    if (route) {
      router.replace(route);
    }
  }

  function handleAdd() {
    appToast.info('Adding expenses is coming soon', {
      description: 'Still wiring up the trip schema and API for this.',
    });
  }

  return { handleNavigate, handleAdd };
}
