import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/ui/app-text';
import { Card } from '@/components/ui/card';
import { FadeIn } from '@/components/ui/fade-in';
import { Screen } from '@/components/ui/screen';
import { ExpenseRow } from '@/features/expenses/components/expense-row';
import { groupExpensesByDate } from '@/features/expenses/expenses-config';
import { useTripData } from '@/features/expenses/trip-data-provider';
import { BottomNav } from '@/features/home/components/bottom-nav';
import { useDashboardNavigation } from '@/features/home/use-dashboard-navigation';
import { useAppTheme } from '@/theme/theme-provider';

function formatCurrency(amount: number) {
  return `₹${amount.toLocaleString('en-IN')}`;
}

export default function ExpensesScreen() {
  const { colors, spacing } = useAppTheme();
  const insets = useSafeAreaInsets();
  const { handleNavigate, handleAdd } = useDashboardNavigation('expenses');
  const { expenses } = useTripData();

  const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const groups = groupExpensesByDate(expenses);

  return (
    <>
      <Screen hasHeader contentStyle={{ paddingBottom: insets.bottom + 112 }}>
        <FadeIn style={{ gap: spacing.lg }}>
        <View style={{ gap: spacing.xs }}>
          <AppText variant="eyebrow">All expenses</AppText>
          <AppText variant="hero">{formatCurrency(totalSpent)}</AppText>
          <AppText variant="caption" tone="muted">
            {expenses.length} expenses across the trip
          </AppText>
        </View>

        {groups.map(({ dateKey, label, expenses: dayExpenses }) => (
          <Card key={dateKey} style={{ gap: 0 }}>
            <AppText variant="eyebrow" style={{ marginBottom: spacing.xs }}>
              {label}
            </AppText>
            {dayExpenses.map((expense, index) => (
              <View key={expense.id}>
                <ExpenseRow expense={expense} />
                {index < dayExpenses.length - 1 ? (
                  <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: colors.border }} />
                ) : null}
              </View>
            ))}
          </Card>
        ))}
        </FadeIn>
      </Screen>
      <BottomNav activeKey="expenses" onNavigate={handleNavigate} onAdd={handleAdd} />
    </>
  );
}
