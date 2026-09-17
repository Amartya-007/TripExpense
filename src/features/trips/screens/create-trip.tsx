import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { DatePicker } from '@/components/ui/date-picker';
import { FadeIn } from '@/components/ui/fade-in';
import { GradientPanel } from '@/components/ui/gradient-panel';
import { Icon, type IconName } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Screen } from '@/components/ui/screen';
import { TRIP_PEOPLE, type PersonId } from '@/features/expenses/expenses-config';
import { useTripsList } from '@/features/trips/trips-provider';
import { appToast } from '@/lib/toast/app-toast';
import { toISODate } from '@/lib/date/friendly-date';
import { sanitiseCurrencyInput, validateCurrencyAmount, getCurrencyAmountError } from '@/lib/validation/currency-validation';
import { useAppTheme } from '@/theme/theme-provider';

const COVER_PRESETS: { icon: IconName; from: string; to: string; label: string }[] = [
  { icon: 'mountain', from: '#2563EB', to: '#60A5FA', label: 'Mountains' },
  { icon: 'beach', from: '#F97316', to: '#FBBF24', label: 'Beach' },
  { icon: 'waves', from: '#0D9488', to: '#2DD4BF', label: 'Water' },
  { icon: 'food', from: '#DB2777', to: '#F472B6', label: 'Food' },
  { icon: 'ticket', from: '#7C3AED', to: '#A78BFA', label: 'City' },
];

const ALL_PEOPLE_IDS = TRIP_PEOPLE.map((person) => person.id);

export default function CreateTripScreen() {
  const { colors, radius, spacing } = useAppTheme();
  const insets = useSafeAreaInsets();
  const { addTrip } = useTripsList();

  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState(toISODate(new Date()));
  const [endDate, setEndDate] = useState(toISODate(new Date()));
  const [budget, setBudget] = useState('');
  const [members, setMembers] = useState<PersonId[]>(ALL_PEOPLE_IDS);
  const [coverIndex, setCoverIndex] = useState(0);

  const parsedBudget = Number(budget);
  const budgetError = budget.length > 0 && !validateCurrencyAmount(budget) ? (getCurrencyAmountError(budget) ?? undefined) : undefined;
  const canSubmit = name.trim().length > 0 && validateCurrencyAmount(budget) && endDate >= startDate && members.length > 0;

  function toggleMember(personId: PersonId) {
    setMembers((current) => (current.includes(personId) ? current.filter((id) => id !== personId) : [...current, personId]));
  }

  function handleSubmit() {
    if (!canSubmit) return;
    const cover = COVER_PRESETS[coverIndex];
    const trimmedName = name.trim();

    const trip = addTrip({
      name: trimmedName,
      place: trimmedName.replace(/ trip$/i, ''),
      startDate,
      endDate,
      budget: parsedBudget,
      memberCount: members.length,
      coverFrom: cover.from,
      coverTo: cover.to,
      icon: cover.icon,
    });

    appToast.info('Trip created', { description: `${trip.name} was added - switch to it anytime from the trip name on your dashboard.` });
    router.back();
  }

  return (
    <Screen hasHeader contentStyle={{ paddingBottom: insets.bottom + spacing.xl }}>
      <FadeIn style={{ gap: spacing.xl }}>
        <Input label="Trip name" onChangeText={setName} placeholder="e.g. Kerala Backwaters" value={name} />

        <View style={{ flexDirection: 'row', gap: spacing.md }}>
          <View style={{ flex: 1 }}>
            <DatePicker label="Start date" value={startDate} onChange={setStartDate} />
          </View>
          <View style={{ flex: 1 }}>
            <DatePicker label="End date" value={endDate} onChange={setEndDate} minDate={startDate} />
          </View>
        </View>

        <Input
          label="Budget"
          onChangeText={(raw) => setBudget(sanitiseCurrencyInput(raw))}
          placeholder="e.g. 30000"
          value={budget}
          keyboardType="decimal-pad"
          leftIcon="wallet"
          error={budgetError}
        />

        <View style={{ gap: spacing.sm }}>
          <AppText variant="caption">Cover theme</AppText>
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            {COVER_PRESETS.map((preset, index) => {
              const selected = coverIndex === index;
              return (
                <Pressable
                  key={preset.label}
                  accessibilityRole="button"
                  accessibilityLabel={preset.label}
                  accessibilityState={{ selected }}
                  onPress={() => setCoverIndex(index)}
                  style={{
                    borderRadius: radius.lg,
                    borderWidth: selected ? 2 : 0,
                    borderColor: colors.primary,
                    overflow: 'hidden',
                  }}>
                  <GradientPanel from={preset.from} to={preset.to} icon={preset.icon} iconSize={16} height={48} style={{ width: 48 }} />
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={{ gap: spacing.sm }}>
          <AppText variant="caption">Add members</AppText>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
            {TRIP_PEOPLE.map((person) => (
              <Chip
                key={person.id}
                label={person.name}
                selected={members.includes(person.id)}
                onPress={() => toggleMember(person.id)}
                color={colors[person.color]}
              />
            ))}
          </View>
          {members.length === 0 ? (
            <AppText variant="caption" tone="danger">
              Pick at least one person
            </AppText>
          ) : null}
        </View>

        <Button label="Create trip" onPress={handleSubmit} disabled={!canSubmit} />

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, justifyContent: 'center' }}>
          <Icon name="alert" size={14} color={colors.textMuted} />
          <AppText variant="caption" tone="muted">
            New trips are a preview for now - full expense tracking is coming soon.
          </AppText>
        </View>
      </FadeIn>
    </Screen>
  );
}
