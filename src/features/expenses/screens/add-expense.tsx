import { router, useLocalSearchParams } from 'expo-router';
import { toast } from 'sonner-native';
import { useRef, useState } from 'react';
import {
  Image,
  Pressable,
  TextInput,
  View,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/ui/app-text';
import { Avatar } from '@/components/ui/avatar';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { DatePicker } from '@/components/ui/date-picker';
import { FadeIn } from '@/components/ui/fade-in';
import { Icon } from '@/components/ui/icon';
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
import {
  sanitiseCurrencyInput,
  validateCurrencyAmount,
  getCurrencyAmountError,
} from '@/lib/validation/currency-validation';
import { useAppTheme } from '@/theme/theme-provider';
import { Input } from '@/components/ui/input';

const CATEGORY_KEYS = Object.keys(EXPENSE_CATEGORIES) as ExpenseCategory[];
const ALL_PEOPLE_IDS = TRIP_PEOPLE.map((person) => person.id);

export default function AddExpenseScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { colors, radius, spacing } = useAppTheme();
  const insets = useSafeAreaInsets();
  const { expenses, addExpense, updateExpense } = useTripData();

  const existingExpense = id ? getExpense(expenses, id) : undefined;
  const isEditing = Boolean(existingExpense);

  const [amount, setAmount] = useState(
    existingExpense ? String(existingExpense.amount) : '',
  );
  const [title, setTitle] = useState(existingExpense?.title ?? '');
  const [isTitleFocused, setIsTitleFocused] = useState(false);

  const titleInputRef = useRef<TextInput>(null);

  const [category, setCategory] = useState<ExpenseCategory>(
    existingExpense?.category ?? 'food',
  );
  const [paidBy, setPaidBy] = useState<PersonId>(
    existingExpense?.paidBy ?? 'you',
  );
  const [splitBetween, setSplitBetween] = useState<PersonId[]>(
    existingExpense?.splitBetween ?? ALL_PEOPLE_IDS,
  );
  const [selectedDate, setSelectedDate] = useState(
    existingExpense
      ? existingExpense.dateTime.slice(0, 10)
      : toISODate(new Date()),
  );
  const [note, setNote] = useState(existingExpense?.note ?? '');
  const [hasReceipt, setHasReceipt] = useState(
    existingExpense?.hasReceipt ?? false,
  );

  const [openPicker, setOpenPicker] = useState<
    'paidBy' | 'split' | 'category' | null
  >(null);

  const parsedAmount = Number(amount);
  const isValidAmount = validateCurrencyAmount(amount);
  const amountError =
    amount.length > 0 && !isValidAmount
      ? getCurrencyAmountError(amount)
      : null;

  const canSubmit =
    title.trim().length > 0 &&
    isValidAmount &&
    splitBetween.length > 0;

  function buildDateTime(): string {
    if (
      existingExpense &&
      existingExpense.dateTime.slice(0, 10) === selectedDate
    ) {
      return existingExpense.dateTime;
    }

    const time =
      selectedDate === toISODate(new Date())
        ? new Date().toTimeString().slice(0, 8)
        : '12:00:00';

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
      toast.success('Expense updated');
    } else {
      addExpense(input);
      toast.success('Expense added');
    }

    router.back();
  }

  const selectedCategory = EXPENSE_CATEGORIES[category];
  const payer = getPerson(paidBy);

  return (
    <>
      <Screen hasHeader contentStyle={{ paddingBottom: 120 }}>
        <FadeIn style={{ gap: spacing.lg }}>

          {/* 1. Immersive Hero Card */}
          <View
            style={{
              backgroundColor: colors.primarySoft,
              borderRadius: radius.xxl,
              paddingVertical: spacing.xxl,
              paddingHorizontal: spacing.lg,
              alignItems: 'center',
              gap: spacing.sm,
            }}
          >
            {/* Amount Input */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AppText
                style={{
                  fontSize: 40,
                  lineHeight: 48,
                  fontWeight: '900',
                  color: colors.primary,
                  opacity: 0.6,
                  marginRight: 4,
                }}
              >
                ₹
              </AppText>

              <TextInput
                autoFocus={!isEditing}
                keyboardType="decimal-pad"
                multiline={false}
                numberOfLines={1}
                onChangeText={(raw) =>
                  setAmount(sanitiseCurrencyInput(raw))
                }
                placeholder="0"
                placeholderTextColor={`${colors.primary}66`}
                selectionColor={colors.primary}
                style={{
                  fontSize: 56,
                  fontWeight: '900',
                  color: colors.primary,
                  padding: 0,
                  margin: 0,
                  textAlign: 'center',
                  minWidth: 40,
                }}
                value={amount}
              />
            </View>

            {/* Title Input */}
            <View
              style={{
                width: '100%',
                height: 48,
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
              }}
            >
              {/* Custom placeholder */}
              {title.length === 0 && !isTitleFocused && (
                <Pressable
                  onPress={() => titleInputRef.current?.focus()}
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    top: 0,
                    bottom: 0,
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1,
                  }}
                >
                  <AppText
                    style={{
                      fontSize: 18,
                      fontWeight: '600',
                      color: colors.textMuted,
                      textAlign: 'center',
                    }}
                  >
                    What was this for?
                  </AppText>
                </Pressable>
              )}

              <TextInput
                ref={titleInputRef}
                value={title}
                onChangeText={setTitle}
                onFocus={() => setIsTitleFocused(true)}
                onBlur={() => setIsTitleFocused(false)}
                selectionColor={colors.primary}
                multiline={false}
                numberOfLines={1}
                style={{
                  width: '100%',
                  height: 48,
                  fontSize: 18,
                  fontWeight: '600',
                  color: colors.text,
                  textAlign: 'center',
                  padding: 0,
                  margin: 0,
                  includeFontPadding: false,
                }}
              />
            </View>
          </View>

          {/* 2. Context Grid */}
          <View
            style={{
              flexDirection: 'row',
              gap: spacing.sm,
            }}
          >
            <View style={{ flex: 1 }}>
              <DatePicker
                value={selectedDate}
                onChange={setSelectedDate}
              />
            </View>

            <Pressable
              onPress={() => setOpenPicker('category')}
              style={({ pressed }) => ({
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: spacing.sm,
                height: 52,
                borderRadius: radius.lg,
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: colors.surface,
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <Icon
                name={selectedCategory.icon}
                size={18}
                color={colors.primary}
              />

              <AppText
                variant="body"
                style={{ fontWeight: '600' }}
              >
                {selectedCategory.label}
              </AppText>

              <Icon
                name="chevronDown"
                size={16}
                color={colors.textMuted}
              />
            </Pressable>
          </View>

          {/* 3. Split Dynamics Card */}
          <View
            style={{
              backgroundColor: colors.surfaceStrong,
              borderRadius: radius.xl,
              borderWidth: 1,
              borderColor: colors.border,
              overflow: 'hidden',
            }}
          >
            <Pressable
              onPress={() => setOpenPicker('paidBy')}
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: spacing.lg,
                backgroundColor: pressed
                  ? colors.surface
                  : 'transparent',
              })}
            >
              <AppText
                variant="body"
                style={{ fontWeight: '600' }}
              >
                Paid by
              </AppText>

              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: spacing.sm,
                }}
              >
                <Avatar
                  name={payer.name}
                  color={colors[payer.color]}
                  size={24}
                />

                <AppText
                  variant="body"
                  tone="muted"
                >
                  {payer.name}
                </AppText>

                <Icon
                  name="chevronRight"
                  size={16}
                  color={colors.textMuted}
                />
              </View>
            </Pressable>

            <View
              style={{
                height: StyleSheet.hairlineWidth,
                backgroundColor: colors.border,
                marginLeft: spacing.lg,
              }}
            />

            <Pressable
              onPress={() => setOpenPicker('split')}
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: spacing.lg,
                backgroundColor: pressed
                  ? colors.surface
                  : 'transparent',
              })}
            >
              <View style={{ gap: 2 }}>
                <AppText
                  variant="body"
                  style={{ fontWeight: '600' }}
                >
                  Split between
                </AppText>

                <AppText
                  variant="caption"
                  tone="muted"
                >
                  {splitBetween.length === ALL_PEOPLE_IDS.length
                    ? 'Everyone'
                    : `${splitBetween.length} people`}
                </AppText>
              </View>

              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: spacing.xs,
                }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    paddingRight: spacing.xs,
                  }}
                >
                  {splitBetween.slice(0, 3).map((id, index) => {
                    const p = getPerson(id);

                    return (
                      <View
                        key={id}
                        style={{
                          marginLeft: index > 0 ? -10 : 0,
                          borderWidth: 2,
                          borderColor: colors.surfaceStrong,
                          borderRadius: 12,
                        }}
                      >
                        <Avatar
                          name={p.name}
                          color={colors[p.color]}
                          size={24}
                        />
                      </View>
                    );
                  })}
                </View>

                <Icon
                  name="chevronRight"
                  size={16}
                  color={colors.textMuted}
                />
              </View>
            </Pressable>
          </View>

          {/* 4. Utilities Row */}
          <View
            style={{
              flexDirection: 'row',
              gap: spacing.sm,
            }}
          >
            <View style={{ flex: 1 }}>
              <Input
                placeholder="Add a note..."
                value={note}
                onChangeText={setNote}
              />
            </View>

            <Pressable
              onPress={() => setHasReceipt(!hasReceipt)}
              style={({ pressed }) => ({
                width: 52,
                height: 52,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: radius.lg,
                borderWidth: 1,
                borderColor: hasReceipt
                  ? colors.success
                  : colors.border,
                backgroundColor: hasReceipt
                  ? colors.successSoft
                  : colors.surface,
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <Icon
                name="receipt"
                size={20}
                color={
                  hasReceipt
                    ? colors.success
                    : colors.textMuted
                }
              />
            </Pressable>
          </View>
        </FadeIn>
      </Screen>

      {/* Floating Action Bar */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
        }}
      >
        <View
          style={{
            paddingHorizontal: spacing.lg,
            paddingTop: spacing.md,
            paddingBottom: Math.max(
              insets.bottom + spacing.xs,
              spacing.lg,
            ),
            backgroundColor: colors.surface,
            borderTopWidth: StyleSheet.hairlineWidth,
            borderTopColor: colors.border,
            elevation: 16,
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: -4,
            },
            shadowOpacity: 0.1,
            shadowRadius: 12,
          }}
        >
          <Button
            label={
              isEditing
                ? 'Save changes'
                : parsedAmount > 0
                  ? `Add ₹${parsedAmount.toLocaleString('en-IN')}`
                  : 'Add expense'
            }
            onPress={handleSubmit}
            disabled={!canSubmit}
            style={{
              borderRadius: radius.pill,
              height: 56,
            }}
          />
        </View>
      </KeyboardAvoidingView>

      {/* Paid By Picker */}
      <PeoplePickerSheet
        visible={openPicker === 'paidBy'}
        onClose={() => setOpenPicker(null)}
        mode="single"
        title="Paid by"
        selected={[paidBy]}
        onChange={(ids) => ids[0] && setPaidBy(ids[0])}
      />

      {/* Split Picker */}
      <PeoplePickerSheet
        visible={openPicker === 'split'}
        onClose={() => setOpenPicker(null)}
        mode="multiple"
        title="Split between"
        selected={splitBetween}
        onChange={setSplitBetween}
        payerId={paidBy}
      />

      {/* Category Picker */}
      <BottomSheet
        visible={openPicker === 'category'}
        onClose={() => setOpenPicker(null)}
      >
        <View
          style={{
            padding: spacing.lg,
            paddingBottom: insets.bottom + spacing.lg,
            gap: spacing.md,
          }}
        >
          <AppText variant="title">
            Select Category
          </AppText>

          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: spacing.sm,
            }}
          >
            {CATEGORY_KEYS.map((key) => (
              <Chip
                key={key}
                label={EXPENSE_CATEGORIES[key].label}
                selected={category === key}
                onPress={() => {
                  setCategory(key);
                  setOpenPicker(null);
                }}
              />
            ))}
          </View>
        </View>
      </BottomSheet>
    </>
  );
}