import { Component, useEffect, type ReactNode } from 'react';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { Stack } from 'expo-router/stack';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppToaster } from '@/components/ui/app-toaster';
import { Button } from '@/components/ui/button';
import { FadeIn } from '@/components/ui/fade-in';
import { HeroPanel } from '@/components/ui/hero-panel';
import { Screen } from '@/components/ui/screen';
import { useAuth } from '@/features/auth/auth-provider';
import { BiometricGate } from '@/features/biometrics/components/biometric-gate';
import { useBiometricLock } from '@/features/biometrics/biometric-lock-provider';
import { AppProviders } from '@/providers/app-providers';
import { useAppTheme } from '@/theme/theme-provider';

if (Platform.OS !== 'web') {
  void SplashScreen.preventAutoHideAsync().catch(() => {
    // Fast Refresh can preserve an already-managed native splash screen.
  });
}

// ---------------------------------------------------------------------------
// Root error boundary — catches any unhandled render error in the tree and
// shows a recovery screen instead of a blank native crash.
// ---------------------------------------------------------------------------

type ErrorBoundaryState = { hasError: boolean; error: Error | null };

class RootErrorBoundary extends Component<
  { children: ReactNode },
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Wire to your observability reporter when ready:
    // reportServerError({ event: 'ui.unhandled-error', error, info });
    console.error('[RootErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <SafeAreaProvider>
          <Screen scroll={false} contentStyle={{ justifyContent: 'center' }}>
            <HeroPanel
              eyebrow="Something went wrong"
              title="An unexpected error occurred"
              body="Please restart the app. Your data has not been affected."
            />
            <Button
              label="Try again"
              onPress={() => this.setState({ hasError: false, error: null })}
            />
          </Screen>
        </SafeAreaProvider>
      );
    }

    return this.props.children;
  }
}

// ---------------------------------------------------------------------------
// Navigator
// ---------------------------------------------------------------------------

function RootNavigator() {
  const { isInitialSessionUnavailable, isRefreshingSession, phase, refreshSession } = useAuth();
  const { isReady: isBiometricReady } = useBiometricLock();
  const { colors, isReady: isThemeReady, resolvedTheme } = useAppTheme();
  const [areFontsLoaded, fontError] = useFonts({
    'Inter-Regular': require('../../assets/fonts/Inter-Regular.otf'),
    'Inter-Medium': require('../../assets/fonts/Inter-Medium.otf'),
    'Inter-SemiBold': require('../../assets/fonts/Inter-SemiBold.otf'),
    'Inter-Bold': require('../../assets/fonts/Inter-Bold.otf'),
  });

  useEffect(() => {
    if (fontError) {
      console.warn('[Fonts] Failed to load custom fonts, falling back to system fonts', fontError);
    }
  }, [fontError]);

  const isStarting =
    (phase === 'checking' && !isInitialSessionUnavailable) ||
    !isBiometricReady ||
    !isThemeReady ||
    (!areFontsLoaded && !fontError);
  const initialRouteName = phase === 'signed-out' ? '(auth)' : '(main)';

  useEffect(() => {
    if (Platform.OS !== 'web' && !isStarting) {
      void SplashScreen.hideAsync();
    }
  }, [isStarting]);

  if (isStarting) {
    return null;
  }

  if (isInitialSessionUnavailable) {
    return (
      <>
        <StatusBar style={resolvedTheme === 'dark' ? 'light' : 'dark'} />
        <FadeIn>
          <Screen scroll={false} contentStyle={{ justifyContent: 'center' }}>
            <HeroPanel
              eyebrow="Connection needed"
              title="We couldn't open your account"
              body="Check your internet connection, then try again. Your saved sign-in has not been removed."
            />
            <Button
              label="Try again"
              loading={isRefreshingSession}
              onPress={() => void refreshSession()}
            />
          </Screen>
        </FadeIn>
      </>
    );
  }

  return (
    <>
      <StatusBar style={resolvedTheme === 'dark' ? 'light' : 'dark'} />
      <Stack
        initialRouteName={initialRouteName}
        screenOptions={{
          animation: 'none',
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(public)" />

        <Stack.Protected guard={phase === 'signed-out'}>
          <Stack.Screen name="(auth)" />
        </Stack.Protected>

        <Stack.Protected
          guard={
            phase === 'needs-phone-verification' ||
            phase === 'needs-onboarding' ||
            phase === 'ready'
          }>
          <Stack.Screen name="(main)" />
        </Stack.Protected>
      </Stack>
      <BiometricGate />
    </>
  );
}

function ThemedAppRoot() {
  const { colors } = useAppTheme();

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.background }}>
      <RootNavigator />
      <AppToaster />
    </GestureHandlerRootView>
  );
}

export default function RootLayout() {
  return (
    <RootErrorBoundary>
      <SafeAreaProvider>
        <AppProviders>
          <ThemedAppRoot />
        </AppProviders>
      </SafeAreaProvider>
    </RootErrorBoundary>
  );
}
