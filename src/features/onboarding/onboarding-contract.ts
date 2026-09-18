import { z } from 'zod';

import { USERNAME_MAX_LENGTH, USERNAME_MIN_LENGTH } from '@/constants/app-settings';

export const completeOnboardingSchema = z.object({
  username: z
    .string()
    .trim()
    .toLowerCase()
    .min(USERNAME_MIN_LENGTH, `Username must contain at least ${USERNAME_MIN_LENGTH} characters`)
    .max(USERNAME_MAX_LENGTH, `Username must contain at most ${USERNAME_MAX_LENGTH} characters`)
    .regex(
      /^[a-z][a-z0-9_]*$/,
      'Use lowercase letters, numbers, or underscores, starting with a letter',
    ),
});

export type CompleteOnboardingInput = z.infer<typeof completeOnboardingSchema>;

export type CompleteOnboardingResponse = {
  user: {
    id: string;
    username: string;
    onboardingCompleted: true;
    onboardingCompletedAt: string;
  };
};
