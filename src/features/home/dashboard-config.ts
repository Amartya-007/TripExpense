export const DASHBOARD_NAV_ITEMS = [
  { key: 'home', label: 'Home', icon: 'home' as const },
  { key: 'expenses', label: 'Expenses', icon: 'list' as const },
  { key: 'add', label: 'Add', icon: 'add' as const },
  { key: 'settle', label: 'Settle', icon: 'settle' as const },
  { key: 'settings', label: 'Settings', icon: 'settings' as const },
] as const;

export const DASHBOARD_MOCK_DATA = {
  trip: {
    name: 'Goa Trip',
    budget: 75000,
    spent: 60680,
    people: 8,
    expenses: 36,
    daysLeft: 3,
  },
  today: {
    spent: 11180,
    yesterday: 18870,
    limit: 4000,
    burnRate: 71,
  },
} as const;
