import { View } from 'react-native';

import { Alert } from '@/components/ui/alert';
import { AppText } from '@/components/ui/app-text';
import { Card } from '@/components/ui/card';
import { FadeIn } from '@/components/ui/fade-in';
import { LoadingIndicator } from '@/components/ui/loading-indicator';
import { Screen } from '@/components/ui/screen';
import { ToggleRow } from '@/components/ui/toggle-row';
import { useBiometricLock } from '@/features/biometrics/biometric-lock-provider';
import { appToast } from '@/lib/toast/app-toast';
import { useAppTheme } from '@/theme/theme-provider';

export default function BiometricLockScreen() {
  const { spacing } = useAppTheme();
  const {
    availability,
    isAuthenticating,
    isEnabled,
    isReady,
    setEnabled,
  } = useBiometricLock();
  
  const isAvailable = availability?.status === 'available';

  async function updateAppLock(enabled: boolean) {
    const result = await setEnabled(enabled);

    if (result.success) {
      appToast.success(enabled ? 'App lock turned on' : 'App lock turned off');
      return;
    }

    if (result.message) {
      appToast.error('Couldn’t update app lock', { description: result.message });
    }
  }

  return (
    <Screen hasHeader>
      <AppText tone="muted" style={{ marginBottom: spacing.xs }}>
        Add another layer of privacy when this app leaves your screen.
      </AppText>

      {!isReady ? (
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <LoadingIndicator />
        </View>
      ) : (
        <FadeIn style={{ gap: spacing.lg }}>
          {!isAvailable ? (
            <Alert
              title="App lock isn’t available"
              body={availability?.message ?? 'This device cannot use biometric app locking.'}
              tone="warning"
            />
          ) : (
            <>
              <Card>
                <ToggleRow
                  label={`Use ${availability.label}`}
                  body="Require confirmation after reopening the app."
                  value={isEnabled}
                  disabled={isAuthenticating}
                  onValueChange={(enabled) => void updateAppLock(enabled)}
                />
              </Card>
              
              <Alert
                title="Your account stays signed in"
                body="App lock protects what’s visible on this device. It does not replace your account sign-in."
              />
            </>
          )}
        </FadeIn>
      )}
    </Screen>
  );
}