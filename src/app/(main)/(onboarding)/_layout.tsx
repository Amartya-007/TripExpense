import { Stack } from 'expo-router/stack';

import { useAuth } from '@/features/auth/auth-provider';
import { useAppTheme } from '@/theme/theme-provider';

export default function OnboardingLayout() {
  const { phase } = useAuth();
  const { colors } = useAppTheme();

  return (
    <Stack
      initialRouteName={phase === 'needs-phone-verification' ? 'verify-phone' : 'profile'}
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Protected guard={phase === 'needs-phone-verification'}>
        <Stack.Screen name="verify-phone" />
      </Stack.Protected>
      <Stack.Protected guard={phase === 'needs-onboarding'}>
        <Stack.Screen name="profile" />
      </Stack.Protected>
    </Stack>
  );
}

