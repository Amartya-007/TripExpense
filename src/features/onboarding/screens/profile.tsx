import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { View } from "react-native";

import { Alert } from "@/components/ui/alert";
import { AppText } from "@/components/ui/app-text";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FadeIn } from "@/components/ui/fade-in";
import { HeroPanel } from "@/components/ui/hero-panel";
import { Input } from "@/components/ui/input";
import { LoadingIndicator } from "@/components/ui/loading-indicator";
import { Screen } from "@/components/ui/screen";
import { ToggleRow } from "@/components/ui/toggle-row";
import { useAuth } from "@/features/auth/auth-provider";
import { useBiometricLock } from "@/features/biometrics/biometric-lock-provider";
import { useCompleteOnboarding } from "@/features/onboarding/hooks/use-complete-onboarding";
import {
  completeOnboardingSchema,
  type CompleteOnboardingInput,
} from "@/features/onboarding/onboarding-contract";
import { ApiError } from "@/lib/api/api-client";
import { appToast } from "@/lib/toast/app-toast";
import { useAppTheme } from "@/theme/theme-provider";

export default function ProfileOnboardingScreen() {
  const { spacing } = useAppTheme();
  const { isSigningOut, refreshSession, signOut, user } = useAuth();
  const {
    availability,
    isAuthenticating,
    isEnabled: isAppLockEnabled,
    isReady: isBiometricReady,
    setEnabled: setAppLockEnabled,
  } = useBiometricLock();
  
  const completeOnboarding = useCompleteOnboarding();
  const {
    control,
    handleSubmit,
    setError,
    formState: { isSubmitting, isValid },
  } = useForm<CompleteOnboardingInput>({
    resolver: zodResolver(completeOnboardingSchema),
    defaultValues: { username: user?.username ?? "" },
    mode: "onChange",
  });
  
  const biometricAvailable = availability?.status === "available";

  async function updateAppLock(enabled: boolean) {
    const result = await setAppLockEnabled(enabled);

    if (!result.success && !result.cancelled && result.message) {
      appToast.error("Couldn’t update app lock", {
        description: result.message,
      });
    }
  }

  async function submit(values: CompleteOnboardingInput) {
    try {
      await completeOnboarding.mutateAsync(values);
      await refreshSession();
      appToast.success("Setup complete");
    } catch (error) {
      if (error instanceof ApiError && error.code === "USERNAME_TAKEN") {
        setError("username", { message: error.message }, { shouldFocus: true });
        return;
      }

      if (error instanceof ApiError && error.status === 401) {
        await refreshSession();
      }

      appToast.error("Couldn’t finish setup", {
        description:
          error instanceof ApiError
            ? error.message
            : "Check your connection and try again.",
      });
    }
  }

  return (
    <Screen>
      <FadeIn style={{ gap: spacing.xl }}>
        <HeroPanel
          title="Finish setting up your account"
          meta={`Signed in as ${user?.email ?? "your account"}`}
        />

        {/* Username Section */}
        <Card style={{ gap: spacing.md, padding: spacing.lg }}>
          <View style={{ gap: spacing.xs }}>
            <AppText variant="eyebrow" tone="primary">REQUIRED</AppText>
            <AppText variant="subtitle">Choose a username</AppText>
            <AppText tone="muted" variant="caption">
              Usernames are unique and cannot be shared by two accounts.
            </AppText>
          </View>

          <Controller
            control={control}
            name="username"
            render={({ field: { onBlur, onChange, value }, fieldState }) => (
              <Input
                accessibilityLabel="Username"
                label="Username"
                placeholder="your_username"
                value={value}
                error={fieldState.error?.message}
                onBlur={onBlur}
                onChangeText={(text) => onChange(text.toLowerCase())}
                autoCapitalize="none"
                autoComplete="username-new"
                autoCorrect={false}
                leftIcon="person"
                maxLength={24}
              />
            )}
          />
          <AppText variant="caption" tone="muted" style={{ marginTop: -spacing.xs }}>
            3–24 characters. Start with a letter and use letters, numbers, or underscores.
          </AppText>
        </Card>

        {/* Security Section */}
        <Card style={{ gap: spacing.md, padding: spacing.lg }}>
          <View style={{ gap: spacing.xs }}>
            <AppText variant="eyebrow" tone="muted">OPTIONAL</AppText>
            <AppText variant="subtitle">App lock</AppText>
          </View>

          {!isBiometricReady ? (
            <LoadingIndicator label="Checking this device…" />
          ) : null}

          {isBiometricReady && biometricAvailable ? (
            <ToggleRow
              label={`Use ${availability.label}`}
              body="Require biometrics when you return to the app."
              value={isAppLockEnabled}
              disabled={isAuthenticating}
              onValueChange={(enabled) => void updateAppLock(enabled)}
            />
          ) : null}

          {isBiometricReady && !biometricAvailable ? (
            <Alert
              title="App lock is unavailable"
              body={
                availability?.message ??
                "This device cannot use biometric app locking."
              }
              tone="warning"
            />
          ) : null}
        </Card>

        {/* Action Buttons */}
        <View style={{ gap: spacing.sm, paddingTop: spacing.sm }}>
          <Button
            label="Finish setup"
            loading={isSubmitting}
            disabled={!isValid || isAuthenticating}
            onPress={() => void handleSubmit(submit)()}
          />
          <Button
            label="Sign out"
            variant="ghost"
            loading={isSigningOut}
            onPress={() => void signOut()}
          />
        </View>
      </FadeIn>
    </Screen>
  );
}