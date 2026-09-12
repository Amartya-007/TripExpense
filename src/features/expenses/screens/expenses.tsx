import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/ui/app-text';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Screen } from '@/components/ui/screen';
import {
  EXPENSE_CATEGORIES,
  EXPENSE_GROUP_ORDER,
  MOCK_EXPENSES,
  getPerson,
  type Expense,
} from '@/features/expenses/expenses-config';
import { BottomNav } from '@/features/home/components/bottom-nav';
import { useDashboardNavigation } from '@/features/home/use-dashboard-navigation';
import { useAppTheme } from '@/theme/theme-provider';

function formatCurrency(amount: number) {
  return `₹${amount.toLocaleString('en-IN')}`;
}

function splitLabel(expense: Expense) {
  if (expense.splitBetween.length === 4) return 'Split 4 ways';
  return `Split: ${expense.splitBetween.map((id) => getPerson(id).name).join(', ')}`;
}

function ExpenseRow({ expense }: { expense: Expense }) {
  const { colors, radius, spacing } = useAppTheme();
  const category = EXPENSE_CATEGORIES[expense.category];
  const payer = getPerson(expense.paidBy);

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm }}>
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: radius.md,
          backgroundColor: colors.surfaceStrong,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Icon name={category.icon} size={18} color={colors.textMuted} />
      </View>

      <View style={{ flex: 1, gap: 2 }}>
        <AppText variant="body">{expense.title}</AppText>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors[payer.color] }} />
          <AppText variant="caption" tone="muted">
            {payer.name} paid · {splitLabel(expense)}
          </AppText>
        </View>
      </View>

      <AppText variant="body">{formatCurrency(expense.amount)}</AppText>
    </View>
  );
}

export default function ExpensesScreen() {
  const { colors, spacing } = useAppTheme();
  const insets = useSafeAreaInsets();
  const { handleNavigate, handleAdd } = useDashboardNavigation('expenses');

  const totalSpent = MOCK_EXPENSES.reduce((sum, expense) => sum + expense.amount, 0);
  const groups = EXPENSE_GROUP_ORDER.map((group) => ({
    group,
    expenses: MOCK_EXPENSES.filter((expense) => expense.group === group),
  })).filter(({ expenses }) => expenses.length > 0);

  return (
    <>
      <Screen hasHeader contentStyle={{ paddingBottom: insets.bottom + 112, gap: spacing.lg }}>
        <View style={{ gap: spacing.xs }}>
          <AppText variant="eyebrow">All expenses</AppText>
          <AppText variant="hero">{formatCurrency(totalSpent)}</AppText>
          <AppText variant="caption" tone="muted">
            {MOCK_EXPENSES.length} expenses across the trip
          </AppText>
        </View>

        {groups.map(({ group, expenses }) => (
          <Card key={group} style={{ gap: 0 }}>
            <AppText variant="eyebrow" style={{ marginBottom: spacing.xs }}>
              {group}
            </AppText>
            {expenses.map((expense, index) => (
              <View key={expense.id}>
                <ExpenseRow expense={expense} />
                {index < expenses.length - 1 ? (
                  <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: colors.border }} />
                ) : null}
              </View>
            ))}
          </Card>
        ))}
      </Screen>
      <BottomNav activeKey="expenses" onNavigate={handleNavigate} onAdd={handleAdd} />
    </>
  );
}
