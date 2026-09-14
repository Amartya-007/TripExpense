import { router } from 'expo-router';
import { Stack } from 'expo-router/stack';

import { HeaderIconButton } from '@/components/ui/header-icon-button';
import { useAuth } from '@/features/auth/auth-provider';
import { TripDataProvider } from '@/features/expenses/trip-data-provider';
import { useAppTheme } from '@/theme/theme-provider';

export default function MainLayout() {
  const { phase } = useAuth();
  const { colors } = useAppTheme();

  function goBack() {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace('/trips');
  }

  const backButton = () => (
    <HeaderIconButton accessibilityLabel="Go back" icon="arrowLeft" onPress={goBack} />
  );

  return (
    <TripDataProvider>
      <Stack
        initialRouteName={phase === 'ready' ? 'trips' : '(onboarding)'}
        screenOptions={{
          headerShown: true,
          headerBackButtonDisplayMode: 'minimal',
          headerBackTitle: '',
          headerShadowVisible: false,
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Protected guard={phase === 'needs-phone-verification' || phase === 'needs-onboarding'}>
          <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
        </Stack.Protected>

        <Stack.Protected guard={phase === 'ready'}>
          <Stack.Screen
            name="trips"
            options={{
              title: 'My Trips',
              gestureEnabled: false,
              headerLeft: () => null,
            }}
          />
          <Stack.Screen
            name="dashboard"
            options={{
              title: '',
              gestureEnabled: true,
              headerLeft: backButton,
            }}
          />
          <Stack.Screen name="settings" options={{ title: 'Settings', gestureEnabled: false, headerLeft: () => null }} />
          <Stack.Screen name="expenses" options={{ title: 'Expenses', gestureEnabled: false, headerLeft: () => null }} />
          <Stack.Screen name="settle" options={{ title: 'Settle up', gestureEnabled: false, headerLeft: () => null }} />
          <Stack.Screen name="expense/[id]" options={{ presentation: 'modal', headerShown: false }} />
          <Stack.Screen
            name="add-expense"
            options={{ title: 'Add expense', presentation: 'modal', headerLeft: backButton }}
          />
          <Stack.Screen name="delete-account" options={{ title: 'Delete account', headerLeft: backButton }} />
          <Stack.Screen name="biometric-lock" options={{ title: 'App lock', headerLeft: backButton }} />
        </Stack.Protected>
      </Stack>
    </TripDataProvider>
  );
}
