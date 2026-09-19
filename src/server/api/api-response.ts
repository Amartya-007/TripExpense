/**
 * Shared response helpers for API route handlers (src/server/<feature>/*-handler.ts).
 *
 * Every existing handler (onboarding, demo) had its own copy of an
 * `errorResponse` function with an identical `{ error: { code, message } }`
 * shape. That was a small, tolerable duplication at 2 copies; the trips/
 * expenses backend adds well over half a dozen more handler files, where
 * copy-pasting it into each one would recreate the same
 * drift-prone-duplication problem already fixed once this session for
 * `formatCurrency`. Centralizing it here instead.
 */

export function errorResponse(status: number, code: string, message: string) {
  return Response.json(
    { error: { code, message } },
    { status, headers: { 'Cache-Control': 'private, no-store' } },
  );
}

export function jsonResponse<T>(data: T, status = 200) {
  return Response.json(data, {
    status,
    headers: { 'Cache-Control': 'private, no-store' },
  });
}

/** Safely parses a request body as JSON, returning null instead of throwing on invalid/empty bodies. */
export async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}
