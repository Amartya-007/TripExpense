import { errorResponse } from '@/server/api/api-response';
import { getAuth } from '@/server/auth/auth-server';

/**
 * Resolves the caller's session, or an already-built 401 response if
 * there isn't one. Callers do:
 *
 *   const { session, response } = await requireSession(request);
 *   if (!session) return response;
 *
 * Extracted so every trips/expenses handler doesn't repeat its own copy
 * of this exact null-check, matching the intent already established by
 * onboarding-handler.ts and demo-handler.ts (both call
 * `getAuth().api.getSession(...)` the same way) - now with one shared
 * place for the not-signed-in error message and status code.
 */
export async function requireSession(request: Request) {
  const session = await getAuth().api.getSession({ headers: request.headers });

  if (!session) {
    return {
      session: null,
      response: errorResponse(401, 'UNAUTHORIZED', 'Sign in to continue.'),
    } as const;
  }

  return { session, response: null } as const;
}
