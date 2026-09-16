import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { FadeIn } from '@/components/ui/fade-in';
import { Input } from '@/components/ui/input';
import { Screen } from '@/components/ui/screen';
import { ExpenseRow } from '@/features/expenses/components/expense-row';
import { EXPENSE_CATEGORIES, groupExpensesByDate, type ExpenseCategory } from '@/features/expenses/expenses-config';
import { useTripData } from '@/features/expenses/trip-data-provider';
import { useMockRefresh } from '@/lib/hooks/use-mock-refresh';
import { useAppTheme } from '@/theme/theme-provider';

function formatCurrency(amount: number) {
  return `₹${amount.toLocaleString('en-IN')}`;
}

type CategoryFilter = ExpenseCategory | 'all';

const FILTERS: { key: CategoryFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  ...(Object.entries(EXPENSE_CATEGORIES) as [ExpenseCategory, { label: string }][]).map(([key, value]) => ({ key, label: value.label })),
];

export default function ExpensesScreen() {
  const { colors, radius, spacing } = useAppTheme();
  const { expenses } = useTripData();
  const { refreshing, onRefresh } = useMockRefresh();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<CategoryFilter>('all');

  const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  const filteredExpenses = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return expenses.filter((expense) => {
      if (filter !== 'all' && expense.category !== filter) return false;
      if (normalizedQuery && !expense.title.toLowerCase().includes(normalizedQuery)) return false;
      return true;
    });
  }, [expenses, filter, query]);

  const groups = groupExpensesByDate(filteredExpenses);

  return (
    <Screen onRefresh={onRefresh} refreshing={refreshing}>
      <FadeIn style={{ gap: spacing.lg }}>
      <View style={{ gap: spacing.xs }}>
        <AppText variant="eyebrow">All expenses</AppText>
        <AppText variant="hero">{formatCurrency(totalSpent)}</AppText>
        <AppText variant="caption" tone="muted">
          {expenses.length} expenses across the trip
        </AppText>
      </View>

      <Input placeholder="Search expenses..." leftIcon="search" variant="filled" value={query} onChangeText={setQuery} returnKeyType="search" />

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
        {FILTERS.map((item) => {
          const selected = filter === item.key;
          return (
            <Pressable
              key={item.key}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => setFilter(item.key)}
              style={{
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.sm,
                borderRadius: radius.pill,
                backgroundColor: selected ? colors.primary : colors.surfaceStrong,
              }}>
              <AppText variant="caption" style={{ color: selected ? colors.primaryForeground : colors.textMuted, fontWeight: '700' }}>
                {item.label}
              </AppText>
            </Pressable>
          );
        })}
      </View>

      {groups.length === 0 ? (
        <EmptyState title="No expenses found" body="Try a different search term or category filter." />
      ) : (
        groups.map(({ dateKey, label, expenses: dayExpenses }) => (
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
        ))
      )}
      </FadeIn>
    </Screen>
  );
}

