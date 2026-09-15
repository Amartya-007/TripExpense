import { router } from 'expo-router';
import { Tabs, type BottomTabBarProps } from 'expo-router/js-tabs';

import { BottomNav } from '@/features/home/components/bottom-nav';
import { DASHBOARD_NAV_ITEMS } from '@/features/home/dashboard-config';
import { useAppTheme } from '@/theme/theme-provider';

type NavKey = (typeof DASHBOARD_NAV_ITEMS)[number]['key'];

const ROUTE_TO_KEY: Record<string, NavKey> = {
  dashboard: 'home',
  expenses: 'expenses',
  settle: 'settle',
  settings: 'settings',
};

const KEY_TO_ROUTE: Partial<Record<NavKey, string>> = {
  home: 'dashboard',
  expenses: 'expenses',
  settle: 'settle',
  settings: 'settings',
};

function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const activeRouteName = state.routes[state.index]?.name ?? 'dashboard';
  const activeKey = ROUTE_TO_KEY[activeRouteName] ?? 'home';

  function handleNavigate(key: NavKey) {
    if (key === activeKey) return;
    const targetRoute = KEY_TO_ROUTE[key];
    if (targetRoute) navigation.navigate(targetRoute);
  }

  return <BottomNav activeKey={activeKey} onNavigate={handleNavigate} onAdd={() => router.push('/add-expense')} />;
}

export default function TabsLayout() {
  const { colors } = useAppTheme();

  return (
    <Tabs
      backBehavior="initialRoute"
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: true,
        headerShadowVisible: false,
        headerBackButtonDisplayMode: 'minimal',
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
      }}>
      <Tabs.Screen name="dashboard" options={{ title: '' }} />
      <Tabs.Screen name="expenses" options={{ title: 'Expenses' }} />
      <Tabs.Screen name="settle" options={{ title: 'Settle up' }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings' }} />
    </Tabs>
  );
}
