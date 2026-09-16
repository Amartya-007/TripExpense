import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { DatePicker } from '@/components/ui/date-picker';
import { FadeIn } from '@/components/ui/fade-in';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { PickerField } from '@/components/ui/picker-field';
import { Screen } from '@/components/ui/screen';
import { PeoplePickerSheet } from '@/features/expenses/components/people-picker-sheet';
import {
  EXPENSE_CATEGORIES,
  getExpense,
  getPerson,
  TRIP_PEOPLE,
  type ExpenseCategory,
  type PersonId,
} from '@/features/expenses/expenses-config';
import { useTripData } from '@/features/expenses/trip-data-provider';
import { toISODate } from '@/lib/date/friendly-date';
import { useAppTheme } from '@/theme/theme-provider';

const CATEGORY_KEYS = Object.keys(EXPENSE_CATEGORIES) as ExpenseCategory[];
const ALL_PEOPLE_IDS = TRIP_PEOPLE.map((person) => person.id);

function splitSummary(splitBetween: PersonId[]): string {
  if (splitBetween.length === 0) return 'No one selected';
  if (splitBetween.length === ALL_PEOPLE_IDS.length) return 'Everyone';
  if (splitBetween.length === 1) return getPerson(splitBetween[0]).name;
  return `${splitBetween.length} people`;
}

export default function AddExpenseScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { colors, spacing } = useAppTheme();
  const insets = useSafeAreaInsets();
  const { expenses, addExpense, updateExpense } = useTripData();

  const existingExpense = id ? getExpense(expenses, id) : undefined;
  const isEditing = Boolean(existingExpense);

  const [amount, setAmount] = useState(existingExpense ? String(existingExpense.amount) : '');
  const [title, setTitle] = useState(existingExpense?.title ?? '');
  const [category, setCategory] = useState<ExpenseCategory>(existingExpense?.category ?? 'food');
  const [paidBy, setPaidBy] = useState<PersonId>(existingExpense?.paidBy ?? 'you');
  const [splitBetween, setSplitBetween] = useState<PersonId[]>(existingExpense?.splitBetween ?? ALL_PEOPLE_IDS);
  const [selectedDate, setSelectedDate] = useState(existingExpense ? existingExpense.dateTime.slice(0, 10) : toISODate(new Date()));
  const [note, setNote] = useState(existingExpense?.note ?? '');
  const [hasReceipt, setHasReceipt] = useState(existingExpense?.hasReceipt ?? false);
  const [openPicker, setOpenPicker] = useState<'paidBy' | 'split' | null>(null);

  const parsedAmount = Number(amount);
  const canSubmit = title.trim().length > 0 && parsedAmount > 0 && splitBetween.length > 0;

  function buildDateTime(): string {
    if (existingExpense && existingExpense.dateTime.slice(0, 10) === selectedDate) {
      // Date unchanged - keep the original time of day instead of resetting it.
      return existingExpense.dateTime;
    }
    // No time picker yet: today keeps the real current time, any other date defaults to noon.
    const time = selectedDate === toISODate(new Date()) ? new Date().toTimeString().slice(0, 8) : '12:00:00';
    return `${selectedDate}T${time}`;
  }

  function handleSubmit() {
    if (!canSubmit) return;

    const input = {
      title: title.trim(),
      amount: parsedAmount,
      category,
      paidBy,
      splitBetween,
      dateTime: buildDateTime(),
      note: note.trim() || undefined,
      hasReceipt,
    };

    if (existingExpense) {
      updateExpense(existingExpense.id, input);
    } else {
      addExpense(input);
    }

    router.back();
  }

  return (
    <>
      <Screen contentStyle={{ paddingBottom: insets.bottom + spacing.xl }}>
      <FadeIn style={{ gap: spacing.xl }}>
      <View style={{ alignItems: 'center', gap: spacing.xs, paddingTop: spacing.md }}>
        <AppText variant="caption" tone="muted">
          Amount
        </AppText>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
          <AppText style={{ fontSize: 36, fontWeight: '900', color: colors.textMuted }}>₹</AppText>
          <TextInput
            autoFocus={!isEditing}
            keyboardType="decimal-pad"
            onChangeText={setAmount}
            placeholder="0"
            placeholderTextColor={colors.textMuted}
            style={{ fontSize: 44, fontWeight: '900', color: colors.text, minWidth: 80, textAlign: 'center' }}
            value={amount}
          />
        </View>
      </View>

      <Input label="What was it for?" onChangeText={setTitle} placeholder="e.g. Dinner at the beach shack" value={title} />

      <DatePicker label="Date" value={selectedDate} onChange={setSelectedDate} />

      <View style={{ gap: spacing.sm }}>
        <AppText variant="caption">Category</AppText>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
          {CATEGORY_KEYS.map((key) => (
            <Chip
              key={key}
              label={EXPENSE_CATEGORIES[key].label}
              selected={category === key}
              onPress={() => setCategory(key)}
            />
          ))}
        </View>
      </View>

      <PickerField label="Paid by" value={getPerson(paidBy).name} onPress={() => setOpenPicker('paidBy')} />

      <View style={{ gap: spacing.sm }}>
        <PickerField label="Split between" value={splitSummary(splitBetween)} onPress={() => setOpenPicker('split')} />
        {splitBetween.length > 0 ? (
          <AppText variant="caption" tone="muted">
            {parsedAmount > 0
              ? `₹${Math.round(parsedAmount / splitBetween.length).toLocaleString('en-IN')} each`
              : `Split ${splitBetween.length} ${splitBetween.length === 1 ? 'way' : 'ways'}`}
          </AppText>
        ) : (
          <AppText variant="caption" tone="danger">
            Pick at least one person to split with
          </AppText>
        )}
      </View>

      <Input
        label="Note (optional)"
        onChangeText={setNote}
        placeholder="Any extra detail worth remembering"
        value={note}
        multiline
        numberOfLines={3}
        size="lg"
        style={{ textAlignVertical: 'top', paddingTop: spacing.sm, paddingBottom: spacing.sm }}
      />

      <View style={{ gap: spacing.sm }}>
        <AppText variant="caption">Receipt</AppText>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ checked: hasReceipt }}
          onPress={() => setHasReceipt((current) => !current)}
          style={({ pressed }) => ({
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.md,
            padding: spacing.lg,
            borderRadius: 16,
            borderWidth: 1,
            borderStyle: hasReceipt ? 'solid' : 'dashed',
            borderColor: hasReceipt ? colors.success : colors.border,
            backgroundColor: hasReceipt ? colors.successSoft : colors.surface,
            opacity: pressed ? 0.85 : 1,
          })}>
          <Icon name={hasReceipt ? 'checkCircle' : 'add'} size={18} color={hasReceipt ? colors.success : colors.textMuted} />
          <View style={{ flex: 1 }}>
            <AppText variant="body">{hasReceipt ? 'Receipt attached' : 'Attach a receipt'}</AppText>
            <AppText variant="caption" tone="muted">
              {hasReceipt ? 'Tap to remove' : 'Photo capture is coming soon - for now this just marks it attached'}
            </AppText>
          </View>
        </Pressable>
      </View>

      <Button
        label={isEditing ? 'Save changes' : parsedAmount > 0 ? `Add expense · ₹${parsedAmount.toLocaleString('en-IN')}` : 'Add expense'}
        onPress={handleSubmit}
        disabled={!canSubmit}
      />
      </FadeIn>
    </Screen>

      <PeoplePickerSheet
        visible={openPicker === 'paidBy'}
        onClose={() => setOpenPicker(null)}
        mode="single"
        title="Paid by"
        subtitle="Pick who paid this expense"
        selected={[paidBy]}
        onChange={(ids) => ids[0] && setPaidBy(ids[0])}
      />

      <PeoplePickerSheet
        visible={openPicker === 'split'}
        onClose={() => setOpenPicker(null)}
        mode="multiple"
        title="Split between"
        subtitle={`${splitBetween.length} of ${ALL_PEOPLE_IDS.length} selected`}
        selected={splitBetween}
        onChange={setSplitBetween}
        payerId={paidBy}
      />
    </>
  );
}
