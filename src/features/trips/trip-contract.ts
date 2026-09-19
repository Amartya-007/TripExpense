import { z } from 'zod';

import { MAX_CURRENCY_AMOUNT } from '@/constants/app-settings';

const uuidSchema = z.uuid('Must be a valid UUID');

const isoDateSchema = z
  .string()
  .refine((value) => !Number.isNaN(Date.parse(value)), 'Must be a valid date');

/**
 * A whole-currency-unit budget, matching how the rest of the app treats
 * money (see src/lib/validation/currency-validation.ts) - no paise/cents,
 * positive, capped at MAX_CURRENCY_AMOUNT.
 */
const budgetSchema = z
  .number()
  .int('Budget must be a whole number')
  .positive('Budget must be greater than zero')
  .max(MAX_CURRENCY_AMOUNT, `Budget cannot exceed ${MAX_CURRENCY_AMOUNT}`);

export const createTripSchema = z.object({
  /** Optional client-generated UUID, for a trip created offline and synced later. Server generates one when omitted. */
  id: uuidSchema.optional(),
  name: z.string().trim().min(1, 'Trip name is required').max(120, 'Trip name is too long'),
  destination: z.string().trim().max(120, 'Destination is too long').optional(),
  currency: z.string().trim().length(3, 'Currency must be a 3-letter code, e.g. INR').optional(),
  budget: budgetSchema.optional(),
  startDate: isoDateSchema.optional(),
  endDate: isoDateSchema.optional(),
  coverImageUrl: z.url('Cover image URL must be a valid URL').optional(),
  /** Names of friends to add as participants right away (the creator is always added automatically). */
  participantNames: z.array(z.string().trim().min(1).max(60)).max(50).optional(),
});

export const updateTripSchema = createTripSchema
  .omit({ id: true, participantNames: true })
  .partial();

export type CreateTripInput = z.infer<typeof createTripSchema>;
export type UpdateTripInput = z.infer<typeof updateTripSchema>;

export type ParticipantResponse = {
  id: string;
  userId: string | null;
  displayName: string;
  avatarUrl: string | null;
};

export type TripResponse = {
  id: string;
  name: string;
  destination: string | null;
  currency: string;
  budget: number | null;
  startDate: string | null;
  endDate: string | null;
  coverImageUrl: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  participants: ParticipantResponse[];
};

export type ListTripsResponse = {
  trips: TripResponse[];
};

export type CreateTripResponse = {
  trip: TripResponse;
};
