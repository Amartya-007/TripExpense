import type { AuthPhase, User } from '@/features/auth/types';

type AuthPhaseUser = Pick<User, 'onboardingCompleted'> & {
  phoneNumberVerified?: boolean | null;
};

export function getAuthPhase(initialCheckComplete: boolean, user: AuthPhaseUser | null): AuthPhase {
  if (!initialCheckComplete) return 'checking';
  if (!user) return 'signed-out';
  if (!user.phoneNumberVerified) return 'needs-phone-verification';
  return user.onboardingCompleted ? 'ready' : 'needs-onboarding';
}
