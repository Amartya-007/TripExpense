import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/ui/app-text';
import { Card } from '@/components/ui/card';
import { FadeIn } from '@/components/ui/fade-in';
import { Icon } from '@/components/ui/icon';
import { Screen } from '@/components/ui/screen';
import {
  EXPENSE_CATEGORIES,
  getPerson,
  groupExpensesByDate,
  type Expense,
} from '@/features/expenses/expenses-config';
import { useTripData } from '@/features/expenses/trip-data-provider';
import { BottomNav } from '@/features/home/components/bottom-nav';
import { useDashboardNavigation } from '@/features/home/use-dashboard-navigation';
import { formatTime } from '@/lib/date/friendly-date';
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
    <Pressable
      accessibilityRole="button"
      onPress={() => router.push({ pathname: '/expense/[id]', params: { id: expense.id } })}
      style={({ pressed }) => [
        { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm, opacity: pressed ? 0.7 : 1 },
      ]}>
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

      <View style={{ alignItems: 'flex-end', gap: 2 }}>
        <AppText variant="body">{formatCurrency(expense.amount)}</AppText>
        <AppText variant="caption" tone="muted">
          {formatTime(expense.dateTime)}
        </AppText>
      </View>
    </Pressable>
  );
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
