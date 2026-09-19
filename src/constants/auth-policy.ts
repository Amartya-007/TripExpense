const MINUTES_IN_SECONDS = 60;
const HOURS_IN_SECONDS = 60 * MINUTES_IN_SECONDS;
const DAY_IN_SECONDS = 24 * HOURS_IN_SECONDS;

export const authPolicy = {
  minimumPasswordLength: 8,
  maximumPasswordLength: 128,
  sensitiveActionFreshnessSeconds: 15 * MINUTES_IN_SECONDS,

  /**
   * One-time-code policy shared by email and phone verification. Previously
   * duplicated as separate `otpLength: 6` / `expiresIn: 5 * 60` /
   * `allowedAttempts: 3` literals in both the emailOTP and phoneNumber
   * plugin blocks in auth-server.ts, plus a third independent `otpLength = 6`
   * in the client's otp-code-input.tsx - a real risk of the UI's digit
   * boxes silently drifting out of sync with the server's actual code length.
   */
  otpLength: 6,
  otpExpirySeconds: 5 * MINUTES_IN_SECONDS,
  otpMaxAttempts: 3,
  /** How long a user must wait before requesting another OTP. */
  otpResendCooldownSeconds: MINUTES_IN_SECONDS,
  otpEmailRateLimit: { windowSeconds: MINUTES_IN_SECONDS, max: 3 },

  sessionExpiryDays: 30,
  sessionUpdateAgeDays: 1,
  apiRateLimit: { windowSeconds: MINUTES_IN_SECONDS, max: 100 },
} as const;

export { DAY_IN_SECONDS };
