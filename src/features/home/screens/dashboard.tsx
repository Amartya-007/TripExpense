import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/ui/app-text';
import { Card } from '@/components/ui/card';
import { FadeIn } from '@/components/ui/fade-in';
import { Icon } from '@/components/ui/icon';
import { Screen } from '@/components/ui/screen';
import { useTripData } from '@/features/expenses/trip-data-provider';
import { BottomNav } from '@/features/home/components/bottom-nav';
import { DASHBOARD_MOCK_DATA } from '@/features/home/dashboard-config';
import { useDashboardNavigation } from '@/features/home/use-dashboard-navigation';
import { TRIPS } from '@/features/trips/trips-config';
import { formatDateRange, toISODate } from '@/lib/date/friendly-date';
import { useAppTheme } from '@/theme/theme-provider';

function formatCurrency(amount: number) {
  return `₹${amount.toLocaleString('en-IN')}`;
}

// Exactly one trip in TRIPS is marked isLive - see trips-config.ts.
const liveTrip = TRIPS.find((trip) => trip.isLive) ?? TRIPS[0];

export default function DashboardScreen() {
  const { colors, radius, spacing } = useAppTheme();
  const insets = useSafeAreaInsets();
  const { trip: tripConfig, today: todayConfig } = DASHBOARD_MOCK_DATA;
  const { handleNavigate, handleAdd } = useDashboardNavigation('home');
  const { expenses } = useTripData();

  const spent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const todayKey = toISODate(new Date());
  const todaySpent = expenses.filter((expense) => expense.dateTime.startsWith(todayKey)).reduce((sum, expense) => sum + expense.amount, 0);
  const trip = { ...tripConfig, spent, expenses: expenses.length };
  const today = { ...todayConfig, spent: todaySpent, burnRate: Math.round((todaySpent / todayConfig.limit) * 100) };

  const spentPercent = Math.min(100, Math.round((trip.spent / trip.budget) * 100));
  const remaining = trip.budget - trip.spent;
  const burnPercent = Math.min(100, today.burnRate);
  const isOverLimit = today.spent > today.limit;
  const yesterdayDelta = Math.round(((today.spent - today.yesterday) / today.yesterday) * 100);

  return (
    <>
      <Screen hasHeader contentStyle={{ paddingBottom: insets.bottom + 112 }}>
        <FadeIn style={{ gap: spacing.lg }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ gap: spacing.xs }}>
            <AppText variant="eyebrow">{liveTrip.place}</AppText>
            <AppText variant="hero">{trip.name}</AppText>
            <AppText variant="caption" tone="muted">
              {formatDateRange(liveTrip.startDate, liveTrip.endDate)}
            </AppText>
          </View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing.xs,
              borderRadius: radius.pill,
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.sm,
              backgroundColor: colors.primarySoft,
            }}>
            <Icon name="person" size={14} color={colors.primary} />
            <AppText variant="caption" tone="primary">
              {trip.people}
            </AppText>
          </View>
        </View>

        <Card>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <AppText variant="eyebrow">Trip budget</AppText>
            <AppText variant="caption" tone="muted">
              {trip.daysLeft} days left
            </AppText>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: spacing.xs }}>
            <AppText variant="hero">{formatCurrency(trip.spent)}</AppText>
            <AppText tone="muted" style={{ paddingBottom: 6 }}>
              of {formatCurrency(trip.budget)}
            </AppText>
          </View>

          <View style={{ height: 10, borderRadius: radius.pill, backgroundColor: colors.surfaceStrong, overflow: 'hidden' }}>
            <View
              style={{
                width: `${spentPercent}%`,
                height: '100%',
                borderRadius: radius.pill,
                backgroundColor: spentPercent >= 90 ? colors.danger : colors.primary,
              }}
            />
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <AppText variant="caption" tone="muted">
              {spentPercent}% used
            </AppText>
            <AppText variant="caption" tone="muted">
              {formatCurrency(remaining)} left
            </AppText>
          </View>
        </Card>

        <View style={{ flexDirection: 'row', gap: spacing.md }}>
          <Card style={{ flex: 1, alignItems: 'center', gap: spacing.xs }}>
            <Icon name="person" size={18} color={colors.primary} />
            <AppText variant="title">{trip.people}</AppText>
            <AppText variant="caption" tone="muted">
              People
            </AppText>
          </Card>
          <Card style={{ flex: 1, alignItems: 'center', gap: spacing.xs }}>
            <Icon name="list" size={18} color={colors.primary} />
            <AppText variant="title">{trip.expenses}</AppText>
            <AppText variant="caption" tone="muted">
              Expenses
            </AppText>
          </Card>
          <Card style={{ flex: 1, alignItems: 'center', gap: spacing.xs }}>
            <Icon name="clock" size={18} color={colors.primary} />
            <AppText variant="title">{trip.daysLeft}</AppText>
            <AppText variant="caption" tone="muted">
              Days left
            </AppText>
          </Card>
        </View>

        <Card>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <AppText variant="eyebrow">Today</AppText>
            <View
              style={{
                borderRadius: radius.pill,
                paddingHorizontal: spacing.sm,
                paddingVertical: spacing.xs,
                backgroundColor: isOverLimit ? colors.dangerSoft : colors.successSoft,
              }}>
              <AppText variant="caption" style={{ color: isOverLimit ? colors.danger : colors.success }}>
                {isOverLimit ? 'Over daily limit' : 'On track'}
              </AppText>
            </View>
          </View>

          <AppText variant="hero">{formatCurrency(today.spent)}</AppText>

          <AppText variant="caption" tone="muted">
            {yesterdayDelta <= 0 ? `${Math.abs(yesterdayDelta)}% less` : `${yesterdayDelta}% more`} than yesterday (
            {formatCurrency(today.yesterday)})
          </AppText>

          <View style={{ height: 10, borderRadius: radius.pill, backgroundColor: colors.surfaceStrong, overflow: 'hidden' }}>
            <View
              style={{
                width: `${burnPercent}%`,
                height: '100%',
                borderRadius: radius.pill,
                backgroundColor: isOverLimit ? colors.danger : colors.success,
              }}
            />
          </View>

          <AppText variant="caption" tone="muted">
            {today.burnRate}% of today’s {formatCurrency(today.limit)} limit used
          </AppText>
        </Card>
        </FadeIn>
      </Screen>
      <BottomNav activeKey="home" onNavigate={handleNavigate} onAdd={handleAdd} />
    </>
  );
}
