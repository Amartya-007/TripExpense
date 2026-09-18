import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/ui/app-text';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { FadeIn } from '@/components/ui/fade-in';
import { Icon } from '@/components/ui/icon';
import { Screen } from '@/components/ui/screen';
import { PeoplePickerSheet } from '@/features/expenses/components/people-picker-sheet';
import {
  EXPENSE_CATEGORIES,
  getExpense,
  getPerson,
} from '@/features/expenses/expenses-config';
import { useTripData } from '@/features/expenses/trip-data-provider';
import { TRIPS } from '@/features/trips/trips-config';
import { formatFriendlyDate, formatTime } from '@/lib/date/friendly-date';
import { formatCurrency } from '@/lib/format/currency';
import { appToast } from '@/lib/toast/app-toast';
import { useAppTheme } from '@/theme/theme-provider';

const liveTrip = TRIPS.find((trip) => trip.isLive) ?? TRIPS[0];

export default function ExpenseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { colors, radius, spacing } = useAppTheme();
  const { expenses, deleteExpense } = useTripData();

  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [showAllPeople, setShowAllPeople] = useState(false);

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

  const expenseId = expense.id;
  const category = EXPENSE_CATEGORIES[expense.category];
  const payer = getPerson(expense.paidBy);
  const splitCount = expense.splitBetween.length;
  const share = splitCount > 0 ? expense.amount / splitCount : 0;
  const dateKey = expense.dateTime.slice(0, 10);

  function handleEdit() {
    router.push({
      pathname: '/add-expense',
      params: { id: expenseId },
    });
  }

  function handleConfirmDelete() {
    setConfirmingDelete(false);
    deleteExpense(expenseId);
    router.back();
  }

  function handleViewReceipt() {
    appToast.info('Receipt photos are coming soon');
  }

  return (
    <>
      <Screen
        hasHeader
        contentStyle={{
          flex: 1,
          paddingBottom: 80 + insets.bottom,
        }}>
        <FadeIn style={{ flex: 1, justifyContent: 'space-between', gap: spacing.md }}>
          <View style={{ gap: spacing.md }}>
            {/* Hero Section */}
            <View style={{ alignItems: 'center', paddingTop: spacing.xs, gap: spacing.xs }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: spacing.xs,
                  paddingHorizontal: spacing.md,
                  paddingVertical: spacing.xs,
                  borderRadius: radius.pill,
                  backgroundColor: colors.primarySoft,
                }}>
                {category.icon ? <Icon name={category.icon} size={14} color={colors.primary} /> : null}
                <AppText variant="caption" tone="primary" style={{ fontWeight: '800', fontSize: 11 }}>
                  {category.label.toUpperCase()}
                </AppText>
              </View>

              <AppText variant="hero" style={{ fontSize: 40, lineHeight: 46, fontWeight: '900', letterSpacing: -1 }}>
                {formatCurrency(expense.amount)}
              </AppText>

              <AppText variant="subtitle" style={{ fontSize: 18, fontWeight: '700', textAlign: 'center' }} numberOfLines={1}>
                {expense.title}
              </AppText>

              <AppText variant="caption" tone="muted" style={{ fontSize: 12 }}>
                {formatFriendlyDate(dateKey)} · {formatTime(expense.dateTime)} · {liveTrip.place}
              </AppText>
            </View>

            {/* Metrics Row */}
            <View style={{ flexDirection: 'row', gap: spacing.sm }}>
              <View
                style={{
                  flex: 1,
                  padding: spacing.md,
                  borderRadius: radius.lg,
                  backgroundColor: colors.surfaceStrong,
                  borderWidth: 1,
                  borderColor: colors.border,
                  gap: spacing.xs,
                }}>
                <AppText variant="eyebrow" style={{ fontSize: 9 }}>
                  PAID BY
                </AppText>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
                  <Avatar name={payer.name} color={colors[payer.color]} size={24} />
                  <AppText variant="body" style={{ fontWeight: '800', fontSize: 14 }} numberOfLines={1}>
                    {payer.name}
                  </AppText>
                </View>
              </View>

              <View
                style={{
                  flex: 1,
                  padding: spacing.md,
                  borderRadius: radius.lg,
                  backgroundColor: colors.primarySoft,
                  borderWidth: 1,
                  borderColor: colors.primary,
                  gap: spacing.xs,
                }}>
                <AppText variant="eyebrow" tone="primary" style={{ fontSize: 9 }}>
                  YOUR SHARE
                </AppText>
                <AppText variant="body" tone="primary" style={{ fontWeight: '900', fontSize: 16 }}>
                  {formatCurrency(share)}
                </AppText>
              </View>
            </View>

            {/* Split Between Card - Enhanced Spacing & Padding */}
            <Card style={{ paddingHorizontal: spacing.md, paddingVertical: spacing.lg, gap: spacing.md }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
                  <Icon name="person" size={16} color={colors.primary} />
                  <AppText variant="subtitle" style={{ fontSize: 13, fontWeight: '800' }}>
                    Split between {splitCount} people
                  </AppText>
                </View>

                <Pressable onPress={() => setShowAllPeople(true)} hitSlop={8}>
                  <AppText variant="caption" tone="primary" style={{ fontWeight: '800' }}>
                    View all
                  </AppText>
                </Pressable>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: spacing.sm, alignItems: 'center', paddingVertical: spacing.xs }}>
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
                        paddingLeft: spacing.xs,
                        paddingRight: spacing.md,
                        paddingVertical: spacing.xs,
                        borderRadius: radius.pill,
                        backgroundColor: isPayer ? colors.successSoft : colors.surfaceStrong,
                        borderWidth: 1,
                        borderColor: isPayer ? colors.success : colors.border,
                      }}>
                      <Avatar name={person.name} color={colors[person.color]} size={22} />
                      <AppText variant="caption" style={{ fontWeight: '700', fontSize: 12, color: isPayer ? colors.success : colors.text }}>
                        {person.name}
                      </AppText>
                    </View>
                  );
                })}
              </ScrollView>
            </Card>

            {/* Receipt & Note Blocks */}
            {expense.hasReceipt || expense.note ? (
              <View style={{ gap: spacing.xs }}>
                {expense.hasReceipt ? (
                  <Pressable
                    accessibilityRole="button"
                    onPress={handleViewReceipt}
                    style={({ pressed }) => ({
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: spacing.xs,
                      padding: spacing.md,
                      borderRadius: radius.md,
                      borderWidth: 1,
                      borderColor: colors.border,
                      backgroundColor: colors.surfaceStrong,
                      opacity: pressed ? 0.8 : 1,
                    })}>
                    <Icon name="receipt" size={16} color={colors.primary} />
                    <AppText variant="caption" tone="primary" style={{ fontWeight: '800' }}>
                      View Receipt Photo
                    </AppText>
                  </Pressable>
                ) : null}

                {expense.note ? (
                  <Card style={{ padding: spacing.md, gap: spacing.xs,borderRadius:radius.md, backgroundColor: colors.surfaceStrong }}>
                    <AppText variant="eyebrow" style={{ fontSize: 9 }}>
                      NOTE
                    </AppText>
                    <AppText variant="caption" tone="muted" style={{ lineHeight: 18 }}>
                      {expense.note}
                    </AppText>
                  </Card>
                ) : null}
              </View>
            ) : null}
          </View>
        </FadeIn>
      </Screen>

      {/* Floating Action Bar with Safe Area Bottom Padding */}
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: colors.surface,
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: colors.border,
          paddingHorizontal: spacing.lg,
          paddingTop: spacing.md,
          paddingBottom: Math.max(spacing.md, insets.bottom + spacing.xs),
          flexDirection: 'row',
          gap: spacing.sm,
          elevation: 12,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.1,
          shadowRadius: 6,
        }}>
        <Button label="Edit" variant="outline" onPress={handleEdit} style={{ flex: 1, height: 48, borderRadius: radius.pill }} />
        <Button label="Delete" variant="danger" onPress={() => setConfirmingDelete(true)} style={{ flex: 1, height: 48, borderRadius: radius.pill }} />
      </View>

      <PeoplePickerSheet
        visible={showAllPeople}
        onClose={() => setShowAllPeople(false)}
        mode="multiple"
        selected={expense.splitBetween}
        onChange={() => undefined}
        title="Split details"
        subtitle={`${splitCount} ${splitCount === 1 ? 'person' : 'people'}`}
        payerId={expense.paidBy}
        readOnly
      />

      <ConfirmDialog
        visible={confirmingDelete}
        title="Delete expense?"
        body={`${formatCurrency(expense.amount)} · ${category.label} will be permanently removed.`}
        confirmLabel="Delete"
        tone="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmingDelete(false)}
      />
    </>
  );
}