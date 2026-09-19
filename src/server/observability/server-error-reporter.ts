export type ServerErrorReport =
  | { event: 'demo.protected-request-failed' }
  | { event: 'email.delivery-failed'; purpose: AuthEmailPurpose; providerStatus?: number }
  | { event: 'sms.delivery-failed'; provider: string; providerStatus?: number }
  | { event: 'health.database-check-failed' }
  | { event: 'onboarding.profile-update-failed' }
  | { event: 'trips.list-failed' }
  | { event: 'trips.create-failed' }
  | { event: 'trips.detail-failed' }
  | { event: 'trips.update-failed' }
  | { event: 'trips.delete-failed' }
  | { event: 'trips.participant-add-failed' }
  | { event: 'trips.participant-remove-failed' }
  | { event: 'expenses.list-failed' }
  | { event: 'expenses.create-failed' }
  | { event: 'expenses.update-failed' }
  | { event: 'expenses.delete-failed' }
  | { event: 'settlements.list-failed' }
  | { event: 'settlements.create-failed' };

type AuthEmailPurpose = 'sign-in' | 'email-verification' | 'forget-password' | 'change-email';

/**
 * Replace this function body with a server-side monitoring SDK when needed.
 * Reports are deliberately compile-time allowlisted and never accept an Error,
 * request, email address, OTP, cookie, token, headers, or arbitrary metadata.
 */
export function reportServerError(report: ServerErrorReport) {
  try {
    console.error('[server-error]', JSON.stringify(report));
  } catch {
    // Monitoring must never change the application response.
  }
}
