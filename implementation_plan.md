# Production Audit & Implementation Plan: Security, Accessibility, and Architecture

We have performed an exhaustive multi-dimensional audit of the `expo-auth-starter` (TripExpense) project incorporating the four installed skills:
1. `frontend-mobile-development-component-scaffold`: Component scaffolding, TypeScript typing, accessibility (a11y) roles/labels/hints, focus & hit targets, and non-redundant screen reader experiences.
2. `frontend-mobile-security-xss-scan`: XSS vulnerability detection, safe HTML escaping, URL handling, Web/SSR security boundaries.
3. `mobile-security-coder`: Mobile-specific secure coding, input validation & normalization, IDOR protection, object storage (S3) boundaries, rate limiting, and zero-sensitive logging.
4. `react-native-architecture`: Expo Router conventions, root-level layout `ErrorBoundary` pattern, responsive theme tokens, and crash recovery.

---

## User Review Required

> [!IMPORTANT]
> The changes are intended to preserve existing business behavior. Accessibility defaults, input normalization, validation, and error handling can alter UI semantics or accepted input, so existing flows and component overrides must be regression tested.

---

## Audit Findings & Architectural Specifications

### 1. Accessibility Prop Precedence & Merging (`frontend-mobile-development-component-scaffold`)
- **Explicit Fallback & Non-Destructive Merging**:
  - Do NOT rely blindly on object spread order. Use explicit nullish fallback logic for accessibility props.
  - Caller-provided accessibility attributes must **always** take precedence over component defaults.
  - For `accessibilityState`: **Merge** states non-destructively rather than overwriting.
    - Example: In `Button`, if caller provides `accessibilityState={{ selected: true }}`, the component will compute:
      ```typescript
      accessibilityState={{
        ...props.accessibilityState,
        disabled: props.accessibilityState?.disabled ?? isDisabled,
        busy: props.accessibilityState?.busy ?? loading,
      }}
      ```
      This preserves `selected`, `checked`, `expanded`, etc.
  - Caller-provided `accessibilityRole` (e.g. `accessibilityRole="radio"` in `SettingsScreen` appearance toggle) must strictly override the default `'button'`.
  - Caller-provided `accessibilityLabel` must strictly override the default `label`.
- **Platform-Supported Accessibility Attributes Only**:
  - React Native 0.86.3 does not define `accessibilityErrorMessage`, `aria-invalid`, or `aria-modal` in its core native types. Adding them with type casts causes semantic conflicts or runtime warnings.
  - We use official React Native accessibility mechanisms:
    - iOS modality: `accessibilityViewIsModal={true}`
    - Android live regions: `accessibilityLiveRegion="polite"`
    - Hints: `accessibilityHint={error ? \`Error: \${error}\` : undefined}`
    - Screen reader alerts: Dedicated `<View accessibilityLiveRegion="polite" accessibilityRole="alert">` wrapping the error text.
- **Avoiding Redundant Announcements**:
  - `Avatar`: Because avatars in TripExpense are rendered immediately alongside visible text containing the user's name (in `ListRow` and headers), marking `Avatar` as an accessible image causes TalkBack and VoiceOver to announce the person's name twice. Default `Avatar` to `accessible={false}` and `importantForAccessibility="no"`, while allowing callers to pass `accessible={true}` if used standalone without text.
- **Dialog & Sheet Accessibility (`ConfirmDialog` & `BottomSheet`)**:
  - Modal container: `accessibilityViewIsModal={true}` for iOS, `accessibilityRole="alert"` or `"dialog"`.
  - Dismiss backdrops: Kept touch-interactive for tap-to-dismiss without registering as noisy, confusing accessibility buttons: `accessible={false}` and `importantForAccessibility="no"`.

---

### 2. Financial Calculations & Input Validation (`mobile-security-coder`)
- **Currency & Amount Validation (`src/lib/validation/currency-validation.ts`)**:
  - Format: Strictly matches digits with optional single dot and at most 2 decimal places (`^\d+(\.\d{1,2})?$`).
  - Rejection: Empty, zero, negative, `NaN`, `Infinity`, >2 decimal places, and values exceeding maximum.
  - Boundary: Define `MAX_CURRENCY_AMOUNT = 10_000_000` (₹10,000,000 / 1 crore), consistent with luxury group travel budgets while stopping overflow.
  - Explicit boundary tests:
    - `9999999.99` -> Valid
    - `10000000` -> Valid
    - `10000000.01` -> Rejected (exceeds limit)
- **Preserve Financial Arithmetic**:
  - Do NOT introduce new floating-point arithmetic or change data representations in `expenses-config.ts`.
  - Preserve `computeNetBalances` and `simplifyDebts` rounding behavior.
  - Add regression tests in `tests/expenses-config.test.ts` for:
    - `100 / 3`
    - `10 / 3`
    - `0.01 + 0.02`
    - `999.99` split between 3 people

---

### 3. Normalization & Mobile Keyboards
- **Email Normalization**:
  - `emailSchema` in `src/features/auth/validation/auth-schemas.ts`: Apply `.trim().toLowerCase()` so trailing spaces from mobile keyboard autocorrect/autofill or initial caps do not fail validation.
  - Add tests for uppercase, leading whitespace, trailing whitespace, and combined whitespace cases.
- **Name Normalization**:
  - `signUpSchema.name`: Apply `.trim()` to reject whitespace-only strings while strictly preserving internal spacing and international Unicode names (`René`, `José`, `張偉`).

---

### 4. Root Error Boundary (`react-native-architecture`)
- **Pattern**: Export `ErrorBoundary({ error, retry }: ErrorBoundaryProps)` directly from `src/app/_layout.tsx`.
- **UI & Messaging**:
  - Theme-compliant recovery screen using `Screen`, `HeroPanel`, `Button`, and `useAppTheme()`.
  - Neutral production message:
    *"Something went wrong while loading this screen. Please try again."*
    (Avoids unsubstantiated claims like "Your data is safe").
  - Development mode (`__DEV__`): displays error name and message for debugging.
- **Actions & Retry Throttling**:
  - "Try again" button calls Expo Router's `retry()` function directly.
  - Guard against rapid repetitive clicking via local `isRetrying` state. No timers, persistence, or global machinery.
  - "Return home" button triggers `router.replace('/')`.

---

### 5. Deep Security Audit
- **Authorization & IDOR**:
  - Trips, expenses, receipts, and participant data currently exist in client memory (`TripDataProvider`, `TripsListProvider`) as deliberate stand-ins for the upcoming trip backend.
  - Server endpoints (`onboarding`, `demo`):
    - `onboarding-handler.ts`: Queries session via `getAuth().api.getSession({ headers: request.headers })` and updates strictly via `session.user.id`.
    - `demo-handler.ts`: Strictly enforces session presence and profile completion.
  - Add regression tests verifying that unauthenticated or spoofed requests cannot access or alter protected resources.
- **S3 & Object Storage Verification**:
  - AWS credentials (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `S3_BUCKET`, `AWS_ENDPOINT_URL_S3`) exist in `.env` for server-side use.
  - `scripts/audit-client-bundle.mjs`: Audits web and native bundles. We add `BETTER_AUTH_API_KEY` to `serverOnlyVariables` to guarantee zero server secrets leak into the client bundle.
  - Storage policy: Receipts and private media must use private S3 buckets with time-limited pre-signed URLs (e.g. 15-minute expiry) issued only after verifying trip membership; never direct public bucket access.
- **File Upload Security Policy**:
  - Audit receipt/avatar uploads:
    - Whitelist MIME types: `image/jpeg`, `image/png`, `image/webp`. Reject active formats like SVG.
    - Validate file extension independently from MIME type.
    - Enforce size limit (max 5MB).
    - Generate server-side UUID keys; never use client-provided file names.
- **Repository-Wide Sensitive Logging Audit**:
  - Search conducted across repository for `console.log`, `console.error`, `logger`, `Serilog`, `request.headers`, `authorization`, `cookie`, `token`, `password`, `OTP`:
    - `console.log`: 0 matches in `src/`.
    - `console.error`: 1 match in `server-error-reporter.ts` with compile-time allowlisted safe event objects.
    - `console.info`: 1 match in `console-provider.ts` for Dev SMS console.
    - **Vulnerability Found & Fix**: In production, if `SMS_PROVIDER=console` were set, OTPs would log to stdout. We harden `src/server/env.ts` to reject `SMS_PROVIDER=console` in production!
- **Web Security**:
  - Web export audited for XSS, CSRF, CORS, cookies, open redirects:
    - XSS: 0 instances of `dangerouslySetInnerHTML` or raw DOM injection; `escapeHtml` is used in email delivery.
    - CSRF/CORS: Better Auth handles origin verification via `AUTH_TRUSTED_ORIGINS`.
    - Cookies: `cookiePrefix: 'better-auth'` with secure session tokens.
    - Cache Control: `private, no-store` enforced on all protected endpoints.

---

## Proposed Changes

### UI Components (`src/components/ui/`)

#### [MODIFY] [button.tsx](file:///e:/expo-auth-starter/src/components/ui/button.tsx)
- Non-destructive `accessibilityState` merging (`...props.accessibilityState`, defaulting `disabled` and `busy`).
- Default `accessibilityRole="button"`, respecting caller `props.accessibilityRole`.
- Default `accessibilityLabel={label}`, respecting caller `props.accessibilityLabel`.

#### [MODIFY] [input.tsx](file:///e:/expo-auth-starter/src/components/ui/input.tsx)
- Non-destructive `accessibilityState` merging (preserving caller state, defaulting `disabled`).
- Default `accessibilityLabel={label ?? props.placeholder}`.
- `accessibilityHint={error ? \`Error: \${error}\` : undefined}`.
- Error message wrapped in `<View accessibilityLiveRegion="polite" accessibilityRole="alert">`.

#### [MODIFY] [alert.tsx](file:///e:/expo-auth-starter/src/components/ui/alert.tsx)
- Default `accessibilityRole="alert"` and `accessibilityLiveRegion="polite"` (preserving caller overrides).

#### [MODIFY] [loading-indicator.tsx](file:///e:/expo-auth-starter/src/components/ui/loading-indicator.tsx)
- Default `accessibilityRole="progressbar"`, `accessibilityLabel={label ?? 'Loading'}`, `accessibilityLiveRegion="polite"`.

#### [MODIFY] [avatar.tsx](file:///e:/expo-auth-starter/src/components/ui/avatar.tsx)
- Default `accessible={false}` and `importantForAccessibility="no"` to avoid duplicate name announcement next to text. Respect caller `accessible={true}`.

#### [MODIFY] [app-text.tsx](file:///e:/expo-auth-starter/src/components/ui/app-text.tsx)
- Default `accessibilityRole="header"` only for `hero` and `title` variants when `props.accessibilityRole` is undefined.

#### [MODIFY] [bottom-sheet.tsx](file:///e:/expo-auth-starter/src/components/ui/bottom-sheet.tsx)
- Sheet view: `accessibilityViewIsModal={true}`, `accessibilityRole="dialog"`.
- Backdrop: `accessible={false}`, `importantForAccessibility="no"`.

#### [MODIFY] [confirm-dialog.tsx](file:///e:/expo-auth-starter/src/components/ui/confirm-dialog.tsx)
- Dialog container: `accessibilityViewIsModal={true}`, `accessibilityRole="alert"`.
- Backdrop: `accessible={false}`, `importantForAccessibility="no"`.

---

### Validation, Security & Server (`src/server/`, `src/lib/`, `scripts/`)

#### [NEW] [currency-validation.ts](file:///e:/expo-auth-starter/src/lib/validation/currency-validation.ts)
- `validateCurrencyAmount(input: string | number)` enforcing `(0, 10_000_000]` bounds, finite positive number, at most 2 decimal places.

#### [MODIFY] [auth-schemas.ts](file:///e:/expo-auth-starter/src/features/auth/validation/auth-schemas.ts)
- Normalize email: `.trim().toLowerCase()`.
- Normalize name: `.trim()` while preserving Unicode names.

#### [MODIFY] [env.ts](file:///e:/expo-auth-starter/src/server/env.ts)
- Disallow `SMS_PROVIDER=console` in production to prevent OTP logging.

#### [MODIFY] [audit-client-bundle.mjs](file:///e:/expo-auth-starter/scripts/audit-client-bundle.mjs)
- Add `BETTER_AUTH_API_KEY` to `serverOnlyVariables`.

#### [MODIFY] [add-expense.tsx](file:///e:/expo-auth-starter/src/features/expenses/screens/add-expense.tsx)
- Input sanitization (numbers + single decimal separator) and validation with `validateCurrencyAmount`.

#### [MODIFY] [create-trip.tsx](file:///e:/expo-auth-starter/src/features/trips/screens/create-trip.tsx)
- Input sanitization and validation with `validateCurrencyAmount`.

---

### Root Error Boundary (`src/app/_layout.tsx`)

#### [MODIFY] [_layout.tsx](file:///e:/expo-auth-starter/src/app/_layout.tsx)
- Export `ErrorBoundary({ error, retry }: ErrorBoundaryProps)`.
- Neutral message in production (*"Something went wrong while loading this screen. Please try again."*).
- Safe retry with local double-click guard and "Return home" button.

---

### Tests

#### [NEW] [currency-validation.test.ts](file:///e:/expo-auth-starter/tests/currency-validation.test.ts)
- Tests for: valid integers, 2 decimals, rejecting >2 decimals, multiple dots, non-numeric, 0, negatives, `NaN`, `Infinity`, and boundary values (`9999999.99`, `10000000`, `10000000.01`).

#### [MODIFY] [expenses-config.test.ts](file:///e:/expo-auth-starter/tests/expenses-config.test.ts)
- Financial calculation regression tests: `100 / 3`, `10 / 3`, `0.01 + 0.02`, `999.99` split between 3 people.

#### [MODIFY] [auth-policy.test.ts](file:///e:/expo-auth-starter/tests/auth-policy.test.ts)
- Email normalization tests: uppercase, leading/trailing/mixed whitespace.
- Name normalization tests: Unicode characters (`René`, `José`, `張偉`), whitespace trimming, rejection of whitespace-only names.

#### [NEW] [component-accessibility.test.ts](file:///e:/expo-auth-starter/tests/component-accessibility.test.ts)
- Unit tests for component accessibility defaults and overrides:
  - `Button`: role `'button'`, custom role override (`'radio'`), label, disabled/busy merging without losing caller state (`selected: true`).
  - `Input`: label fallback, hint, error alert container.
  - `Alert`: role `'alert'`, live region.
  - `LoadingIndicator`: role `'progressbar'`, label.
  - `Avatar`: `accessible={false}` default, caller override.
  - `AppText`: role `'header'` default on hero/title, caller role override.

#### [MODIFY] [server-env.test.ts](file:///e:/expo-auth-starter/tests/server-env.test.ts)
- Assert `SMS_PROVIDER=console` is rejected in production.

---

## Verification Plan

### Automated Verification
- Run `npm run typecheck` (`tsc --noEmit`) to verify 0 type errors.
- Run `npm run lint` (`expo lint`) to verify ESLint compliance.
- Run `npm run test` (`vitest run`) to verify all existing and new test suites pass.
- Run `npm run check` for full CI check.

### Manual Verification
- Verify screen reader accessibility role/label presence in UI components.
- Verify TalkBack and VoiceOver navigation on Android/iOS.
- Verify error boundary layout styling matches app theme in both dark and light modes.
