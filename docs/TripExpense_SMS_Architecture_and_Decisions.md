# TripExpense SMS Verification
## Final Architecture and Decision Document

**Status:** Implemented / Architecture Baseline  
**Date:** 10 September 2026  
**Project:** TripExpense  
**Primary SMS Gateway:** Hosted Vendel (`https://app.vendel.cc`)  
**Physical Device / Transport:** Registered Android phone + SIM  
**Self-Hosting (Docker):** Optional future deployment alternative (NOT required currently)  
**Production Gateway:** Hosted Vendel / future DLT-compliant aggregator (replaceable)  
**Authentication:** Better Auth  
**Target Market:** India  

---

# 1. Purpose

This document defines the architecture and decision baseline for mandatory phone-number verification in TripExpense.

The goals are:
- Add mandatory phone-number verification to TripExpense.
- Keep the SMS delivery layer independent from any single provider via an adapter interface.
- Use the official hosted Vendel gateway (`https://app.vendel.cc`) connected to a registered physical Android device with a SIM.

The active architecture is:

```text
TripExpense Expo App
       ↓
TripExpense Backend / API
       ↓
Better Auth (generates & verifies OTP)
       ↓
SmsService (internal dispatcher)
       ↓
VendelSmsProvider (adapter)
       ↓ HTTPS (X-API-Key)
Hosted Vendel Service (https://app.vendel.cc)
       ↓ Push / WebSocket
Registered Android Phone
       ↓ Cellular Network
Physical SIM
       ↓ GSM / LTE SMS
User's Phone
```

Docker is **not** a required component of this architecture. Self-hosting Vendel with Docker is documented solely as an optional future infrastructure choice.

---

# 2. Decisions Made

## Decision 1: Phone verification is mandatory

After email verification, a signed-in user who has not verified a phone number must complete phone verification before proceeding to username/profile setup and app-lock onboarding.

The resulting flow is:

```text
Email signup
    ↓
Email verification
    ↓
Phone verification (mandatory, no skip)
    ↓
Username / profile / app lock
    ↓
Dashboard
```

There is no skip option for phone verification.

---

## Decision 2: Better Auth remains responsible for OTP state

Better Auth's `phoneNumber` plugin is the sole authentication authority.

It handles:
- OTP generation (6 digits)
- OTP storage & hashing
- OTP expiration (300 seconds)
- OTP verification
- Phone-number verification state (`phoneNumberVerified`)

The SMS system is responsible **only** for delivering the generated OTP code. The SMS provider never generates or validates OTPs.

---

## Decision 3: Decoupled SMS provider architecture

TripExpense is not coupled directly to any single SMS provider.

The architecture uses a clean dependency inversion:

```text
Better Auth
    ↓
SmsService
    ↓
SmsProvider (TypeScript interface)
    ↓
VendelSmsProvider (current adapter)
    ↓
Hosted Vendel (https://app.vendel.cc)
```

TripExpense exposes an internal operation:

```ts
export interface SendOtpParams {
  recipient: string; // E.164 format (e.g. +919876543210)
  code: string;      // 6-digit OTP code
}

export interface SmsProvider {
  readonly name: string;
  sendOtp(params: SendOtpParams): Promise<void>;
}
```

Future providers (e.g., MSG91 or another telecom aggregator) can implement `SmsProvider` without changing any authentication or onboarding code.

---

## Decision 4: Hosted Vendel is the active SMS gateway

Vendel is utilized via the official hosted service:

```text
https://app.vendel.cc
```

The TripExpense backend sends SMS dispatch requests over HTTPS to:

```text
POST /api/sms/send
```

Authenticated via the server-side integration API key:

```http
X-API-Key: <VENDEL_API_KEY>
```

Request payload:

```json
{
  "recipients": ["+919876543210"],
  "body": "Your TripExpense verification code is 123456. This code expires in 5 minutes."
}
```

The integration key remains strictly server-side. The Expo client never receives it.

---

# 3. Gateway & Physical Device Model

## Gateway Responsibility

Vendel provides the cloud gateway and device-management layer:
- Accepts authenticated SMS requests via API
- Queues messages and dispatches them to active registered devices
- Tracks delivery status (`pending`, `assigned`, `sending`, `sent`, `delivered`, `failed`)

Vendel does **not** manage:
- TripExpense users or passwords
- OTP generation or verification
- Onboarding state
- Application authorization

## Physical Device Model

The actual cellular SMS is transmitted by a physical Android phone:
1. The Android phone is registered with the Vendel hosted service using the Vendel Android app and a device key (`dk_...`).
2. The phone contains a working SIM card with an active cellular SMS plan.
3. When TripExpense calls `POST https://app.vendel.cc/api/sms/send`, Vendel relays the dispatch command to the registered Android phone.
4. The Android phone sends the cellular SMS through its SIM card.

---

# 4. Optional Future Deployment: Docker / Self-Hosting

Vendel can also be self-hosted using Docker (`ghcr.io/jimscope/vendel:latest`).

If self-hosted in the future:
- The container serves port `8090`.
- The URL is configured via `VENDEL_URL` (e.g., `http://localhost:8090` or a private domain).
- **Docker is NOT required for the current architecture**, as the hosted service (`https://app.vendel.cc`) is fully functional and eliminates local container management overhead.

---

# 5. DLT / Indian SMS Compliance

DLT (Distributed Ledger Technology) is a regulatory requirement for commercial SMS headers/templates in India.

- **Development / Initial Testing:** Uses hosted Vendel + registered personal Android device and SIM for controlled technical testing.
- **Production Scale:** When scaling commercial traffic, an enterprise DLT-registered aggregator (or compliant carrier route) can be introduced by creating a new `SmsProvider` adapter without modifying Better Auth or onboarding code.

---

# 6. Final Architecture Diagram

```text
                         ┌──────────────────────┐
                         │      TripExpense      │
                         │                      │
                         │ Expo Client          │
                         │ (No Vendel Secrets)  │
                         └──────────┬───────────┘
                                    │
                             HTTPS (API/Session)
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │  TripExpense Backend │
                         │                      │
                         │ Better Auth          │
                         │ SmsService           │
                         │ VendelSmsProvider    │
                         └──────────┬───────────┘
                                    │
                             HTTPS (X-API-Key)
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │  Hosted Vendel Cloud │
                         │ (https://app.vendel.cc)│
                         │                      │
                         │ Device Dispatcher    │
                         │ Message Queue        │
                         └──────────┬───────────┘
                                    │
                             Push / Sync
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │ Registered Android   │
                         │ Phone with Active SIM│
                         └──────────┬───────────┘
                                    │
                             Cellular Network
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │     User's Phone     │
                         │    (Receives SMS)    │
                         └──────────────────────┘
```

---

# 7. SMS API Contract & Error Handling

Vendel Send Endpoint:

```text
POST https://app.vendel.cc/api/sms/send
```

Headers:

```http
Content-Type: application/json
X-API-Key: <VENDEL_API_KEY>
```

Payload:

```json
{
  "recipients": ["+919876543210"],
  "body": "Your TripExpense verification code is 123456. This code expires in 5 minutes."
}
```

Expected Response (200 OK):

```json
{
  "batch_id": "",
  "message_ids": ["a1b2c3d4e5f6g7h"],
  "recipients_count": 1,
  "status": "accepted"
}
```

### Error Responses & Strict Failure Handling

Vendel returns JSON errors on failures:
- `400 Bad Request`: `{ "error": "invalid_phone_number", "message": "Phone number must be in E.164 format" }`
- `401 Unauthorized`: `{ "error": "unauthorized", "message": "Authentication required" }`
- `402 Payment Required`: `{ "error": "quota_exceeded", "message": "Monthly message quota exceeded" }`
- `503 Service Unavailable`: `{ "error": "no_devices", "message": "No devices available to send messages" }`

**Strict Handling Policy:**
- `VendelSmsProvider` throws `SmsDeliveryError` on non-2xx responses or network failure.
- Operational events are logged via `reportServerError({ event: 'sms.delivery-failed', provider: 'vendel' })`.
- **No silent fallback**: The system never logs fallback OTPs or reports success when Vendel fails. The UI receives a clear, retryable error message.

---

# 8. API Key Security

Vendel uses two distinct key types:

1. **Integration API Key (`vk_...`)**:
   - Generated from Vendel Dashboard $\rightarrow$ Settings $\rightarrow$ API Keys.
   - Used **only** by the TripExpense backend via `X-API-Key`.
   - Never exposed to the Expo client or client-side bundles.
   - Monitored by `audit-client-bundle.mjs`.

2. **Device Key (`dk_...`)**:
   - Generated when registering the Android device.
   - Used **only** by the Vendel app on the Android phone.
   - TripExpense backend does **not** use the device key.

---

# 9. Phone Number Contract (E.164)

The provider interface and adapter strictly enforce E.164 format:

```text
+[country_code][number] (e.g. +919876543210)
```

The SMS adapter is country-neutral and does not hardcode `+91`. The `+91` prefix is purely a default UI convenience for users in the mobile screen.

---

# 10. Environment Configuration

```dotenv
# Server-only SMS delivery for mandatory phone verification.
SMS_PROVIDER=vendel
VENDEL_URL=https://app.vendel.cc
VENDEL_API_KEY=vk_your_server_only_key
```

For local development without physical SMS dispatch:

```dotenv
SMS_PROVIDER=console
```

In `console` mode, OTP codes are logged explicitly to the server console.

---

# 11. Security Checklist

- [x] `VENDEL_API_KEY` exists exclusively in server-side runtime environment.
- [x] `VENDEL_API_KEY` is never prefixed with `EXPO_PUBLIC_`.
- [x] `audit-client-bundle.mjs` checks `VENDEL_API_KEY` against client bundles.
- [x] Client code only communicates with TripExpense backend routes.
- [x] OTP verification remains exclusively server-side via Better Auth.
