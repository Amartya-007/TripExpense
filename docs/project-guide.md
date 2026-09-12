# Project Guide

This document is the practical reference for developing, regenerating, testing, and releasing TripExpense. It records the project conventions and native setup decisions that are easy to lose when generated files or local caches are removed.

For deeper design details, see [Architecture](architecture.md), [Provider setup](providers.md), and [Production](production.md).

## Project Shape

```text
src/app/                 Expo Router routes and thin API entry points
src/features/            Feature screens, hooks, validation, and contracts
src/components/ui/       Shared presentation primitives
src/lib/                 Client-safe API, auth, storage, and device adapters
src/providers/           App-wide React providers
src/server/              Better Auth, database, email, SMS, health, and observability
src/theme/               Theme tokens and provider
src/constants/           Identity, auth policy, and user-field definitions
drizzle/                 Reviewed SQL migrations and snapshots
plugins/                 Expo config plugins for generated native projects
scripts/                 Build and bundle maintenance scripts
docs/                    Architecture, providers, production, and project guides
```

Keep server-only code and secrets out of client imports. Route guards improve navigation, but every protected API must validate the session on the server.

## Authentication Flow

The application derives one of these phases:

```text
checking
  -> signed-out
  -> needs-phone-verification
  -> needs-onboarding
  -> ready
```

The normal new-user flow is:

1. Create an email/password account or authenticate with Google/Apple.
2. Verify the email when Better Auth requires it.
3. Enter a phone number and verify the SMS OTP.
4. Choose a unique username.
5. Optionally enable the device app lock.
6. Enter the dashboard.

Google and Apple identities do not bypass phone verification or required onboarding. The root entry route uses the refreshed auth phase to select `/verify-phone`, `/profile`, or `/dashboard`.

### Email/password

- Registration requires a password of at least 15 characters.
- Sign-in accepts existing shorter passwords so policy changes do not lock out old users.
- Email verification and password recovery use six-digit OTPs.
- `rememberMe` controls Better Auth session persistence and defaults to enabled in the sign-in form.

### Google

Google sign-in is native-only and requires a development build, not Expo Go. The client obtains a Google ID token and sends it to Better Auth. The server verifies the token audience and establishes the application session.

The Android credential flow is:

```text
signIn()
  -> createAccount() when there is no saved credential
  -> presentExplicitSignIn() as a final fallback
  -> send ID token to Better Auth
  -> refresh session
  -> phone verification or onboarding
```

A normal user cancellation returns `cancelled` and should not show an error. Native developer/configuration failures and server token failures are shown as errors.

## Environment

Copy the example file and keep the real `.env` local:

```powershell
Copy-Item .env.example .env
```

Required server values include:

```dotenv
DATABASE_URL=postgresql://...
BETTER_AUTH_SECRET=at-least-32-random-characters
BETTER_AUTH_URL=http://localhost:8081
EMAIL_FROM=TripExpense <onboarding@resend.dev>
RESEND_API_KEY=re_...
```

Required client values include:

```dotenv
EXPO_PUBLIC_API_URL=http://localhost:8081
EXPO_PUBLIC_APP_ENV=development
```

Google requires all four values together:

```dotenv
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=...
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=...
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

Only `EXPO_PUBLIC_` values are allowed in the client bundle. Database URLs, Better Auth secrets, email keys, SMS keys, and the Google client secret are server-only.

For local SMS testing:

```dotenv
SMS_PROVIDER=console
```

For the hosted Vendel gateway:

```dotenv
SMS_PROVIDER=vendel
VENDEL_URL=https://app.vendel.cc
VENDEL_API_KEY=vk_...
```

See [Provider setup](providers.md) for Resend, Vendel, Google, Apple, and biometric configuration.

## Android SDK and Native Regeneration

`android/` is a generated native project. `npx expo prebuild --clean --platform android` deletes and recreates it.

The config plugin in [with-android-local-config.js](../plugins/with-android-local-config.js) recreates `android/local.properties` after every prebuild. It finds the SDK from `ANDROID_HOME`, `ANDROID_SDK_ROOT`, or the standard Windows/macOS SDK location.

The local SDK properties file is intentionally ignored by Git. If Gradle reports `SDK location not found`, verify:

```powershell
Test-Path "$env:LOCALAPPDATA\Android\Sdk"
Test-Path android\local.properties
```

The expected local file contains an SDK path, for example:

```properties
sdk.dir=C:/Users/<user>/AppData/Local/Android/Sdk
```

Persistent Windows user variables can also be set once:

```powershell
[Environment]::SetEnvironmentVariable('ANDROID_HOME', "$env:LOCALAPPDATA\Android\Sdk", 'User')
[Environment]::SetEnvironmentVariable('ANDROID_SDK_ROOT', "$env:LOCALAPPDATA\Android\Sdk", 'User')
```

Restart VS Code after changing user environment variables.

## Android Debug Signing

Google Android OAuth uses the package name plus the certificate SHA-1. Always inspect the certificate Gradle actually uses:

```powershell
cd android
.\gradlew.bat :app:signingReport
cd ..
```

The project can optionally use a stable project-specific debug keystore. This is deliberately opt-in to avoid standardizing a debug signing key across developers or CI:

```powershell
$env:EXPO_STABLE_DEBUG_KEYSTORE="1"
npx expo prebuild --clean --platform android
npx expo run:android
```

The opt-in keystore is expected at:

```text
%USERPROFILE%\.android\tripexpense-debug.keystore
```

Without `EXPO_STABLE_DEBUG_KEYSTORE=1`, Expo's normal generated debug signing configuration is preserved. The stable keystore is disabled automatically in CI and outside development.

Never use a debug keystore for a production release. Register separate SHA-1 fingerprints for local debug, EAS/Play signing, and other release certificates as needed.

## Native Dependency Patches

The postinstall script [patch-android-stl.mjs](../scripts/patch-android-stl.mjs) patches third-party Android CMake/Kotlin configuration so native libraries link correctly with the shared C++ runtime and Nitro Kotlin sources.

It is idempotent:

```powershell
node scripts/patch-android-stl.mjs
```

It reports already-patched files and fails if a required dependency or source pattern is missing. If dependencies are upgraded, run `npm install` and inspect any patch failure before building. Do not edit the generated files in `node_modules` as the permanent fix; update the patch script instead.

## Common Commands

```powershell
npm install
npm start
npm run android
npm run ios
npm run typecheck
npm run lint
npm test
npm run check
npm run audit:client
npm run db:generate
npm run db:migrate
npm run db:studio
```

Useful native diagnostics:

```powershell
npx expo config --type public
cd android
.\gradlew.bat projects
.\gradlew.bat :app:signingReport
.\gradlew.bat app:assembleDebug -x lint -x test --configure-on-demand --build-cache -PreactNativeArchitectures=arm64-v8a
cd ..
```

If the Android device is connected over USB and Metro runs on the development machine:

```powershell
adb reverse tcp:8081 tcp:8081
```

## Troubleshooting

### Gradle cannot find the SDK

1. Confirm the SDK exists.
2. Confirm `android/local.properties` exists.
3. Restart VS Code if environment variables were changed.
4. Stop stale Gradle daemons:

```powershell
cd android
.\gradlew.bat --stop
cd ..
```

### Google account picker opens, then no navigation

1. Confirm the native development build was rebuilt after changing OAuth settings.
2. Run `:app:signingReport` and copy the actual debug SHA-1 into the Android OAuth client.
3. Confirm the Android package exactly matches `app-identity.json` and Google Cloud.
4. Confirm the Web, iOS, Android client IDs, and server Google client secret are all configured.
5. Check the Metro log for the server response or native developer error.

Metro-only reloads do not update native OAuth configuration. Use `npx expo run:android` after changing package names, SHA-1 fingerprints, native plugins, or OAuth credentials.

### Native build fails after dependency installation

Run:

```powershell
node scripts/patch-android-stl.mjs
npm run typecheck
```

Then rebuild. If the patch script reports a missing pattern, inspect the dependency version and update the patch deliberately.

### Local app cannot reach the API

- Android emulator: use the configured development origin or `adb reverse`.
- Physical device: the device must reach the machine's LAN IP, not `localhost`.
- Confirm `EXPO_PUBLIC_API_URL` and `BETTER_AUTH_URL` use the same reachable origin.
- Check `GET /api/health` before debugging authentication.

## Database and Migrations

Migrations in `drizzle/` are committed and should be reviewed before applying:

```powershell
npm run db:generate
npm run db:migrate
```

Do not edit an already-applied migration to change production behavior. Add a new migration and update the server schema/contracts together.

## Before Production

Use [Production](production.md) as the release checklist. At minimum:

- Use HTTPS for deployed API/auth origins.
- Generate new production secrets in a secret manager.
- Configure exact trusted origins and proxy/IP behavior.
- Configure production Google and Apple signing credentials.
- Do not use the stable local debug keystore.
- Test email, Google, Apple, phone OTP, onboarding, logout, recovery, deletion, biometrics, and offline recovery on physical devices.
- Run `npm run check` and `npm run audit:client`.
- Configure account deletion requirements for Google Play and Apple before store submission.
