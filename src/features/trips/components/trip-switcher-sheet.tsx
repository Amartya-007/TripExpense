import { router } from 'expo-router';
import { Pressable, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { GradientPanel } from '@/components/ui/gradient-panel';
import { Icon } from '@/components/ui/icon';
import { useTripsList } from '@/features/trips/trips-provider';
import { formatDateRange } from '@/lib/date/friendly-date';
import { appToast } from '@/lib/toast/app-toast';
import { useAppTheme } from '@/theme/theme-provider';

type TripSwitcherSheetProps = {
  visible: boolean;
  onClose: () => void;
  activeTripId: string;
};

/**
 * Compact trip list + create action, opened from the Dashboard header
 * instead of a dedicated "My Trips" page - switching trips shouldn't mean
 * leaving the dashboard to get back to it.
 */
export function TripSwitcherSheet({ visible, onClose, activeTripId }: TripSwitcherSheetProps) {
  const { colors, radius, spacing } = useAppTheme();
  const { trips } = useTripsList();

  function handleSelect(tripId: string, tripName: string, isLive: boolean) {
    onClose();
    if (tripId === activeTripId) return;
    if (!isLive) {
      appToast.info(`${tripName} is a preview`, { description: 'Full multi-trip support is coming soon - this stays on your live Goa trip for now.' });
    }
  }

  function handleCreateTrip() {
    onClose();
    router.push('/create-trip');
  }

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <View style={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.sm }}>
        <AppText variant="subtitle">Your trips</AppText>
      </View>

      <View style={{ paddingHorizontal: spacing.lg, gap: spacing.sm }}>
        {trips.map((trip) => {
          const isActive = trip.id === activeTripId;
          return (
            <Pressable
              key={trip.id}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
              onPress={() => handleSelect(trip.id, trip.name, trip.isLive)}
              style={({ pressed }) => [
                {
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: spacing.md,
                  padding: spacing.sm,
                  borderRadius: radius.lg,
                  backgroundColor: isActive ? colors.primarySoft : 'transparent',
                  opacity: pressed ? 0.8 : 1,
                },
              ]}>
              <View style={{ borderRadius: radius.md, overflow: 'hidden' }}>
                <GradientPanel from={trip.coverFrom} to={trip.coverTo} icon={trip.icon} iconSize={14} height={44} style={{ width: 44 }} />
              </View>
              <View style={{ flex: 1 }}>
                <AppText variant="body">{trip.name}</AppText>
                <AppText variant="caption" tone="muted">
                  {formatDateRange(trip.startDate, trip.endDate)}
                </AppText>
              </View>
              {isActive ? <Icon name="check" size={18} color={colors.primary} /> : null}
            </Pressable>
          );
        })}
      </View>

      <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.md }}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Create a new trip"
          onPress={handleCreateTrip}
          style={({ pressed }) => [
            {
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: spacing.sm,
              paddingVertical: spacing.md,
              borderRadius: radius.lg,
              borderWidth: 1,
              borderStyle: 'dashed',
              borderColor: colors.border,
              opacity: pressed ? 0.8 : 1,
            },
          ]}>
          <Icon name="add" size={16} color={colors.primary} />
          <AppText variant="body" tone="primary" style={{ fontWeight: '700' }}>
            Create new trip
          </AppText>
        </Pressable>
      </View>
    </BottomSheet>
  );
}
