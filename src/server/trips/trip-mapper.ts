import type { ParticipantResponse, TripResponse } from '@/features/trips/trip-contract';

type DbParticipant = {
  id: string;
  userId: string | null;
  displayName: string;
  avatarUrl: string | null;
};

type DbTrip = {
  id: string;
  name: string;
  destination: string | null;
  currency: string;
  budget: number | null;
  startDate: Date | null;
  endDate: Date | null;
  coverImageUrl: string | null;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  participants: DbParticipant[];
};

function toParticipantResponse(participant: DbParticipant): ParticipantResponse {
  return {
    id: participant.id,
    userId: participant.userId,
    displayName: participant.displayName,
    avatarUrl: participant.avatarUrl,
  };
}

export function toTripResponse(trip: DbTrip): TripResponse {
  return {
    id: trip.id,
    name: trip.name,
    destination: trip.destination,
    currency: trip.currency,
    budget: trip.budget,
    startDate: trip.startDate?.toISOString() ?? null,
    endDate: trip.endDate?.toISOString() ?? null,
    coverImageUrl: trip.coverImageUrl,
    createdBy: trip.createdBy,
    createdAt: trip.createdAt.toISOString(),
    updatedAt: trip.updatedAt.toISOString(),
    participants: trip.participants.map(toParticipantResponse),
  };
}
