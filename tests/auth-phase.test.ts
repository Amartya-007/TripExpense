import { describe, expect, it } from 'vitest';

import { getAuthPhase } from '@/features/auth/auth-phase';

describe('getAuthPhase', () => {
  it('keeps navigation unavailable until the initial session check completes', () => {
    expect(getAuthPhase(false, null)).toBe('checking');
  });

  it('opens guest routes when no user exists', () => {
    expect(getAuthPhase(true, null)).toBe('signed-out');
  });

  it('requires phone verification when phone is unverified', () => {
    expect(
      getAuthPhase(true, {
        phoneNumberVerified: false,
        onboardingCompleted: false,
      }),
    ).toBe('needs-phone-verification');

    expect(
      getAuthPhase(true, {
        phoneNumberVerified: null,
        onboardingCompleted: false,
      }),
    ).toBe('needs-phone-verification');
  });

  it('requires profile onboarding when phone is verified but onboarding is incomplete', () => {
    expect(
      getAuthPhase(true, {
        phoneNumberVerified: true,
        onboardingCompleted: false,
      }),
    ).toBe('needs-onboarding');
  });

  it('opens the completed application for an onboarded user with verified phone', () => {
    expect(
      getAuthPhase(true, {
        phoneNumberVerified: true,
        onboardingCompleted: true,
      }),
    ).toBe('ready');
  });
});

