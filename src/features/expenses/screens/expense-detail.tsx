import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/ui/app-text';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { FadeIn } from '@/components/ui/fade-in';
import { GradientPanel } from '@/components/ui/gradient-panel';
import { HeaderIconButton } from '@/components/ui/header-icon-button';
import { Icon } from '@/components/ui/icon';
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
  const insets = useSafeAreaInsets();
  const { expenses, deleteExpense } = useTripData();
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const expense = getExpense(expenses, id);

  function handleClose() {
    router.back();
  }

  if (!expense) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top + spacing.lg, paddingHorizontal: spacing.xl }}>
        <AppText variant="body" tone="muted">
          This expense no longer exists.
        </AppText>
      </View>
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
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={{ paddingTop: insets.top + spacing.sm, paddingHorizontal: spacing.lg, gap: spacing.sm }}>
          <View style={{ alignSelf: 'center', width: 40, height: 5, borderRadius: 3, backgroundColor: colors.border }} />
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
            <View style={{ borderRadius: radius.pill, backgroundColor: colors.surfaceStrong }}>
              <HeaderIconButton accessibilityLabel="Close" icon="close" onPress={handleClose} />
            </View>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + spacing.xl, gap: spacing.lg }}>
          <FadeIn style={{ gap: spacing.lg }}>
            <GradientPanel from={category.gradientFrom} to={category.gradientTo} icon={category.icon} iconSize={40} height={168} />

            <View style={{ paddingHorizontal: spacing.xl, gap: spacing.xs }}>
              <AppText variant="title">{expense.title}</AppText>
              <AppText variant="hero" tone="primary">
                {formatCurrency(expense.amount)}
              </AppText>
              <AppText variant="caption" tone="muted">
                {formatFriendlyDate(dateKey)} · {formatTime(expense.dateTime)} · {liveTrip.place}
              </AppText>
            </View>

            <View style={{ paddingHorizontal: spacing.xl, gap: spacing.lg }}>
              <Card style={{ gap: spacing.md }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View style={{ gap: spacing.xs }}>
                    <AppText variant="caption" tone="muted">
                      Paid by
                    </AppText>
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
              </Card>

              <View style={{ gap: spacing.sm }}>
                <AppText variant="eyebrow">Split between ({expense.splitBetween.length})</AppText>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
                  {expense.splitBetween.map((personId) => {
                    const person = getPerson(personId);
                    return (
                      <View
                        key={personId}
                        style={{
                          flexBasis: '47%',
                          flexGrow: 1,
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: spacing.sm,
                          padding: spacing.md,
                          borderRadius: radius.lg,
                          borderWidth: 1,
                          borderColor: colors.border,
                          backgroundColor: colors.surface,
                        }}>
                        <Avatar name={person.name} color={colors[person.color]} size={32} />
                        <View>
                          <AppText variant="body">{person.name}</AppText>
                          <AppText variant="caption" tone="muted">
                            {formatCurrency(share)}
                          </AppText>
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>

              <Card>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <AppText variant="body">Category</AppText>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
                    <AppText variant="body" tone="muted">
                      {category.label}
                    </AppText>
                    <Icon name="chevronRight" size={16} color={colors.textMuted} />
                  </View>
                </View>
              </Card>

              {expense.note ? (
                <View style={{ gap: spacing.sm }}>
                  <AppText variant="eyebrow">Notes</AppText>
                  <AppText tone="muted">{expense.note}</AppText>
                </View>
              ) : null}

              <View style={{ flexDirection: 'row', gap: spacing.md }}>
                <Button label="Edit" variant="outline" onPress={handleEdit} style={{ flex: 1 }} />
                <Button label="Delete" variant="danger" onPress={() => setConfirmingDelete(true)} style={{ flex: 1 }} />
              </View>
            </View>
          </FadeIn>
        </ScrollView>
      </View>

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
