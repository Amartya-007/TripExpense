import { z } from 'zod';

const E164_REGEX = /^\+[1-9]\d{7,14}$/;

export function normalizePhoneNumber(input: string, defaultCallingCode = '+91'): string {
  const trimmed = input.trim();
  if (!trimmed) return '';

  if (trimmed.startsWith('+')) {
    return '+' + trimmed.slice(1).replace(/\D/g, '');
  }

  const digits = trimmed.replace(/\D/g, '');
  const cleanCallingCode = defaultCallingCode.startsWith('+')
    ? defaultCallingCode
    : `+${defaultCallingCode}`;

  return `${cleanCallingCode}${digits}`;
}

export const phoneInputSchema = z.object({
  phoneNumber: z
    .string()
    .min(1, 'Enter your phone number')
    .transform((val) => normalizePhoneNumber(val, '+91'))
    .refine((val) => E164_REGEX.test(val), {
      message: 'Enter a valid mobile number with country code (e.g. +91 98765 43210)',
    }),
});

export const verifyPhoneOtpSchema = z.object({
  otp: z.string().trim().regex(/^\d{6}$/, 'Enter the six-digit code'),
});

export type PhoneInputValues = z.infer<typeof phoneInputSchema>;
export type VerifyPhoneOtpValues = z.infer<typeof verifyPhoneOtpSchema>;
