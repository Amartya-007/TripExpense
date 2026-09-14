import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar } from '@/components/ui/avatar';
import { AppText } from '@/components/ui/app-text';
import { Card } from '@/components/ui/card';
import { FadeIn } from '@/components/ui/fade-in';
import { GradientPanel } from '@/components/ui/gradient-panel';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Screen } from '@/components/ui/screen';
import { useAuth } from '@/features/auth/auth-provider';
import { TRIP_PEOPLE, getPerson } from '@/features/expenses/expenses-config';
import { useTripData } from '@/features/expenses/trip-data-provider';
import { BottomNav } from '@/features/home/components/bottom-nav';
import { useDashboardNavigation } from '@/features/home/use-dashboard-navigation';
import { TRIPS, type TripSummary } from '@/features/trips/trips-config';
import { formatDateRange, toISODate } from '@/lib/date/friendly-date';
import { appToast } from '@/lib/toast/app-toast';
import { useAppTheme } from '@/theme/theme-provider';

function formatCurrency(amount: number) {
  return `₹${amount.toLocaleString('en-IN')}`;
}

function greetingForHour(hour: number) {
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

type TripTab = 'upcoming' | 'past';

export default function MyTripsScreen() {
  const { user } = useAuth();
  const { colors, radius, spacing } = useAppTheme();
  const insets = useSafeAreaInsets();
  const { expenses } = useTripData();
  const { handleNavigate, handleAdd } = useDashboardNavigation('home');
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<TripTab>('upcoming');

  const firstName = user?.name?.split(' ')[0] ?? 'there';
  const todayKey = toISODate(new Date());
  const liveSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  const trips = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return TRIPS.filter((trip) => {
      const isPast = trip.endDate < todayKey;
      if (tab === 'upcoming' && isPast) return false;
      if (tab === 'past' && !isPast) return false;
      if (!normalizedQuery) return true;
      return trip.name.toLowerCase().includes(normalizedQuery) || trip.place.toLowerCase().includes(normalizedQuery);
    });
  }, [query, tab, todayKey]);

  function handleOpenTrip(trip: TripSummary) {
    if (!trip.isLive) {
      appToast.info(`${trip.name} is a preview`, { description: 'Full multi-trip support is coming soon - opening your live Goa trip instead.' });
    }
    router.push('/dashboard');
  }

  function handleCreateTrip() {
    appToast.info('Trip creation is coming soon', { description: 'For now, explore the Goa trip from My Trips.' });
  }

  return (
    <>
      <Screen hasHeader contentStyle={{ paddingBottom: insets.bottom + 112 }}>
        <FadeIn style={{ gap: spacing.lg }}>
          <View style={{ gap: spacing.xs }}>
            <AppText variant="eyebrow">{greetingForHour(new Date().getHours())}</AppText>
            <AppText variant="hero">{firstName} 👋</AppText>
          </View>

          <Input placeholder="Search trips..." leftIcon="search" variant="filled" value={query} onChangeText={setQuery} returnKeyType="search" />

          <View style={{ flexDirection: 'row', gap: spacing.sm, backgroundColor: colors.surfaceStrong, borderRadius: radius.pill, padding: 4 }}>
            {(['upcoming', 'past'] as const).map((key) => (
              <Pressable
                key={key}
                accessibilityRole="tab"
                accessibilityState={{ selected: tab === key }}
                onPress={() => setTab(key)}
                style={{
                  flex: 1,
                  borderRadius: radius.pill,
                  paddingVertical: spacing.sm,
                  alignItems: 'center',
                  backgroundColor: tab === key ? colors.surface : 'transparent',
                }}>
                <AppText variant="caption" tone={tab === key ? 'primary' : 'muted'} style={{ textTransform: 'capitalize' }}>
                  {key}
                </AppText>
              </Pressable>
            ))}
          </View>

          {trips.length === 0 ? (
            <Card>
              <AppText variant="subtitle">No trips here yet</AppText>
              <AppText tone="muted">Trips you plan will show up in this tab once their dates line up.</AppText>
            </Card>
          ) : (
            <View style={{ gap: spacing.md }}>
              {trips.map((trip) => {
                const spent = trip.isLive ? liveSpent : (trip.previewSpent ?? 0);
                const spentPercent = Math.min(100, Math.round((spent / trip.budget) * 100));

                return (
                  <Pressable
                    key={trip.id}
                    accessibilityRole="button"
                    accessibilityLabel={trip.name}
                    onPress={() => handleOpenTrip(trip)}
                    style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}>
                    <View style={{ borderRadius: radius.xl, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' }}>
                      <GradientPanel from={trip.coverFrom} to={trip.coverTo} icon={trip.icon} height={104} />
                      <View style={{ padding: spacing.lg, gap: spacing.sm }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <View style={{ gap: 2, flex: 1 }}>
                            <AppText variant="subtitle">{trip.name}</AppText>
                            <AppText variant="caption" tone="muted">
                              {formatDateRange(trip.startDate, trip.endDate)}
                            </AppText>
                          </View>
                          <View style={{ flexDirection: 'row' }}>
                            {TRIP_PEOPLE.slice(0, trip.memberCount).map((personId, index) => (
                              <View key={personId.id} style={{ marginLeft: index === 0 ? 0 : -10, borderWidth: 2, borderColor: colors.surface, borderRadius: 999 }}>
                                <Avatar name={getPerson(personId.id).name} color={colors[getPerson(personId.id).color]} size={26} />
                              </View>
                            ))}
                          </View>
                        </View>

                        <View style={{ height: 8, borderRadius: radius.pill, backgroundColor: colors.surfaceStrong, overflow: 'hidden' }}>
                          <View style={{ width: `${spentPercent}%`, height: '100%', borderRadius: radius.pill, backgroundColor: trip.coverFrom }} />
                        </View>

                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                          <AppText variant="caption">
                            {formatCurrency(spent)} <AppText variant="caption" tone="muted">of {formatCurrency(trip.budget)}</AppText>
                          </AppText>
                          <AppText variant="caption" tone="muted">
                            {spentPercent}%
                          </AppText>
                        </View>
                      </View>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          )}

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Create a new trip"
            onPress={handleCreateTrip}
            style={({ pressed }) => ({
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: spacing.sm,
              paddingVertical: spacing.lg,
              opacity: pressed ? 0.7 : 1,
            })}>
            <Icon name="add" size={18} color={colors.primary} />
            <AppText tone="primary" style={{ fontWeight: '800' }}>
              Create New Trip
            </AppText>
          </Pressable>
        </FadeIn>
      </Screen>
      <BottomNav activeKey="home" onNavigate={handleNavigate} onAdd={handleAdd} />
    </>
  );
}
