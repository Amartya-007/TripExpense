import { useBottomTabBarHeight } from 'expo-router/js-tabs';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { FadeIn } from '@/components/ui/fade-in';
import { Icon, type IconName } from '@/components/ui/icon';
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
type SortOption = 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc';

const FILTERS: { key: CategoryFilter; label: string; icon?: IconName }[] = [
  { key: 'all', label: 'All expenses', icon: 'list' },
  ...(Object.entries(EXPENSE_CATEGORIES) as [ExpenseCategory, { label: string; icon: IconName }][]).map(([key, value]) => ({
    key,
    label: value.label,
    icon: value.icon,
  })),
];

export default function ExpensesScreen() {
  const { colors, radius, spacing } = useAppTheme();
  const tabBarHeight = useBottomTabBarHeight();
  const { expenses } = useTripData();
  const { refreshing, onRefresh } = useMockRefresh();
  
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<CategoryFilter>('all');
  const [sortBy, setSortBy] = useState<SortOption>('date-desc');
  const [showSortMenu, setShowSortMenu] = useState(false);

  const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  // Compute item counts per category for the filter chips metadata
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: expenses.length };
    for (const exp of expenses) {
      counts[exp.category] = (counts[exp.category] || 0) + 1;
    }
    return counts;
  }, [expenses]);

  const filteredAndSortedExpenses = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    
    // 1. Filter by category and search query
    const filtered = expenses.filter((expense) => {
      if (filter !== 'all' && expense.category !== filter) return false;
      if (normalizedQuery && !expense.title.toLowerCase().includes(normalizedQuery)) return false;
      return true;
    });

    // 2. Sort safely by creating a shallow copy first using spread [...filtered]
    return [...filtered].sort((a, b) => {
      const timeA = new Date(a.dateTime).getTime();
      const timeB = new Date(b.dateTime).getTime();

      if (sortBy === 'date-desc') return timeB - timeA;
      if (sortBy === 'date-asc') return timeA - timeB;
      if (sortBy === 'amount-desc') return b.amount - a.amount;
      return a.amount - b.amount;
    });
  }, [expenses, filter, query, sortBy]);

  const groups = groupExpensesByDate(filteredAndSortedExpenses);

  const sortLabels: Record<SortOption, string> = {
    'date-desc': 'Newest first',
    'date-asc': 'Oldest first',
    'amount-desc': 'Highest amount',
    'amount-asc': 'Lowest amount',
  };

  return (
    <Screen contentStyle={{ paddingBottom: tabBarHeight + spacing.lg }} onRefresh={onRefresh} refreshing={refreshing}>
      <FadeIn style={{ gap: spacing.lg }}>
        {/* Header Section */}
        <View style={{ gap: spacing.xs }}>
          <AppText variant="eyebrow">All expenses</AppText>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <AppText variant="hero">{formatCurrency(totalSpent)}</AppText>
            
            {/* Sort Dropdown Toggle Button */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Sort expenses"
              onPress={() => setShowSortMenu((prev) => !prev)}
              style={({ pressed }) => [
                {
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: spacing.xs,
                  paddingHorizontal: spacing.md,
                  paddingVertical: spacing.sm,
                  borderRadius: radius.pill,
                  borderWidth: 1,
                  borderColor: colors.border,
                  backgroundColor: colors.surface,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}>
              <Icon name="filter" size={14} color={colors.textMuted} />
              <AppText variant="caption" style={{ fontWeight: '700' }}>
                {sortLabels[sortBy]}
              </AppText>
              <Icon name="chevronDown" size={14} color={colors.textMuted} />
            </Pressable>
          </View>
          <AppText variant="caption" tone="muted">
            {expenses.length} expenses across the trip
          </AppText>
        </View>

        {/* Sort Menu Options Popup Drawer / Accordion */}
        {showSortMenu ? (
          <Card style={{ padding: spacing.sm, gap: 2, backgroundColor: colors.surfaceStrong }}>
            {(Object.keys(sortLabels) as SortOption[]).map((optionKey) => {
              const isSelected = sortBy === optionKey;
              return (
                <Pressable
                  key={optionKey}
                  accessibilityRole="button"
                  onPress={() => {
                    setSortBy(optionKey);
                    setShowSortMenu(false);
                  }}
                  style={({ pressed }) => [
                    {
                      paddingVertical: spacing.sm,
                      paddingHorizontal: spacing.md,
                      borderRadius: radius.md,
                      backgroundColor: isSelected ? colors.primarySoft : 'transparent',
                      opacity: pressed ? 0.7 : 1,
                    },
                  ]}>
                  <AppText
                    variant="caption"
                    style={{
                      color: isSelected ? colors.primary : colors.text,
                      fontWeight: isSelected ? '800' : '600',
                    }}>
                    {sortLabels[optionKey]}
                  </AppText>
                </Pressable>
              );
            })}
          </Card>
        ) : null}

        {/* Search Bar */}
        <Input
          placeholder="Search expenses..."
          leftIcon="search"
          variant="filled"
          value={query}
          onChangeText={setQuery}
          returnKeyType="search"
        />

        {/* Modern Horizontal Scrollable Filter Chips Bar */}
        <View style={{ marginHorizontal: -spacing.xl }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: spacing.xl, gap: spacing.sm, alignItems: 'center' }}>
            {FILTERS.map((item) => {
              const selected = filter === item.key;
              const count = categoryCounts[item.key] || 0;

              return (
                <Pressable
                  key={item.key}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  onPress={() => setFilter(item.key)}
                  style={({ pressed }) => [
                    {
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: spacing.xs,
                      paddingLeft: item.icon ? spacing.sm : spacing.md,
                      paddingRight: spacing.md,
                      paddingVertical: spacing.sm + 2,
                      borderRadius: radius.pill,
                      borderWidth: 1,
                      borderColor: selected ? colors.primary : colors.border,
                      backgroundColor: selected ? colors.primary : colors.surface,
                      opacity: pressed ? 0.8 : 1,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: selected ? 0.15 : 0.03,
                      shadowRadius: 2,
                      elevation: selected ? 2 : 0,
                    },
                  ]}>
                  {item.icon ? (
                    <Icon
                      name={item.icon}
                      size={14}
                      color={selected ? colors.primaryForeground : colors.textMuted}
                    />
                  ) : null}
                  <AppText
                    variant="caption"
                    style={{
                      color: selected ? colors.primaryForeground : colors.text,
                      fontWeight: selected ? '800' : '600',
                    }}>
                    {item.label}
                  </AppText>
                  
                  {/* Badge count pill inside chip */}
                  <View
                    style={{
                      paddingHorizontal: 6,
                      paddingVertical: 1,
                      borderRadius: 10,
                      backgroundColor: selected ? 'rgba(255,255,255,0.25)' : colors.surfaceStrong,
                    }}>
                    <AppText
                      variant="caption"
                      style={{
                        fontSize: 10,
                        color: selected ? colors.primaryForeground : colors.textMuted,
                        fontWeight: '800',
                      }}>
                      {count}
                    </AppText>
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Expenses List Groups */}
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