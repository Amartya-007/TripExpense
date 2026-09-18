/**
 * App Settings — the single hub for TripExpense's tunable, non-secret
 * configuration values: limits, thresholds, timings, and policy numbers.
 *
 * Open THIS file first when you want to change a number or limit
 * somewhere in the app. Every value below is either defined here, or
 * re-exported here from its dedicated home so you never have to go
 * hunting through feature code for a magic number again.
 *
 * What deliberately lives elsewhere (and is re-exported, not copied):
 *  - App identity (name, slug, bundle ids)     -> app-identity.json
 *  - Auth/security policy (password length…)   -> src/constants/auth-policy.ts
 *
 * Currency validation logic (src/lib/validation/currency-validation.ts) is
 * the other direction: it imports MAX_CURRENCY_AMOUNT/CURRENCY_SYMBOL/
 * CURRENCY_LOCALE FROM here, since a constants file should never depend on
 * a validation module (that way lies circular imports).
 *
 * What is intentionally NOT here:
 *  - Secrets and per-environment values (API URLs, keys) -> .env / .env.example
 *    (validated in src/server/env.ts and src/config/env.ts)
 *  - Design tokens (colors, spacing, radius, motion durations) -> src/theme/
 *    These are a design system, not app policy, and already have one
 *    clearly organised home per token type.
 *  - Structured mock/demo data (the trip, its people, its expenses) ->
 *    src/features/expenses/expenses-config.ts (TRIP_PEOPLE, MOCK_EXPENSES),
 *    src/features/home/dashboard-config.ts (DASHBOARD_MOCK_DATA),
 *    src/features/trips/trips-config.ts (TRIPS).
 *    These are fixture content standing in for a future backend
 *    (see implementation_plan.md), not scalar settings — moving them here
 *    would just relocate large arrays without making anything easier to
 *    find. They're listed here so you know where to look.
 */

import appIdentity from '../../app-identity.json';
import { authPolicy } from './auth-policy';

// ---------------------------------------------------------------------------
// App identity (re-exported from app-identity.json — edit values there)
// ---------------------------------------------------------------------------

export const appIdentitySettings = appIdentity;

// ---------------------------------------------------------------------------
// Currency & financial limits
// ---------------------------------------------------------------------------

/** Symbol shown before formatted rupee amounts across the app. */
export const CURRENCY_SYMBOL = '₹';

/** Locale used for currency/number formatting (toLocaleString calls). */
export const CURRENCY_LOCALE = 'en-IN';

/** Largest amount accepted in a single expense or trip budget field (₹1 crore). */
export const MAX_CURRENCY_AMOUNT = 10_000_000;

// ---------------------------------------------------------------------------
// Budget health thresholds (dashboard burn-rate / trip-stats status tone)
// ---------------------------------------------------------------------------

export const BUDGET_HEALTH_THRESHOLDS = {
  /** remainingPercentage below this value -> 'danger' status tone. */
  dangerBelowPercent: 20,
  /** remainingPercentage at/below this value (and above dangerBelowPercent) -> 'warning'. Above this -> 'success'. */
  warningAtOrBelowPercent: 50,
} as const;

// ---------------------------------------------------------------------------
// Settlement / debt-simplification (Settle Up screen)
// ---------------------------------------------------------------------------

/**
 * Balances within this many rupees of zero are treated as settled, so
 * floating-point split remainders don't produce a phantom ₹0.01 transfer.
 */
export const SETTLEMENT_EPSILON = 0.5;

// ---------------------------------------------------------------------------
// Username policy (onboarding)
// ---------------------------------------------------------------------------

export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 24;

// ---------------------------------------------------------------------------
// Auth & security policy — password rules, session length, OTP length/expiry/
// cooldown/rate-limit for both email and phone verification. Source of
// truth: src/constants/auth-policy.ts (shared by the server's Better Auth
// config in auth-server.ts/auth-options.ts and the client's OTP input/
// cooldown hook, so all three can never drift out of sync again).
// ---------------------------------------------------------------------------

export const authSecuritySettings = authPolicy;

/** How long the native Google Sign-In request waits before timing out. */
export const GOOGLE_SIGN_IN_TIMEOUT_MS = 15_000;

// ---------------------------------------------------------------------------
// Gesture tuning
// ---------------------------------------------------------------------------

/** Minimum horizontal swipe distance (px) the calendar DatePicker treats as a month-change gesture rather than a tap. */
export const DATE_PICKER_SWIPE_THRESHOLD_PX = 50;

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------

/** How many of the trip's most recent expenses show in the dashboard's "Recent" list. */
export const DASHBOARD_RECENT_EXPENSES_COUNT = 3;

// ---------------------------------------------------------------------------
// Receipt uploads — PLANNED, not yet wired to any code path.
// Values match the policy specified in implementation_plan.md's "File Upload
// Security Policy" section, ready for whenever real receipt upload (S3 +
// pre-signed URLs) is implemented. Keeping them here now means that work
// starts by importing a constant instead of inventing a new magic number.
// ---------------------------------------------------------------------------

export const RECEIPT_UPLOAD_SETTINGS = {
  allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'] as const,
  maxSizeBytes: 5 * 1024 * 1024, // 5MB
  presignedUrlExpiryMinutes: 15,
} as const;
