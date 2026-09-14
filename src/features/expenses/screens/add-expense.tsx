import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { FadeIn } from '@/components/ui/fade-in';
import { Input } from '@/components/ui/input';
import { Screen } from '@/components/ui/screen';
import {
  EXPENSE_CATEGORIES,
  getExpense,
  TRIP_PEOPLE,
  type ExpenseCategory,
  type PersonId,
} from '@/features/expenses/expenses-config';
import { useTripData } from '@/features/expenses/trip-data-provider';
import { toISODate } from '@/lib/date/friendly-date';
import { useAppTheme } from '@/theme/theme-provider';

const CATEGORY_KEYS = Object.keys(EXPENSE_CATEGORIES) as ExpenseCategory[];
const ALL_PEOPLE_IDS = TRIP_PEOPLE.map((person) => person.id);

function Chip({
  label,
  selected,
  onPress,
  color,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  color?: string;
}) {
  const { colors, radius, spacing } = useAppTheme();
  const activeColor = color ?? colors.primary;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.xs,
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm,
          borderRadius: radius.pill,
          borderWidth: 1,
          borderColor: selected ? activeColor : colors.border,
          backgroundColor: selected ? `${activeColor}1A` : colors.surface,
          opacity: pressed ? 0.78 : 1,
        },
      ]}>
      <AppText variant="caption" style={{ color: selected ? activeColor : colors.textMuted }}>
        {label}
      </AppText>
    </Pressable>
  );
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

  const parsedAmount = Number(amount);
  const canSubmit = title.trim().length > 0 && parsedAmount > 0 && splitBetween.length > 0;
  const allSelected = splitBetween.length === ALL_PEOPLE_IDS.length;

  function toggleSplit(personId: PersonId) {
    setSplitBetween((current) =>
      current.includes(personId) ? current.filter((candidate) => candidate !== personId) : [...current, personId],
    );
  }

  function toggleAll() {
    setSplitBetween((current) => (current.length === ALL_PEOPLE_IDS.length ? [] : [...ALL_PEOPLE_IDS]));
  }

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
    };

    if (existingExpense) {
      updateExpense(existingExpense.id, input);
    } else {
      addExpense(input);
    }

    router.back();
  }

  return (
    <Screen hasHeader contentStyle={{ paddingBottom: insets.bottom + spacing.xl }}>
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

      <View style={{ gap: spacing.sm }}>
        <AppText variant="caption">Paid by</AppText>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
          {TRIP_PEOPLE.map((person) => (
            <Chip
              key={person.id}
              label={person.name}
              selected={paidBy === person.id}
              onPress={() => setPaidBy(person.id)}
              color={colors[person.color]}
            />
          ))}
        </View>
      </View>

      <View style={{ gap: spacing.sm }}>
        <AppText variant="caption">Split between</AppText>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
          <Chip label="All" selected={allSelected} onPress={toggleAll} />
          {TRIP_PEOPLE.map((person) => (
            <Chip
              key={person.id}
              label={person.name}
              selected={splitBetween.includes(person.id)}
              onPress={() => toggleSplit(person.id)}
              color={colors[person.color]}
            />
          ))}
        </View>
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

      <Button
        label={isEditing ? 'Save changes' : parsedAmount > 0 ? `Add expense · ₹${parsedAmount.toLocaleString('en-IN')}` : 'Add expense'}
        onPress={handleSubmit}
        disabled={!canSubmit}
      />
      </FadeIn>
    </Screen>
  );
}
