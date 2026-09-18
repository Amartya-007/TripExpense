import { router } from 'expo-router';
import { useBottomTabBarHeight } from 'expo-router/js-tabs';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Card } from '@/components/ui/card';
import { FadeIn } from '@/components/ui/fade-in';
import { Icon } from '@/components/ui/icon';
import { Screen } from '@/components/ui/screen';
import { ExpenseRow } from '@/features/expenses/components/expense-row';
import { useTripData } from '@/features/expenses/trip-data-provider';
import { CategoryBreakdown } from '@/features/home/components/category-breakdown';
import { DASHBOARD_MOCK_DATA } from '@/features/home/dashboard-config';
import { calculateTripStats } from '@/features/home/trip-stats';
import { TripSwitcherSheet } from '@/features/trips/components/trip-switcher-sheet';
import { TRIPS } from '@/features/trips/trips-config';
import { formatDateRange } from '@/lib/date/friendly-date';
import { useMockRefresh } from '@/lib/hooks/use-mock-refresh';
import { useAppTheme } from '@/theme/theme-provider';

function formatCurrency(amount: number) {
  return `₹${amount.toLocaleString('en-IN')}`;
}

// Exactly one trip in TRIPS is marked isLive - see trips-config.ts.
const liveTrip = TRIPS.find((trip) => trip.isLive) ?? TRIPS[0];

export default function DashboardScreen() {
  const { colors, radius, spacing } = useAppTheme();
  const tabBarHeight = useBottomTabBarHeight();
  const { trip: tripConfig } = DASHBOARD_MOCK_DATA;
  const { expenses } = useTripData();
  const { refreshing, onRefresh } = useMockRefresh();
  const [switcherOpen, setSwitcherOpen] = useState(false);

  const stats = calculateTripStats({ budget: liveTrip.budget, startDate: liveTrip.startDate, endDate: liveTrip.endDate, expenses });
  const trip = { ...tripConfig, spent: stats.totalSpent, expenses: expenses.length, budget: liveTrip.budget };
  const spentPercent = Math.min(100, Math.round((trip.spent / trip.budget) * 100));
  const recentExpenses = [...expenses].sort((a, b) => b.dateTime.localeCompare(a.dateTime)).slice(0, 3);
  const statusColor = stats.statusTone === 'danger' ? colors.danger : stats.statusTone === 'warning' ? colors.warning : colors.success;
  const yesterdayDelta = stats.yesterdaySpent > 0 ? Math.round(((stats.todaySpent - stats.yesterdaySpent) / stats.yesterdaySpent) * 100) : 0;

  return (
    <>
      <Screen contentStyle={{ paddingBottom: tabBarHeight + spacing.lg }} onRefresh={onRefresh} refreshing={refreshing}>
        <FadeIn style={{ gap: spacing.lg }}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Switch trip"
          onPress={() => setSwitcherOpen(true)}
          style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', opacity: pressed ? 0.8 : 1 })}>
          <View style={{ gap: spacing.xs }}>
            <AppText variant="eyebrow">{liveTrip.place}</AppText>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
              <AppText variant="hero">{trip.name}</AppText>
              <Icon name="chevronDown" size={20} color={colors.textMuted} />
            </View>
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
        </Pressable>

        {stats.isOverspending ? (
          <Card style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.dangerSoft, borderColor: colors.danger }}>
            <Icon name="alert" size={20} color={colors.danger} />
            <View style={{ flex: 1 }}>
              <AppText variant="body" style={{ color: colors.danger, fontWeight: '800' }}>
                Budget alert
              </AppText>
              <AppText variant="caption" style={{ color: colors.danger }}>
                {stats.projectedDeficit > 0
                  ? `At this pace, you may overshoot by ${formatCurrency(Math.round(stats.projectedDeficit))}.`
                  : "You're spending faster than your budget allows for the days left."}
              </AppText>
            </View>
          </Card>
        ) : null}

        <Card>
          <AppText variant="eyebrow">Trip budget</AppText>

          <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: spacing.xs }}>
            <AppText variant="hero" style={{ color: statusColor }}>
              {formatCurrency(stats.remainingBalance)}
            </AppText>
            <AppText tone="muted" style={{ paddingBottom: 6 }}>
              left of {formatCurrency(trip.budget)}
            </AppText>
          </View>

          <View style={{ height: 10, borderRadius: radius.pill, backgroundColor: colors.surfaceStrong, overflow: 'hidden' }}>
            <View style={{ width: `${spentPercent}%`, height: '100%', borderRadius: radius.pill, backgroundColor: statusColor }} />
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <AppText variant="caption" tone="muted">
              {spentPercent}% used
            </AppText>
            <AppText variant="caption" tone="muted">
              {formatCurrency(trip.spent)} spent
            </AppText>
          </View>

          <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: colors.border }} />

          <View style={{ flexDirection: 'row' }}>
            <View style={{ flex: 1, alignItems: 'center', gap: 2 }}>
              <Icon name="person" size={16} color={colors.primary} />
              <AppText variant="subtitle">{trip.people}</AppText>
              <AppText variant="caption" tone="muted">
                People
              </AppText>
            </View>
            <View style={{ width: StyleSheet.hairlineWidth, backgroundColor: colors.border }} />
            <View style={{ flex: 1, alignItems: 'center', gap: 2 }}>
              <Icon name="list" size={16} color={colors.primary} />
              <AppText variant="subtitle">{trip.expenses}</AppText>
              <AppText variant="caption" tone="muted">
                Expenses
              </AppText>
            </View>
            <View style={{ width: StyleSheet.hairlineWidth, backgroundColor: colors.border }} />
            <View style={{ flex: 1, alignItems: 'center', gap: 2 }}>
              <Icon name="clock" size={16} color={colors.primary} />
              <AppText variant="subtitle">{stats.daysRemaining}</AppText>
              <AppText variant="caption" tone="muted">
                Days left
              </AppText>
            </View>
          </View>
        </Card>

        <Card>
          <AppText variant="eyebrow">Spending by category</AppText>
          <CategoryBreakdown expenses={expenses} />
        </Card>

        <Card style={{ gap: 0 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.xs }}>
            <AppText variant="eyebrow">Recent activity</AppText>
            <Pressable accessibilityRole="button" accessibilityLabel="See all expenses" onPress={() => router.push('/expenses')} hitSlop={8}>
              <AppText variant="caption" tone="primary" style={{ fontWeight: '800' }}>
                See all
              </AppText>
            </Pressable>
          </View>
          {recentExpenses.map((expense, index) => (
            <View key={expense.id}>
              <ExpenseRow expense={expense} />
              {index < recentExpenses.length - 1 ? <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: colors.border }} /> : null}
            </View>
          ))}
        </Card>

        <Card style={{ backgroundColor: colors.primary, borderColor: colors.primary }}>
          <AppText variant="eyebrow" style={{ color: colors.primaryForeground, opacity: 0.75 }}>
            Today&apos;s limit
          </AppText>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <View>
              <AppText variant="caption" style={{ color: colors.primaryForeground, opacity: 0.75 }}>
                Safe to spend today
              </AppText>
              <AppText variant="hero" style={{ color: colors.primaryForeground }}>
                {formatCurrency(Math.max(0, Math.round(stats.remainingPerDay)))}
              </AppText>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <AppText variant="caption" style={{ color: colors.primaryForeground, opacity: 0.75 }}>
                Burn rate/day
              </AppText>
              <AppText variant="subtitle" style={{ color: colors.primaryForeground }}>
                {formatCurrency(Math.round(stats.dailyBurnRate))}
              </AppText>
            </View>
          </View>
          <AppText variant="caption" style={{ color: colors.primaryForeground, opacity: 0.75 }}>
            Today: {formatCurrency(stats.todaySpent)}
            {stats.yesterdaySpent > 0
              ? ` · ${yesterdayDelta <= 0 ? `${Math.abs(yesterdayDelta)}% less` : `${yesterdayDelta}% more`} than yesterday`
              : ''}
          </AppText>
        </Card>
        </FadeIn>
      </Screen>

      <TripSwitcherSheet visible={switcherOpen} onClose={() => setSwitcherOpen(false)} activeTripId={liveTrip.id} />
    </>
  );
}
