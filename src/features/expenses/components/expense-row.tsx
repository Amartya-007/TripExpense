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

  return `Split btw: ${names.join(', ')}${
    expense.splitBetween.length > 2 ? ', ...' : ''
  }`;
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
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        paddingVertical: spacing.sm,
        opacity: pressed ? 0.7 : 1,
      })}>
      {/* GRID COLUMN 1: ICON */}
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: radius.md,
          backgroundColor: colors.surfaceStrong,
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          marginRight: spacing.md,
        }}>
        <Icon
          name={category.icon}
          size={18}
          color={colors.textMuted}
        />
      </View>

      {/* GRID COLUMNS 2 + 3 */}
      <View
        style={{
          flex: 1,
          minWidth: 0,
          flexDirection: 'row',
          alignItems: 'center',
        }}>
        {/* GRID COLUMN 2: TITLE + PAYMENT INFO */}
        <View
          style={{
            flex: 1,
            minWidth: 0,
            paddingRight: spacing.md,
          }}>
          <AppText
            variant="body"
            numberOfLines={1}
            ellipsizeMode="tail"
            style={{
              fontWeight: '600',
            }}>
            {expense.title}
          </AppText>

          <AppText
            variant="caption"
            tone="muted"
            numberOfLines={1}
            ellipsizeMode="tail"
            style={{
              marginTop: 3,
            }}>
            {payer.name} paid · {splitLabel(expense)}
          </AppText>
        </View>

        {/* GRID COLUMN 3: AMOUNT + TIME */}
        <View
          style={{
            width: 82,
            flexShrink: 0,
            alignItems: 'flex-end',
          }}>
          <AppText
            variant="body"
            numberOfLines={1}
            style={{
              fontWeight: '700',
              textAlign: 'right',
            }}>
            {formatCurrency(expense.amount)}
          </AppText>

          <AppText
            variant="caption"
            tone="muted"
            numberOfLines={1}
            style={{
              marginTop: 3,
              textAlign: 'right',
            }}>
            {formatTime(expense.dateTime)}
          </AppText>
        </View>
      </View>
    </Pressable>
  );
}
