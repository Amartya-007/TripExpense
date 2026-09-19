import { and, eq, isNull } from 'drizzle-orm';

import { createTripSchema, type CreateTripResponse, type ListTripsResponse } from '@/features/trips/trip-contract';
import { errorResponse, jsonResponse, readJson } from '@/server/api/api-response';
import { requireSession } from '@/server/auth/require-session';
import { getDatabase } from '@/server/db';
import { trip, tripParticipant } from '@/server/db/app-schema';
import { generateId } from '@/server/db/id';
import { reportServerError } from '@/server/observability/server-error-reporter';
import { toTripResponse } from '@/server/trips/trip-mapper';

export async function GET(request: Request) {
  try {
    return await listTrips(request);
  } catch {
    reportServerError({ event: 'trips.list-failed' });
    return errorResponse(500, 'TRIPS_LIST_FAILED', 'We could not load your trips. Please try again.');
  }
}

export async function POST(request: Request) {
  try {
    return await createTrip(request);
  } catch {
    reportServerError({ event: 'trips.create-failed' });
    return errorResponse(500, 'TRIP_CREATE_FAILED', 'We could not create your trip. Please try again.');
  }
}

async function listTrips(request: Request) {
  const { session, response } = await requireSession(request);
  if (!session) return response;

  const db = getDatabase();

  const participations = await db.query.tripParticipant.findMany({
    where: and(eq(tripParticipant.userId, session.user.id), isNull(tripParticipant.deletedAt)),
    with: {
      trip: {
        with: {
          participants: { where: isNull(tripParticipant.deletedAt) },
        },
      },
    },
  });

  const trips = participations
    .map((participation) => participation.trip)
    .filter((tripRow) => tripRow.deletedAt === null)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .map(toTripResponse);

  const responseBody: ListTripsResponse = { trips };
  return jsonResponse(responseBody);
}

async function createTrip(request: Request) {
  const { session, response } = await requireSession(request);
  if (!session) return response;

  const body = await readJson(request);
  const result = createTripSchema.safeParse(body);

  if (!result.success) {
    return errorResponse(400, 'INVALID_TRIP', result.error.issues[0]?.message ?? 'Check your trip details.');
  }

  const input = result.data;
  const db = getDatabase();
  const tripId = input.id ?? generateId();

  const createdTrip = await db.transaction(async (tx) => {
    const [insertedTrip] = await tx
      .insert(trip)
      .values({
        id: tripId,
        name: input.name,
        destination: input.destination,
        currency: input.currency ?? 'INR',
        budget: input.budget,
        startDate: input.startDate ? new Date(input.startDate) : undefined,
        endDate: input.endDate ? new Date(input.endDate) : undefined,
        coverImageUrl: input.coverImageUrl,
        createdBy: session.user.id,
      })
      .returning();

    const participantRows = [
      {
        id: generateId(),
        tripId,
        userId: session.user.id,
        displayName: session.user.name,
        avatarUrl: session.user.image ?? null,
      },
      ...(input.participantNames ?? []).map((displayName) => ({
        id: generateId(),
        tripId,
        userId: null,
        displayName,
        avatarUrl: null,
      })),
    ];

    const insertedParticipants = await tx.insert(tripParticipant).values(participantRows).returning();

    return { ...insertedTrip, participants: insertedParticipants };
  });

  const responseBody: CreateTripResponse = { trip: toTripResponse(createdTrip) };
  return jsonResponse(responseBody, 201);
}
