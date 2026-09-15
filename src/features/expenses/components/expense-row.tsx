import { router } from 'expo-router';
import { Pressable, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Icon } from '@/components/ui/icon';
import { EXPENSE_CATEGORIES, getPerson, type Expense } from '@/features/expenses/expenses-config';
import { formatTime } from '@/lib/date/friendly-date';
import { useAppTheme } from '@/theme/theme-provider';

function formatCurrency(amount: number) {
  return `₹${amount.toLocaleString('en-IN')}`;
}

function splitLabel(expense: Expense) {
  if (expense.splitBetween.length === 4) return 'Split 4 ways';
  return `Split: ${expense.splitBetween.map((id) => getPerson(id).name).join(', ')}`;
}

export function ExpenseRow({ expense }: { expense: Expense }) {
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
