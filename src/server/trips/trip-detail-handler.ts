import { and, eq, isNull } from 'drizzle-orm';

import { updateTripSchema, type CreateTripResponse } from '@/features/trips/trip-contract';
import { errorResponse, jsonResponse, readJson } from '@/server/api/api-response';
import { requireSession } from '@/server/auth/require-session';
import { getDatabase } from '@/server/db';
import { trip, tripParticipant } from '@/server/db/app-schema';
import { reportServerError } from '@/server/observability/server-error-reporter';
import { toTripResponse } from '@/server/trips/trip-mapper';

export async function GET(request: Request, { tripId }: Record<string, string>) {
  try {
    return await getTripDetail(request, tripId);
  } catch {
    reportServerError({ event: 'trips.detail-failed' });
    return errorResponse(500, 'TRIP_DETAIL_FAILED', 'We could not load this trip. Please try again.');
  }
}

export async function PATCH(request: Request, { tripId }: Record<string, string>) {
  try {
    return await updateTrip(request, tripId);
  } catch {
    reportServerError({ event: 'trips.update-failed' });
    return errorResponse(500, 'TRIP_UPDATE_FAILED', 'We could not update this trip. Please try again.');
  }
}

export async function DELETE(request: Request, { tripId }: Record<string, string>) {
  try {
    return await deleteTrip(request, tripId);
  } catch {
    reportServerError({ event: 'trips.delete-failed' });
    return errorResponse(500, 'TRIP_DELETE_FAILED', 'We could not delete this trip. Please try again.');
  }
}

/** Loads a trip only if the caller is an active (non-removed) participant. Returns null if not found or not a member - the same response either way, so a stranger can't tell a private trip ID exists. */
async function loadTripForMember(tripId: string, userId: string) {
  const db = getDatabase();

  const membership = await db.query.tripParticipant.findFirst({
    where: and(
      eq(tripParticipant.tripId, tripId),
      eq(tripParticipant.userId, userId),
      isNull(tripParticipant.deletedAt),
    ),
  });

  if (!membership) return null;

  const tripRow = await db.query.trip.findFirst({
    where: and(eq(trip.id, tripId), isNull(trip.deletedAt)),
    with: { participants: { where: isNull(tripParticipant.deletedAt) } },
  });

  return tripRow ?? null;
}

async function getTripDetail(request: Request, tripId: string) {
  const { session, response } = await requireSession(request);
  if (!session) return response;

  const tripRow = await loadTripForMember(tripId, session.user.id);
  if (!tripRow) {
    return errorResponse(404, 'TRIP_NOT_FOUND', 'This trip does not exist or you do not have access to it.');
  }

  const responseBody: CreateTripResponse = { trip: toTripResponse(tripRow) };
  return jsonResponse(responseBody);
}

async function updateTrip(request: Request, tripId: string) {
  const { session, response } = await requireSession(request);
  if (!session) return response;

  const existing = await loadTripForMember(tripId, session.user.id);
  if (!existing) {
    return errorResponse(404, 'TRIP_NOT_FOUND', 'This trip does not exist or you do not have access to it.');
  }

  const body = await readJson(request);
  const result = updateTripSchema.safeParse(body);

  if (!result.success) {
    return errorResponse(400, 'INVALID_TRIP', result.error.issues[0]?.message ?? 'Check your trip details.');
  }

  const input = result.data;
  const db = getDatabase();

  const [updated] = await db
    .update(trip)
    .set({
      ...(input.name !== undefined && { name: input.name }),
      ...(input.destination !== undefined && { destination: input.destination }),
      ...(input.currency !== undefined && { currency: input.currency }),
      ...(input.budget !== undefined && { budget: input.budget }),
      ...(input.startDate !== undefined && { startDate: new Date(input.startDate) }),
      ...(input.endDate !== undefined && { endDate: new Date(input.endDate) }),
      ...(input.coverImageUrl !== undefined && { coverImageUrl: input.coverImageUrl }),
    })
    .where(eq(trip.id, tripId))
    .returning();

  const responseBody: CreateTripResponse = {
    trip: toTripResponse({ ...updated, participants: existing.participants }),
  };
  return jsonResponse(responseBody);
}

async function deleteTrip(request: Request, tripId: string) {
  const { session, response } = await requireSession(request);
  if (!session) return response;

  const db = getDatabase();

  const tripRow = await db.query.trip.findFirst({
    where: and(eq(trip.id, tripId), isNull(trip.deletedAt)),
  });

  if (!tripRow) {
    return errorResponse(404, 'TRIP_NOT_FOUND', 'This trip does not exist or you do not have access to it.');
  }

  if (tripRow.createdBy !== session.user.id) {
    return errorResponse(403, 'FORBIDDEN', 'Only the trip creator can delete this trip.');
  }

  await db.update(trip).set({ deletedAt: new Date() }).where(eq(trip.id, tripId));

  return new Response(null, { status: 204, headers: { 'Cache-Control': 'private, no-store' } });
}
