import { Pressable, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Avatar } from '@/components/ui/avatar';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { TRIP_PEOPLE, type PersonId } from '@/features/expenses/expenses-config';
import { useAppTheme } from '@/theme/theme-provider';

type PeoplePickerSheetProps = {
  visible: boolean;
  onClose: () => void;
  mode: 'single' | 'multiple';
  selected: PersonId[];
  onChange: (ids: PersonId[]) => void;
  title: string;
  subtitle?: string;
  /** Only meaningful in 'multiple' mode: powers the "Only payer" action and the missing-payer warning. */
  payerId?: PersonId;
};

const ALL_PEOPLE_IDS = TRIP_PEOPLE.map((person) => person.id);

/**
 * Bottom-sheet person picker backing both "Paid by" (single) and "Split
 * between" (multiple) on Add Expense - trigger is PickerField.
 */
export function PeoplePickerSheet({ visible, onClose, mode, selected, onChange, title, subtitle, payerId }: PeoplePickerSheetProps) {
  const { colors, radius, spacing } = useAppTheme();

  function handleToggle(personId: PersonId) {
    if (mode === 'single') {
      onChange([personId]);
      onClose();
      return;
    }

    onChange(selected.includes(personId) ? selected.filter((id) => id !== personId) : [...selected, personId]);
  }

  const missingPayer = mode === 'multiple' && payerId !== undefined && !selected.includes(payerId);

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <View style={{ paddingHorizontal: spacing.lg, gap: spacing.xs, paddingBottom: spacing.sm }}>
        <AppText variant="subtitle">{title}</AppText>
        {subtitle ? (
          <AppText variant="caption" tone="muted">
            {subtitle}
          </AppText>
        ) : null}
      </View>

      <View style={{ paddingHorizontal: spacing.lg, gap: spacing.xs }}>
        {TRIP_PEOPLE.map((person) => {
          const isSelected = selected.includes(person.id);
          const isPayer = person.id === payerId;

          return (
            <Pressable
              key={person.id}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              onPress={() => handleToggle(person.id)}
              style={({ pressed }) => [
                {
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: spacing.md,
                  paddingVertical: spacing.sm,
                  paddingHorizontal: spacing.sm,
                  borderRadius: radius.lg,
                  backgroundColor: isSelected ? colors.primarySoft : 'transparent',
                  opacity: pressed ? 0.8 : 1,
                },
              ]}>
              <Avatar name={person.name} color={colors[person.color]} size={32} />
              <View style={{ flex: 1 }}>
                <AppText variant="body">{person.name}</AppText>
                {isPayer && mode === 'multiple' ? (
                  <AppText variant="caption" tone="muted">
                    Paid this expense
                  </AppText>
                ) : null}
              </View>
              {isSelected ? (
                <Icon name="checkCircle" size={22} color={colors.primary} />
              ) : mode === 'multiple' ? (
                <View style={{ width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: colors.border }} />
              ) : null}
            </Pressable>
          );
        })}
      </View>

      {missingPayer ? (
        <View
          style={{
            flexDirection: 'row',
            gap: spacing.sm,
            marginHorizontal: spacing.lg,
            marginTop: spacing.sm,
            padding: spacing.md,
            borderRadius: radius.lg,
            backgroundColor: colors.warningSoft,
          }}>
          <Icon name="alert" size={16} color={colors.warning} />
          <AppText variant="caption" style={{ color: colors.warning, flex: 1 }}>
            The payer isn&apos;t in the split - they&apos;ll be owed back the full amount instead of just their share.
          </AppText>
        </View>
      ) : null}

      {mode === 'multiple' ? (
        <>
          <View style={{ flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.lg, paddingTop: spacing.md }}>
            <Button label="Select all" variant="outline" size="sm" fullWidth={false} style={{ flex: 1 }} onPress={() => onChange(ALL_PEOPLE_IDS)} />
            <Button
              label="Only payer"
              variant="outline"
              size="sm"
              fullWidth={false}
              style={{ flex: 1 }}
              disabled={payerId === undefined}
              onPress={() => payerId !== undefined && onChange([payerId])}
            />
            <Button label="Clear" variant="outline" size="sm" fullWidth={false} style={{ flex: 1 }} onPress={() => onChange([])} />
          </View>
          <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.lg }}>
            <Button label="Done" onPress={onClose} />
          </View>
        </>
      ) : null}
    </BottomSheet>
  );
}
