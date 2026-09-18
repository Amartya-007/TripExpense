# AGENTS.md — TripExpense project context

This file exists so a human or an AI agent can pick up this repository and be
useful immediately, without having to open and cross-reference every file by
hand. Read this first. It links out to the deeper docs where they exist and
fills in the gaps they don't cover (current product state, workflow
conventions, and what the open audit plan has and hasn't actually done).

Last verified against commit `c3ad3cb` on branch `UI-Design` (2026-09-19).

---

## 1. What this project is

TripExpense is a React Native / Expo mobile app for splitting shared trip
expenses with a group of friends — similar in spirit to Splitwise, scoped to
a single trip at a time. Repo: `github.com/Amartya-007/TripExpense`.

The codebase started from a general-purpose "expo-auth-starter" boilerplate
(hence `package.json`'s `name` field still reading `expo-auth-starter` —
that's leftover naming, not a mistake; the actual app identity is
`TripExpense` / slug `trip-expense`, defined in `app-identity.json`). The
auth/infra layer (email+password, Google, Apple, phone OTP, onboarding,
biometrics, Better Auth, Drizzle/Postgres) came from that starter and is
thoroughly documented already (see §7). The trip-expense product itself
(dashboard, expenses, trips, settle-up) is custom, newer, and is what most
active work targets.

**The most important thing to know about the current state:** all trip,
expense, and people data is client-side, in-memory mock data
(`TRIP_PEOPLE`, `MOCK_EXPENSES`, `DASHBOARD_MOCK_DATA`, `TRIPS` — see §3).
There is no trips/expenses backend yet. The real backend that exists
(Better Auth + Drizzle + Postgres) only covers accounts/auth, not trip data.
Don't assume an expense you create persists anywhere beyond the current
in-memory provider.

## 2. Tech stack

- **Expo Router** (file-based routing) — routes live in `src/app/`
- **Better Auth** — email/password, Google, Apple, phone OTP — server config in `src/server/auth/`
- **Drizzle ORM + Neon/PostgreSQL** — `src/server/db/`, migrations in `drizzle/`
- **TanStack Query**, **React Native Reanimated**, **react-hook-form + zod**
- Architecture is features-based: `src/features/<domain>/{screens,components,hooks,validation}`
- Path alias: `@/*` → `./src/*` (see `tsconfig.json`)

## 3. Repo map

```text
src/app/                 Expo Router routes (thin — screens live in src/features)
src/features/            Feature screens, hooks, validation, domain logic
  auth/                  Sign-in/up, OTP, forgot/reset password (starter)
  onboarding/            Username + phone verification (starter)
  biometrics/            Device app-lock (starter)
  account/               Settings screen (starter)
  home/                  Dashboard screen (PRODUCT) — dashboard-config.ts (mock data), trip-stats.ts (budget math)
  expenses/              Add/list/detail expense screens (PRODUCT) — expenses-config.ts (mock data + domain logic: computeNetBalances, simplifyDebts)
  trips/                 Create trip / trip switcher (PRODUCT) — trips-config.ts (mock data)
  settle/                Settle Up screen (PRODUCT)
src/components/ui/       Shared presentation primitives (Button, Input, Card, BottomSheet, DatePicker, ...)
src/constants/           app-settings.ts (READ THIS for any tunable value), auth-policy.ts, app-config.ts, auth-user-fields.ts
src/lib/                 Client-safe API/auth/storage/validation/format helpers
src/theme/               Design tokens: colors.ts, spacing.ts, radius.ts, typography.ts, motion.ts
src/providers/           App-wide React providers
src/server/              Better Auth, Drizzle, email, SMS, health, observability (server-only)
drizzle/                 Reviewed SQL migrations
plugins/                 Expo config plugins for generated native projects
scripts/                 Build/bundle maintenance (native dependency patches, client-bundle audit)
docs/                    Deep-dive docs (architecture, providers, production, project-guide) — see §7
implementation_plan.md   A security/accessibility/architecture audit — see §5 for its current status
task.md                  The audit's task checklist — see §5
```

## 4. Where to change a hardcoded value

**`src/constants/app-settings.ts`** is the hub — open it first. It defines
or re-exports every tunable, non-secret number/string in the app: currency
symbol/locale/ceiling, budget-health thresholds, settlement tolerance,
username length, Google Sign-In timeout, date-picker swipe threshold,
dashboard recent-expenses count, and (via re-export) the full auth/security
policy. Its own header comment explains what's deliberately *not* there and
why (secrets → `.env`; design tokens → `src/theme/`; mock/demo data → each
feature's `*-config.ts`).

**`src/constants/auth-policy.ts`** holds everything shaped like a Better
Auth option: password length, session expiry, OTP length/expiry/attempts/
cooldown/rate-limit. It's imported by both the server (`auth-server.ts`,
`auth-options.ts`) and the client (OTP input box, resend-cooldown hook) —
previously these were three independent hardcoded copies of the same
numbers (a real drift risk if only one got changed); they're now one source
of truth.

**`src/lib/format/currency.ts`** is the shared `formatCurrency` /
`formatCurrencyRounded`. It replaced six near-identical local
`formatCurrency` functions that used to be copy-pasted across dashboard,
expenses list, expense row, expense detail, category breakdown, and settle
— plus two more inline `₹`/`toLocaleString('en-IN')` literals in
add-expense. Changing the currency symbol or locale now means editing
`app-settings.ts` once instead of eight files.

**Mock/demo data** (the actual trip, people, and expenses shown in the app)
is intentionally *not* in the settings hub — it's structured fixture
content standing in for a future backend, not a scalar setting:
- People + expenses + settlement logic → `src/features/expenses/expenses-config.ts`
- Dashboard trip summary → `src/features/home/dashboard-config.ts`
- Trip list (multi-trip preview) → `src/features/trips/trips-config.ts`

**Design tokens** (colors, spacing, radius, typography, animation timing)
→ `src/theme/`, already well organized per token type. Don't add design
values to `app-settings.ts`.

**Environment/secrets** (API URLs, DB connection string, provider keys) →
`.env` (copy from `.env.example`), validated in `src/server/env.ts` and
`src/config/env.ts`. Never hardcode these in source.

## 5. Audit status — implementation_plan.md / task.md

An earlier session ran a security/accessibility/architecture audit and
wrote `implementation_plan.md` + `task.md` (a 5-phase checklist) into the
repo. As of this file's last-verified commit, actual implementation status
(verified by reading the code, not by trusting the checkboxes, which are
all still unchecked in task.md itself):

- **Phase 1 (validation & security) — ✅ all 6 done.** `currency-validation.ts`
  exists; email/name normalization is in `auth-schemas.ts`; `env.ts` rejects
  `SMS_PROVIDER=console` in production; `BETTER_AUTH_API_KEY` is in
  `audit-client-bundle.mjs`'s `serverOnlyVariables`; add-expense/create-trip
  both validate through `validateCurrencyAmount`.
- **Phase 2 (UI accessibility) — ✅ all 8 components done.** button, input,
  alert, loading-indicator, avatar, app-text, bottom-sheet, confirm-dialog
  all carry the specified accessibility roles/states/live-regions.
- **Phase 3 (root ErrorBoundary in `src/app/_layout.tsx`) — ❌ not started.**
  No `ErrorBoundary` export exists in `_layout.tsx` as of the last-verified
  commit, despite that file having since changed for other reasons. This is
  the biggest remaining gap from the audit.
- **Phase 4 (tests) — ❌ mostly not started.** Only the
  `server-env.test.ts` production-SMS-provider test exists. Missing:
  `tests/currency-validation.test.ts` (new), the specified arithmetic
  regression cases in `tests/expenses-config.test.ts`, normalization tests
  in `tests/auth-policy.test.ts`, and `tests/component-accessibility.test.ts`.
- **Phase 5 (verify) —** see §6 for current actual status.

**Don't take task.md's unchecked boxes at face value in either direction —
verify against the code.** This section itself needs re-verification if
you're reading it long after the commit noted at the top.

## 6. Current build health (verified 2026-09-19, commit `c3ad3cb`)

Run from a fresh `npm install` (native postinstall scripts skipped in a
non-Android sandbox; run them for real on your dev machine):

- `npm run typecheck` — **1 pre-existing failure**, unrelated to any recent
  hardcoded-value refactor: `tests/expenses-config.test.ts` builds a
  `Record<PersonId, number>` fixture with only 4 of the 8 `PersonId` keys
  (the "New UI for all screens" commit expanded `TRIP_PEOPLE`/`PersonId`
  from 4 people to 8; the test fixture wasn't updated to match).
- `npm run lint` — clean (2 pre-existing warnings in `add-expense.tsx`:
  unused `Image` import, unused `amountError` variable — harmless, not
  errors).
- `npm run test` — **70/72 passing.** The 2 failures are in
  `tests/expenses-config.test.ts` (`computeNetBalances > matches the
  dashboard mock totals`, `getExpense > finds an expense by id`) — same
  root cause as above: the mock expense data changed (new total, renamed
  titles) in the same commit, and the test's hardcoded expectations
  (`32750`, `'Flight/cab from airport'`) weren't updated to match
  (`60680`, `'Airport cab'`).

None of the above three issues were introduced by the hardcoded-values
centralization work described in §4 — that work was verified with a clean
typecheck/lint pass and zero new test failures (confirmed by diffing
against the pre-refactor commit). They're pre-existing from the mock-data
expansion in `c3ad3cb` and are good candidates for the next session.

## 7. Deeper documentation (don't duplicate — read these directly)

- **`README.md`** — the starter template's setup README (still mostly
  boilerplate-flavored; environment setup, native build basics).
- **`docs/architecture.md`** — the starter's architecture: auth phases,
  route structure, session lifecycle. Covers the auth-starter layer, not
  the trip-expense product screens.
- **`docs/project-guide.md`** — practical reference: project shape, auth
  flow, environment variables, Android SDK/native regeneration, common
  commands, troubleshooting, database/migrations, pre-production checklist.
  **Read this before any native build work.**
- **`docs/providers.md`** — Resend (email), Vendel (SMS), Google, Apple,
  biometric provider setup.
- **`docs/production.md`** — release checklist.
- **`docs/TripExpense_SMS_Architecture_and_Decisions.md`** — SMS/OTP
  provider architecture and the reasoning behind it.

## 8. Branch strategy & collaboration workflow

- **`UI-Design`** — where all new product UI work happens. **`main`** — kept
  stable (auth/infra fixes land here).
- Amar (the developer) often pushes changes from his local machine
  mid-session. When resuming work, `git pull` first and review what changed
  before continuing — don't assume the state you last saw is current.
- Amar's explicit preference: **push to GitHub directly and immediately
  after each meaningful batch of work.** If it isn't pushed, he has no
  visibility into what was done. Don't batch multiple sessions' worth of
  work into one delayed push.
- Audit-before-coding: do a full reconnaissance of the relevant existing
  code (theme, primitives, routing, config) before writing new UI or
  refactoring. This has caught real bugs before (e.g. a settlement
  arithmetic error in mock data, found by testing domain logic before
  wiring it to screens).
- Domain/business logic gets unit-tested before being wired into screens
  where practical.
- A GitHub PAT is used for direct repo access during agent sessions. Treat
  it as a credential: use it to clone/push, immediately set the git remote
  back to a token-free URL after cloning so it doesn't linger in
  `.git/config`, and never write it into any file, commit, or document
  (including this one).

## 9. Known issues & hard-won gotchas

- **`sentinel()` Better Auth plugin is intentionally excluded** — its
  `sentinelNativeClient` collapses `session.user` to type `never` app-wide
  when combined with `inferAdditionalFields`. Don't re-add it without
  solving that typing conflict first.
- **Native rebuild requirement:** any native package version change needs
  `npx expo run:android`, not just a Metro restart, or you'll hit
  `NitroModules not found`. `plugins/with-android-local-config.js` and
  `scripts/verify-native-dependencies.mjs` exist to help catch this early.
- **Theme token semantics matter:** a past theme commit redefined
  `mint`/`aqua`/`peach`/`lavender` as pale background tints, which made
  person-identity color dots (in `TRIP_PEOPLE`) nearly invisible. Person
  colors deliberately use structurally solid tokens (`primary`/`accent`/
  `secondary`/`info`), not the decorative tint tokens. Verify token
  semantics after any theme change.
- **Modal animation:** React Native's `Modal animationType="slide"`
  animates backdrop and sheet as one block, which looks wrong for a
  bottom-sheet UX. `BottomSheet` and `DatePicker` were both migrated off
  `<Modal>` to independent Reanimated-driven fade (backdrop) + slide
  (sheet) animations.
- **Better Auth plugin ordering/import path matters:** `dash()` plugin
  placement and importing from `@better-auth/infra/native` (not the
  browser `/client` entry) were both previously sources of real bugs
  (stalled OAuth, type errors).
- Build on the existing theme tokens and component primitives already in
  place — don't introduce a parallel design system.

## 10. Common commands

```powershell
npm install
npm start
npm run android
npm run ios
npm run typecheck
npm run lint
npm test
npm run check          # typecheck + lint + test
npm run audit:client   # checks no server secrets leak into the client bundle
npm run db:generate
npm run db:migrate
```

See `docs/project-guide.md` for native/Android specifics (SDK setup,
signing, prebuild, troubleshooting) — those steps only work on Amar's own
machine with the Android SDK installed, not in a CI/sandbox context.
