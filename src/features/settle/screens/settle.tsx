import { useBottomTabBarHeight } from 'expo-router/js-tabs';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { FadeIn } from '@/components/ui/fade-in';
import { Icon } from '@/components/ui/icon';
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
        
        {/* Balances Section */}
        <View style={{ gap: spacing.xs }}>
          <AppText variant="eyebrow">Balances</AppText>
          <AppText variant="title">Who owes what</AppText>
        </View>

        <Card style={{ gap: spacing.md, paddingVertical: spacing.lg }}>
          {TRIP_PEOPLE.map((person) => {
            const balance = balances[person.id];
            const isSettled = Math.abs(balance) < 1;
            const isOwed = balance > 0;

            return (
              <View
                key={person.id}
                style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, flexShrink: 1, minWidth: 0 }}>
                  <Avatar name={person.name} color={colors[person.color]} size={32} />
                  <AppText variant="body" numberOfLines={1} style={{ flexShrink: 1, fontWeight: '600' }}>
                    {person.name}
                  </AppText>
                </View>
                <AppText
                  variant="body"
                  numberOfLines={1}
                  style={{ 
                    color: isSettled ? colors.textMuted : isOwed ? colors.success : colors.text, 
                    fontWeight: isSettled ? '500' : '700',
                    flexShrink: 0 
                  }}>
                  {isSettled ? 'Settled up' : isOwed ? `Gets back ${formatCurrency(balance)}` : `Owes ${formatCurrency(balance)}`}
                </AppText>
              </View>
            );
          })}
        </Card>

        {/* Settlements Section */}
        <View style={{ gap: spacing.xs, marginTop: spacing.sm }}>
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
                  <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md, gap: spacing.md }}>
                    
                    {/* Visual Routing: Avatar -> Avatar */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
                      <Avatar name={from.name} color={colors[from.color]} size={28} />
                      <Icon name="arrowRight" size={14} color={colors.textMuted} />
                      <Avatar name={to.name} color={colors[to.color]} size={28} />
                    </View>

                    {/* Settlement Details */}
                    <View style={{ flex: 1, gap: 2 }}>
                      <AppText variant="body" numberOfLines={1} style={{ fontWeight: '700' }}>
                        {from.name} pays {to.name}
                      </AppText>
                      <AppText variant="caption" tone="muted" numberOfLines={1}>
                        {formatCurrency(settlement.amount)} to settle up
                      </AppText>
                    </View>

                    {/* Action Button */}
                    <Button 
                      label="Remind" 
                      size="sm" 
                      variant="secondary" 
                      fullWidth={false} 
                      onPress={() => handleRemind(from.name)} 
                    />
                  </View>
                  
                  {index < settlements.length - 1 ? (
                    <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: colors.border }} />
                  ) : null}
                </View>
              );
            })}
          </Card>
        )}
      </FadeIn>
    </Screen>
  );
}