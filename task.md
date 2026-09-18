# Implementation Tasks

## Phase 1: Validation & Security
- [ ] NEW: `src/lib/validation/currency-validation.ts`
- [ ] MODIFY: `src/features/auth/validation/auth-schemas.ts` — email/name normalization
- [ ] MODIFY: `src/server/env.ts` — reject `SMS_PROVIDER=console` in production
- [ ] MODIFY: `scripts/audit-client-bundle.mjs` — add `BETTER_AUTH_API_KEY`
- [ ] MODIFY: `src/features/expenses/screens/add-expense.tsx` — amount sanitization + validation
- [ ] MODIFY: `src/features/trips/screens/create-trip.tsx` — budget sanitization + validation

## Phase 2: UI Components Accessibility
- [ ] MODIFY: `src/components/ui/button.tsx`
- [ ] MODIFY: `src/components/ui/input.tsx`
- [ ] MODIFY: `src/components/ui/alert.tsx`
- [ ] MODIFY: `src/components/ui/loading-indicator.tsx`
- [ ] MODIFY: `src/components/ui/avatar.tsx`
- [ ] MODIFY: `src/components/ui/app-text.tsx`
- [ ] MODIFY: `src/components/ui/bottom-sheet.tsx`
- [ ] MODIFY: `src/components/ui/confirm-dialog.tsx`

## Phase 3: Root Error Boundary
- [ ] MODIFY: `src/app/_layout.tsx` — export ErrorBoundary

## Phase 4: Tests
- [ ] NEW: `tests/currency-validation.test.ts`
- [ ] MODIFY: `tests/expenses-config.test.ts` — arithmetic regression tests
- [ ] MODIFY: `tests/auth-policy.test.ts` — normalization tests
- [ ] NEW: `tests/component-accessibility.test.ts`
- [ ] MODIFY: `tests/server-env.test.ts` — production SMS_PROVIDER check

## Phase 5: Verify
- [ ] Run `npm run check`
