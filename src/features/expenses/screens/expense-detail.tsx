import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { FadeIn } from '@/components/ui/fade-in';
import { Icon } from '@/components/ui/icon';
import { Screen } from '@/components/ui/screen';
import { EXPENSE_CATEGORIES, getExpense, getPerson } from '@/features/expenses/expenses-config';
import { useTripData } from '@/features/expenses/trip-data-provider';
import { formatFriendlyDate, formatTime } from '@/lib/date/friendly-date';
import { useAppTheme } from '@/theme/theme-provider';

function formatCurrency(amount: number) {
  return `₹${amount.toLocaleString('en-IN')}`;
}

export default function ExpenseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, radius, spacing } = useAppTheme();
  const insets = useSafeAreaInsets();
  const { expenses, deleteExpense } = useTripData();
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const expense = getExpense(expenses, id);

  if (!expense) {
    return (
      <Screen hasHeader contentStyle={{ paddingBottom: insets.bottom + spacing.xl, gap: spacing.lg }}>
        <AppText variant="body" tone="muted">
          This expense no longer exists.
        </AppText>
      </Screen>
    );
  }

  const category = EXPENSE_CATEGORIES[expense.category];
  const payer = getPerson(expense.paidBy);
  const share = expense.amount / expense.splitBetween.length;
  const dateKey = expense.dateTime.slice(0, 10);

  function handleEdit() {
    router.push({ pathname: '/add-expense', params: { id: expense!.id } });
  }

  function handleConfirmDelete() {
    setConfirmingDelete(false);
    deleteExpense(expense!.id);
    router.back();
  }

  return (
    <>
      <Screen hasHeader contentStyle={{ paddingBottom: insets.bottom + spacing.xl, gap: spacing.lg }}>
        <FadeIn style={{ gap: spacing.lg }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <View style={{ gap: spacing.xs }}>
              <AppText variant="caption" tone="muted">
                Amount
              </AppText>
              <AppText variant="hero">{formatCurrency(expense.amount)}</AppText>
            </View>
            <View style={{ alignItems: 'flex-end', gap: spacing.xs }}>
              <AppText variant="caption" tone="muted">
                {formatFriendlyDate(dateKey)}
              </AppText>
              <AppText variant="caption" tone="muted">
                {formatTime(expense.dateTime)}
              </AppText>
            </View>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: radius.md,
                backgroundColor: colors.surfaceStrong,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Icon name={category.icon} size={20} color={colors.textMuted} />
            </View>
            <View style={{ flex: 1 }}>
              <AppText variant="subtitle">{expense.title}</AppText>
              <AppText variant="caption" tone="muted">
                {category.label}
              </AppText>
            </View>
          </View>

          <Card style={{ gap: spacing.md }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <AppText variant="caption" tone="muted">
                Paid by
              </AppText>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors[payer.color] }} />
                <AppText variant="body">{payer.name}</AppText>
              </View>
            </View>

            <View style={{ gap: spacing.sm }}>
              <AppText variant="caption" tone="muted">
                Split between
              </AppText>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
                {expense.splitBetween.map((personId) => {
                  const person = getPerson(personId);
                  return (
                    <View
                      key={personId}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: spacing.xs,
                        paddingHorizontal: spacing.md,
                        paddingVertical: spacing.xs,
                        borderRadius: radius.pill,
                        backgroundColor: colors.surfaceStrong,
                      }}>
                      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors[person.color] }} />
                      <AppText variant="caption">{person.name}</AppText>
                    </View>
                  );
                })}
              </View>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <AppText variant="caption" tone="muted">
                Per person
              </AppText>
              <AppText variant="body">{formatCurrency(share)} each</AppText>
            </View>
          </Card>

          <View style={{ flexDirection: 'row', gap: spacing.md }}>
            <Button label="Edit" variant="secondary" onPress={handleEdit} style={{ flex: 1 }} />
            <Button label="Delete" variant="danger" onPress={() => setConfirmingDelete(true)} style={{ flex: 1 }} />
          </View>
        </FadeIn>
      </Screen>

      <ConfirmDialog
        visible={confirmingDelete}
        title="Delete expense?"
        body={`This removes "${expense.title}" and updates everyone's balance.`}
        confirmLabel="Delete"
        tone="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmingDelete(false)}
      />
    </>
  );
}
