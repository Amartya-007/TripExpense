import { router } from 'expo-router';

import { DASHBOARD_NAV_ITEMS } from '@/features/home/dashboard-config';

type NavKey = (typeof DASHBOARD_NAV_ITEMS)[number]['key'];

const ROUTE_BY_KEY: Partial<Record<NavKey, '/trips' | '/expenses' | '/settle' | '/settings'>> = {
  home: '/trips',
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
    router.push('/add-expense');
  }

  return { handleNavigate, handleAdd };
}
