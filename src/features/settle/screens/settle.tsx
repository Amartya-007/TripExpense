import { useBottomTabBarHeight } from 'expo-router/js-tabs';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { FadeIn } from '@/components/ui/fade-in';
import { Screen } from '@/components/ui/screen';
import {
  computeNetBalances,
  getPerson,
  simplifyDebts,
  TRIP_PEOPLE,
} from '@/features/expenses/expenses-config';
import { useTripData } from '@/features/expenses/trip-data-provider';
import { appToast } from '@/lib/toast/app-toast';
import { useMockRefresh } from '@/lib/hooks/use-mock-refresh';
import { useAppTheme } from '@/theme/theme-provider';

function formatCurrency(amount: number) {
  return `₹${Math.round(Math.abs(amount)).toLocaleString('en-IN')}`;
}

export default function SettleScreen() {
  const { colors, spacing } = useAppTheme();
  const tabBarHeight = useBottomTabBarHeight();
  const { expenses } = useTripData();
  const { refreshing, onRefresh } = useMockRefresh();

  const balances = computeNetBalances(expenses);
  const settlements = simplifyDebts(balances);

  function handleRemind(name: string) {
    appToast.info(`Reminder sent to ${name}`, {
      description: 'Real reminders arrive once the trip API is wired up.',
    });
  }

  return (
    <Screen contentStyle={{ paddingBottom: tabBarHeight + spacing.lg }} onRefresh={onRefresh} refreshing={refreshing}>
      <FadeIn style={{ gap: spacing.lg }}>
      <View style={{ gap: spacing.xs }}>
        <AppText variant="eyebrow">Balances</AppText>
        <AppText variant="title">Who owes what</AppText>
      </View>

      <Card style={{ gap: spacing.md }}>
        {TRIP_PEOPLE.map((person) => {
          const balance = balances[person.id];
          const isSettled = Math.abs(balance) < 1;
          const isOwed = balance > 0;

          return (
            <View
              key={person.id}
              style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexShrink: 1, minWidth: 0 }}>
                <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: colors[person.color], flexShrink: 0 }} />
                <AppText variant="body" numberOfLines={1} style={{ flexShrink: 1 }}>
                  {person.name}
                </AppText>
              </View>
              <AppText
                variant="body"
                numberOfLines={1}
                style={{ color: isSettled ? colors.textMuted : isOwed ? colors.success : colors.text, flexShrink: 0 }}>
                {isSettled ? 'Settled up' : isOwed ? `Gets back ${formatCurrency(balance)}` : `Owes ${formatCurrency(balance)}`}
              </AppText>
            </View>
          );
        })}
      </Card>

      <View style={{ gap: spacing.xs }}>
        <AppText variant="eyebrow">Suggested settlements</AppText>
        <AppText variant="caption" tone="muted">
          The simplest set of payments to bring everyone to zero.
        </AppText>
      </View>

      {settlements.length === 0 ? (
        <EmptyState title="Everyone's settled up" body="No outstanding balances on this trip right now." />
      ) : (
        <Card style={{ gap: 0 }}>
          {settlements.map((settlement, index) => {
            const from = getPerson(settlement.from);
            const to = getPerson(settlement.to);

            return (
              <View key={`${settlement.from}-${settlement.to}-${index}`}>
                <View style={{ paddingVertical: spacing.sm, gap: spacing.sm }}>
                  <View style={{ gap: 2 }}>
                    <AppText variant="body" numberOfLines={1}>
                      {from.name} → {to.name}
                    </AppText>
                    <AppText variant="caption" tone="muted" numberOfLines={1}>
                      {from.name} pays {to.name} to settle up
                    </AppText>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <AppText variant="title">{formatCurrency(settlement.amount)}</AppText>
                    <Button label="Remind" size="sm" variant="secondary" fullWidth={false} onPress={() => handleRemind(from.name)} />
                  </View>
                </View>
                {index < settlements.length - 1 ? <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: colors.border }} /> : null}
              </View>
            );
          })}
        </Card>
      )}
      </FadeIn>
    </Screen>
  );
}
