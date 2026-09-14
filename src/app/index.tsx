import { type Href, Redirect } from 'expo-router';

import { useAuth } from '@/features/auth/auth-provider';

export default function EntryPage() {
  const { phase } = useAuth();

  if (phase === 'checking') return null;

  const destination: Href =
    phase === 'signed-out'
      ? '/sign-in'
      : phase === 'needs-phone-verification'
        ? '/verify-phone'
        : phase === 'needs-onboarding'
          ? '/profile'
          : '/trips';

  return <Redirect href={destination} />;
}
