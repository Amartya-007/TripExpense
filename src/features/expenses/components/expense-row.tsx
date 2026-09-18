import { router } from 'expo-router';
import { Pressable, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Icon } from '@/components/ui/icon';
import {
  EXPENSE_CATEGORIES,
  getPerson,
  type Expense,
} from '@/features/expenses/expenses-config';
import { formatTime } from '@/lib/date/friendly-date';
import { formatCurrency } from '@/lib/format/currency';
import { useAppTheme } from '@/theme/theme-provider';

function splitLabel(expense: Expense) {
  if (expense.splitBetween.length === 0) {
    return 'Split btw: No one';
  }

  const names = expense.splitBetween
    .slice(0, 2)
    .map((id) => getPerson(id).name);

  return `Split btw: ${names.join(', ')}${expense.splitBetween.length > 2 ? ', ...' : ''}`;
}

export function ExpenseRow({ expense }: { expense: Expense }) {
  const { colors, radius, spacing } = useAppTheme();
  const category = EXPENSE_CATEGORIES[expense.category];
  const payer = getPerson(expense.paidBy);

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() =>
        router.push({
          pathname: '/expense/[id]',
          params: { id: expense.id },
        })
      }
      style={({ pressed }) => [
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.md,
          paddingVertical: spacing.sm,
          opacity: pressed ? 0.7 : 1,
        },
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

      <View
        style={{
          flex: 1,
          minWidth: 0,
          gap: 2,
        }}>
        <AppText variant="body" numberOfLines={1} ellipsizeMode="tail">
          {expense.title}
        </AppText>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.xs,
            minWidth: 0,
          }}>
          
          <AppText
            variant="caption"
            tone="muted"
            numberOfLines={1}
            ellipsizeMode="tail"
            style={{ flex: 1 }}>
            {payer.name} paid · {splitLabel(expense)}
          </AppText>
        </View>
      </View>

      <View
        style={{
          alignItems: 'flex-end',
          gap: 2,
          flexShrink: 0,
        }}>
        <AppText variant="body" numberOfLines={1}>
          {formatCurrency(expense.amount)}
        </AppText>

        <AppText variant="caption" tone="muted" numberOfLines={1}>
          {formatTime(expense.dateTime)}
        </AppText>
      </View>
    </Pressable>
  );
}