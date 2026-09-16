import Constants from 'expo-constants';
import { Link, router } from 'expo-router';
import { useState } from 'react';
import { View, Pressable } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { FadeIn } from '@/components/ui/fade-in';
import { Icon } from '@/components/ui/icon';
import { ListRow } from '@/components/ui/list-row';
import { Screen } from '@/components/ui/screen';
import { useAuth } from '@/features/auth/auth-provider';
import { appToast } from '@/lib/toast/app-toast';
import { useAppTheme, type ThemeMode } from '@/theme/theme-provider';

const appearanceOptions: { label: string; value: ThemeMode }[] = [
  { label: 'System', value: 'system' },
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
];

function comingSoon(feature: string) {
  appToast.info(`${feature} is coming soon`);
}

function Divider() {
  const { colors } = useAppTheme();
  return <View style={{ height: 1, backgroundColor: colors.border }} />;
}

export default function SettingsScreen() {
  const { isSigningOut, signOut, user } = useAuth();
  const { colors, mode, radius, setMode, spacing } = useAppTheme();
  const [appearanceExpanded, setAppearanceExpanded] = useState(false);
  const [confirmingSignOut, setConfirmingSignOut] = useState(false);

  const appearanceLabel = appearanceOptions.find((option) => option.value === mode)?.label ?? 'System';
  const appVersion = Constants.expoConfig?.version ?? '1.0.0';

  function handleConfirmSignOut() {
    setConfirmingSignOut(false);
    void signOut();
  }

  return (
    <>
      <Screen>
        <FadeIn style={{ gap: spacing.lg }}>
          <AppText variant="hero">Settings</AppText>

          <Card style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
            <Avatar name={user?.name ?? 'You'} color={colors.primary} size={56} />
            <View style={{ flex: 1, gap: 2 }}>
              <AppText variant="subtitle">{user?.name}</AppText>
              <AppText tone="muted">{user?.email}</AppText>
            </View>
          </Card>

          <View style={{ borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, overflow: 'hidden' }}>
            <View style={{ padding: spacing.lg }}>
              <ListRow
                icon="appearance"
                title="Appearance"
                body={`Theme, display settings · ${appearanceLabel}`}
                onPress={() => setAppearanceExpanded((current) => !current)}
                trailing={
                  <Icon
                    name="chevronRight"
                    size={18}
                    color={colors.textMuted}
                    style={{ transform: [{ rotate: appearanceExpanded ? '90deg' : '0deg' }] }}
                  />
                }
              />
              {appearanceExpanded ? (
                <View accessibilityRole="radiogroup" style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md }}>
                  {appearanceOptions.map((option) => {
                    const selected = mode === option.value;
                    return (
                      <Button
                        key={option.value}
                        label={option.label}
                        variant={selected ? 'primary' : 'outline'}
                        size="sm"
                        fullWidth={false}
                        accessibilityRole="radio"
                        accessibilityState={{ selected }}
                        style={{ flex: 1 }}
                        onPress={() => setMode(option.value)}
                      />
                    );
                  })}
                </View>
              ) : null}
            </View>

            <Divider />
            <View style={{ padding: spacing.lg }}>
              <ListRow icon="filter" title="Trip Preferences" body="Currency, group, default split" onPress={() => comingSoon('Trip preferences')} trailing={<Icon name="chevronRight" size={18} color={colors.textMuted} />} />
            </View>

            <Divider />
            <View style={{ padding: spacing.lg }}>
              <ListRow icon="bell" title="Notifications" body="Expense reminders, alerts" onPress={() => comingSoon('Notifications')} trailing={<Icon name="chevronRight" size={18} color={colors.textMuted} />} />
            </View>

            <Divider />
            <View style={{ padding: spacing.lg }}>
              <ListRow icon="lock" title="Security" body="Biometric, passcode, app lock" onPress={() => router.push('/biometric-lock')} trailing={<Icon name="chevronRight" size={18} color={colors.textMuted} />} />
            </View>

            <Divider />
            <View style={{ padding: spacing.lg }}>
              <ListRow icon="storage" title="Storage & Data" body="Manage receipts & files" onPress={() => comingSoon('Storage & data')} trailing={<Icon name="chevronRight" size={18} color={colors.textMuted} />} />
            </View>

            <Divider />
            <View style={{ padding: spacing.lg }}>
              <ListRow icon="help" title="Help & Support" body="FAQs, contact us" onPress={() => comingSoon('Help & support')} trailing={<Icon name="chevronRight" size={18} color={colors.textMuted} />} />
            </View>

            <Divider />
            <View style={{ padding: spacing.lg }}>
              <ListRow icon="info" title="About TripExpense" body={`Version ${appVersion}`} />
            </View>
          </View>

          <Link href="/delete-account" asChild>
            <Button label="Delete account" variant="ghost" />
          </Link>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Log out"
            disabled={isSigningOut}
            onPress={() => setConfirmingSignOut(true)}
            style={({ pressed }) => ({ opacity: isSigningOut ? 0.5 : pressed ? 0.7 : 1 })}>
            <Card style={{ alignItems: 'center' }}>
              <AppText style={{ color: colors.danger, fontWeight: '800' }}>Log Out</AppText>
            </Card>
          </Pressable>

          <View style={{ alignItems: 'center', paddingVertical: spacing.md }}>
            <AppText variant="caption" tone="muted">
              Built by <AppText variant="caption" style={{ fontWeight: '900' }}>Code with Nomi</AppText>
            </AppText>
          </View>
        </FadeIn>
      </Screen>

      <ConfirmDialog
        visible={confirmingSignOut}
        title="Sign out?"
        body="You can sign back in at any time."
        confirmLabel="Sign out"
        tone="danger"
        onConfirm={handleConfirmSignOut}
        onCancel={() => setConfirmingSignOut(false)}
      />
    </>
  );
}
