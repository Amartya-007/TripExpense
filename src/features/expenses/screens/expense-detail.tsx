import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { FadeIn } from '@/components/ui/fade-in';
import { Icon } from '@/components/ui/icon';
import { Screen } from '@/components/ui/screen';
import { EXPENSE_CATEGORIES, getExpense, getPerson } from '@/features/expenses/expenses-config';
import { useTripData } from '@/features/expenses/trip-data-provider';
import { TRIPS } from '@/features/trips/trips-config';
import { formatFriendlyDate, formatTime } from '@/lib/date/friendly-date';
import { appToast } from '@/lib/toast/app-toast';
import { useAppTheme } from '@/theme/theme-provider';

function formatCurrency(amount: number) {
  return `₹${amount.toLocaleString('en-IN')}`;
}

// Exactly one trip in TRIPS is marked isLive - see trips-config.ts.
const liveTrip = TRIPS.find((trip) => trip.isLive) ?? TRIPS[0];

export default function ExpenseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, radius, spacing } = useAppTheme();
  const { expenses, deleteExpense } = useTripData();
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const expense = getExpense(expenses, id);

  if (!expense) {
    return (
      <Screen hasHeader>
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

  function handleViewReceipt() {
    appToast.info('Receipt photos are coming soon');
  }

  return (
    <>
      <Screen hasHeader>
        <FadeIn style={{ gap: spacing.xl }}>
          <Card style={{ gap: spacing.lg }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View>
                <AppText variant="eyebrow">Amount</AppText>
                <AppText variant="hero">{formatCurrency(expense.amount)}</AppText>
              </View>
              <View style={{ borderRadius: radius.pill, backgroundColor: colors.primarySoft, paddingHorizontal: spacing.md, paddingVertical: spacing.xs }}>
                <AppText variant="caption" tone="primary" style={{ fontWeight: '800' }}>
                  {category.label}
                </AppText>
              </View>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
              <Icon name="calendar" size={16} color={colors.textMuted} />
              <AppText variant="caption" tone="muted">
                {formatFriendlyDate(dateKey)} · {liveTrip.place}
              </AppText>
              <AppText variant="caption" tone="muted" style={{ marginLeft: 'auto' }}>
                added {formatTime(expense.dateTime)}
              </AppText>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ gap: spacing.xs }}>
                <AppText variant="eyebrow">Paid by</AppText>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                  <Avatar name={payer.name} color={colors[payer.color]} size={28} />
                  <AppText variant="subtitle">{payer.name}</AppText>
                </View>
              </View>
              {expense.hasReceipt ? (
                <Pressable accessibilityRole="button" accessibilityLabel="View receipt" onPress={handleViewReceipt} hitSlop={8}>
                  <AppText variant="caption" tone="primary" style={{ fontWeight: '800' }}>
                    View receipt
                  </AppText>
                </Pressable>
              ) : null}
            </View>

            <View style={{ gap: spacing.sm }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
                <Icon name="person" size={14} color={colors.textMuted} />
                <AppText variant="eyebrow">Split between · {expense.splitBetween.length} people</AppText>
              </View>

              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
                {expense.splitBetween.map((personId) => {
                  const person = getPerson(personId);
                  const isPayer = personId === expense.paidBy;

                  return (
                    <View
                      key={personId}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: spacing.xs,
                        paddingHorizontal: spacing.md,
                        paddingVertical: spacing.sm,
                        borderRadius: radius.lg,
                        borderWidth: 1,
                        borderColor: isPayer ? colors.success : colors.border,
                        backgroundColor: isPayer ? colors.successSoft : colors.surfaceStrong,
                      }}>
                      <Avatar name={person.name} color={colors[person.color]} size={18} />
                      <AppText variant="caption" style={{ color: isPayer ? colors.success : colors.text, fontWeight: '700' }}>
                        {person.name}
                      </AppText>
                      {isPayer ? (
                        <AppText variant="caption" style={{ color: colors.success, fontWeight: '800' }}>
                          paid
                        </AppText>
                      ) : null}
                    </View>
                  );
                })}
              </View>

              <View style={{ borderRadius: radius.lg, borderWidth: 1, borderColor: colors.warning, backgroundColor: colors.warningSoft, padding: spacing.md, gap: 2 }}>
                <AppText variant="caption" style={{ color: colors.warning, fontWeight: '800' }}>
                  Per person share
                </AppText>
                <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: spacing.xs }}>
                  <AppText variant="subtitle" style={{ color: colors.warning }}>
                    {formatCurrency(share)}
                  </AppText>
                  <AppText variant="caption" style={{ color: colors.warning }}>
                    each
                  </AppText>
                </View>
                <AppText variant="caption" style={{ color: colors.warning, opacity: 0.85 }}>
                  Each selected person owes this amount.
                </AppText>
              </View>
            </View>

            {expense.note ? (
              <View style={{ gap: spacing.xs }}>
                <AppText variant="eyebrow">Note</AppText>
                <AppText tone="muted">{expense.note}</AppText>
              </View>
            ) : null}
          </Card>

          <View style={{ flexDirection: 'row', gap: spacing.md }}>
            <Button label="Edit" variant="outline" onPress={handleEdit} style={{ flex: 1 }} />
            <Button label="Delete" variant="danger" onPress={() => setConfirmingDelete(true)} style={{ flex: 1 }} />
          </View>
        </FadeIn>
      </Screen>

      <ConfirmDialog
        visible={confirmingDelete}
        title="Delete expense?"
        body={`${formatCurrency(expense.amount)} · ${category.label} will be permanently removed. This can't be undone.`}
        confirmLabel="Delete"
        tone="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmingDelete(false)}
      />
    </>
  );
}
