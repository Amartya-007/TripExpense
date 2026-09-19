import { and, eq, isNull } from 'drizzle-orm';

import { addParticipantSchema, type AddParticipantResponse } from '@/features/trips/participant-contract';
import { errorResponse, jsonResponse, readJson } from '@/server/api/api-response';
import { requireSession } from '@/server/auth/require-session';
import { getDatabase } from '@/server/db';
import { tripParticipant } from '@/server/db/app-schema';
import { generateId } from '@/server/db/id';
import { reportServerError } from '@/server/observability/server-error-reporter';

export async function POST(request: Request, { tripId }: Record<string, string>) {
  try {
    return await addParticipant(request, tripId);
  } catch {
    reportServerError({ event: 'trips.participant-add-failed' });
    return errorResponse(500, 'PARTICIPANT_ADD_FAILED', 'We could not add that person. Please try again.');
  }
}

export async function DELETE(request: Request, { tripId, participantId }: Record<string, string>) {
  try {
    return await removeParticipant(request, tripId, participantId);
  } catch {
    reportServerError({ event: 'trips.participant-remove-failed' });
    return errorResponse(500, 'PARTICIPANT_REMOVE_FAILED', 'We could not remove that person. Please try again.');
  }
}

/** Every write in this file requires the caller to already be an active participant of the trip. */
async function requireActiveMembership(tripId: string, userId: string) {
  const db = getDatabase();
  return db.query.tripParticipant.findFirst({
    where: and(
      eq(tripParticipant.tripId, tripId),
      eq(tripParticipant.userId, userId),
      isNull(tripParticipant.deletedAt),
    ),
  });
}

async function addParticipant(request: Request, tripId: string) {
  const { session, response } = await requireSession(request);
  if (!session) return response;

  const membership = await requireActiveMembership(tripId, session.user.id);
  if (!membership) {
    return errorResponse(404, 'TRIP_NOT_FOUND', 'This trip does not exist or you do not have access to it.');
  }

  const body = await readJson(request);
  const result = addParticipantSchema.safeParse(body);

  if (!result.success) {
    return errorResponse(400, 'INVALID_PARTICIPANT', result.error.issues[0]?.message ?? 'Check that name.');
  }

  const db = getDatabase();
  const [inserted] = await db
    .insert(tripParticipant)
    .values({
      id: result.data.id ?? generateId(),
      tripId,
      userId: null,
      displayName: result.data.displayName,
      avatarUrl: null,
    })
    .returning();

  const responseBody: AddParticipantResponse = {
    participant: {
      id: inserted.id,
      userId: inserted.userId,
      displayName: inserted.displayName,
      avatarUrl: inserted.avatarUrl,
    },
  };
  return jsonResponse(responseBody, 201);
}

async function removeParticipant(request: Request, tripId: string, participantId: string) {
  const { session, response } = await requireSession(request);
  if (!session) return response;

  const db = getDatabase();

  const target = await db.query.tripParticipant.findFirst({
    where: and(
      eq(tripParticipant.id, participantId),
      eq(tripParticipant.tripId, tripId),
      isNull(tripParticipant.deletedAt),
    ),
    with: { trip: true },
  });

  if (!target) {
    return errorResponse(404, 'PARTICIPANT_NOT_FOUND', 'That person is not part of this trip.');
  }

  const isTripCreator = target.trip.createdBy === session.user.id;
  const isRemovingSelf = target.userId === session.user.id;

  if (!isTripCreator && !isRemovingSelf) {
    return errorResponse(403, 'FORBIDDEN', 'Only the trip creator can remove someone else.');
  }

  await db.update(tripParticipant).set({ deletedAt: new Date() }).where(eq(tripParticipant.id, participantId));

  return new Response(null, { status: 204, headers: { 'Cache-Control': 'private, no-store' } });
}
