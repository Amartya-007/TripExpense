/**
 * Generates a UUID for a new app record (trip, expense, participant,
 * settlement, ...). Every create endpoint accepts an optional client-
 * supplied `id` and falls back to this when none is given.
 *
 * Accepting a client-supplied ID is what makes offline-first sync work
 * without an ID-remapping step: a device creates a record locally while
 * offline, generates its ID the same way (via this same UUID scheme
 * client-side), and later syncs that exact row to the server. The ID
 * never changes across that boundary.
 *
 * Uses the global Web Crypto API (not `node:crypto`) to match how the rest
 * of the server code (Request/Response in the *-handler.ts files) sticks
 * to Web-standard globals rather than Node-specific APIs.
 */
export function generateId(): string {
  return crypto.randomUUID();
}
