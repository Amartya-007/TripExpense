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
import { PeoplePickerSheet } from '@/features/expenses/components/people-picker-sheet';
import {
  EXPENSE_CATEGORIES,
  getExpense,
  getPerson,
} from '@/features/expenses/expenses-config';
import { useTripData } from '@/features/expenses/trip-data-provider';
import { TRIPS } from '@/features/trips/trips-config';
import { formatFriendlyDate, formatTime } from '@/lib/date/friendly-date';
import { appToast } from '@/lib/toast/app-toast';
import { useAppTheme } from '@/theme/theme-provider';

function formatCurrency(amount: number) {
  return `₹${amount.toLocaleString('en-IN')}`;
}

// Exactly one trip in TRIPS is marked isLive.
const liveTrip = TRIPS.find((trip) => trip.isLive) ?? TRIPS[0];

const MAX_VISIBLE_PEOPLE = 5;

export default function ExpenseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
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

  const visiblePeople = expense.splitBetween.slice(
    0,
    MAX_VISIBLE_PEOPLE,
  );

  const remainingPeopleCount = Math.max(
    0,
    expense.splitBetween.length - MAX_VISIBLE_PEOPLE,
  );

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
      <Screen hasHeader>
        <FadeIn style={{ gap: spacing.md }}>
          {/* Expense summary */}
          <Card style={{ gap: spacing.md }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: spacing.sm,
              }}>
              <View
                style={{
                  flex: 1,
                  minWidth: 0,
                  gap: spacing.xs,
                }}>
                <AppText variant="eyebrow">Amount</AppText>

                <AppText
                  variant="hero"
                  style={{
                    fontSize: 30,
                    lineHeight: 36,
                  }}>
                  {formatCurrency(expense.amount)}
                </AppText>

                <AppText
                  variant="subtitle"
                  numberOfLines={2}
                  style={{
                    marginTop: spacing.xs,
                    fontSize: 16,
                  }}>
                  {expense.title}
                </AppText>
              </View>

              <View
                style={{
                  flexShrink: 0,
                  borderRadius: radius.pill,
                  backgroundColor: colors.primarySoft,
                  paddingHorizontal: spacing.md,
                  paddingVertical: spacing.xs,
                }}>
                <AppText
                  variant="caption"
                  tone="primary"
                  style={{ fontWeight: '800' }}>
                  {category.label}
                </AppText>
              </View>
            </View>

            <View
              style={{
                height: 1,
                backgroundColor: colors.border,
              }}
            />

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'flex-start',
                gap: spacing.sm,
              }}>
              <Icon
                name="calendar"
                size={18}
                color={colors.textMuted}
              />

              <View
                style={{
                  flex: 1,
                  gap: spacing.xs,
                }}>
                <AppText variant="body">
                  {formatFriendlyDate(dateKey)} · {liveTrip.place}
                </AppText>

                <AppText variant="caption" tone="muted">
                  Added at {formatTime(expense.dateTime)}
                </AppText>
              </View>
            </View>

            <View style={{ gap: spacing.xs }}>
              <AppText variant="eyebrow">Paid by</AppText>

              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: spacing.sm,
                }}>
                <Avatar
                  name={payer.name}
                  color={colors[payer.color]}
                  size={34}
                />

                <AppText variant="subtitle">
                  {payer.name}
                </AppText>
              </View>
            </View>

            {expense.hasReceipt ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="View receipt"
                onPress={handleViewReceipt}
                hitSlop={8}
                style={({ pressed }) => ({
                  flexDirection: 'row',
                  alignItems: 'center',
                  alignSelf: 'flex-start',
                  gap: spacing.xs,
                  opacity: pressed ? 0.7 : 1,
                })}>
                <Icon
                  name="receipt"
                  size={18}
                  color={colors.primary}
                />

                <AppText
                  variant="caption"
                  tone="primary"
                  style={{ fontWeight: '800' }}>
                  View receipt
                </AppText>
              </Pressable>
            ) : null}
          </Card>

          {/* Split details */}
          <Card style={{ gap: spacing.md }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing.sm,
              }}>
              <Icon
                name="person"
                size={18}
                color={colors.primary}
              />

              <AppText
                variant="subtitle"
                style={{ color: colors.primary }}>
                Split between · {splitCount} people
              </AppText>
            </View>

            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: spacing.xs,
              }}>
              {visiblePeople.map((personId) => {
                const person = getPerson(personId);
                const isPayer = personId === expense.paidBy;

                return (
                  <View
                    key={personId}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: spacing.xs,
                      maxWidth: '100%',
                      paddingHorizontal: spacing.sm,
                      paddingVertical: spacing.xs,
                      borderRadius: radius.pill,
                      borderWidth: 1,
                      borderColor: isPayer
                        ? colors.success
                        : colors.border,
                      backgroundColor: isPayer
                        ? colors.successSoft
                        : colors.surfaceStrong,
                    }}>
                    <Avatar
                      name={person.name}
                      color={colors[person.color]}
                      size={24}
                    />

                    <AppText
                      variant="caption"
                      numberOfLines={1}
                      style={{
                        flexShrink: 1,
                        color: isPayer
                          ? colors.success
                          : colors.text,
                        fontWeight: '700',
                      }}>
                      {person.name}
                    </AppText>

                    {isPayer ? (
                      <AppText
                        variant="caption"
                        style={{
                          color: colors.success,
                          fontWeight: '800',
                        }}>
                        paid
                      </AppText>
                    ) : null}
                  </View>
                );
              })}

              {remainingPeopleCount > 0 ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Show ${remainingPeopleCount} more people`}
                  accessibilityHint="Opens the complete split member list"
                  onPress={() => setShowAllPeople(true)}
                  style={({ pressed }) => ({
                    minHeight: 32,
                    justifyContent: 'center',
                    paddingHorizontal: spacing.sm,
                    borderRadius: radius.pill,
                    backgroundColor: colors.primarySoft,
                    opacity: pressed ? 0.7 : 1,
                  })}>
                  <AppText
                    variant="caption"
                    style={{
                      color: colors.primary,
                      fontWeight: '800',
                    }}>
                    +{remainingPeopleCount}
                  </AppText>
                </Pressable>
              ) : null}
            </View>

            {/* Per person share */}
            <View
              style={{
                borderRadius: radius.lg,
                borderWidth: 1,
                borderColor: colors.info,
                backgroundColor: colors.infoSoft,
                padding: spacing.md,
                gap: spacing.xs,
              }}>
              <AppText
                variant="caption"
                style={{
                  color: colors.info,
                  fontWeight: '800',
                }}>
                Per person share
              </AppText>

              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'baseline',
                  gap: spacing.xs,
                }}>
                <AppText
                  variant="subtitle"
                  style={{
                    color: colors.text,
                    fontSize: 21,
                    fontWeight: '800',
                  }}>
                  {formatCurrency(share)}
                </AppText>

                <AppText
                  variant="caption"
                  style={{ color: colors.textMuted }}>
                  each
                </AppText>
              </View>

              <AppText
                variant="caption"
                tone="muted">
                Split equally among {splitCount} people.
              </AppText>
            </View>
          </Card>

          {/* Note */}
          {expense.note ? (
            <Card style={{ gap: spacing.sm }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: spacing.sm,
                }}>
                <Icon
                  name="note"
                  size={18}
                  color={colors.primary}
                />

                <AppText
                  variant="subtitle"
                  style={{ color: colors.primary }}>
                  Note
                </AppText>
              </View>

              <AppText tone="muted">
                {expense.note}
              </AppText>
            </Card>
          ) : null}

          {/* Actions */}
          <View
            style={{
              flexDirection: 'row',
              gap: spacing.sm,
              marginTop: spacing.xs,
            }}>
            <Button
              label="Edit"
              variant="outline"
              onPress={handleEdit}
              style={{ flex: 1 }}
            />

            <Button
              label="Delete"
              variant="danger"
              onPress={() => setConfirmingDelete(true)}
              style={{ flex: 1 }}
            />
          </View>
        </FadeIn>
      </Screen>

      <PeoplePickerSheet
        visible={showAllPeople}
        onClose={() => setShowAllPeople(false)}
        mode="multiple"
        selected={expense.splitBetween}
        onChange={() => undefined}
        title="Split between"
        subtitle={`${splitCount} ${
          splitCount === 1 ? 'person' : 'people'
        }`}
        payerId={expense.paidBy}
        readOnly
      />

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