import { z } from 'zod';

export const addParticipantSchema = z.object({
  /** Optional client-generated UUID, for a participant added offline and synced later. */
  id: z.uuid('Must be a valid UUID').optional(),
  displayName: z.string().trim().min(1, 'Name is required').max(60, 'Name is too long'),
});

export type AddParticipantInput = z.infer<typeof addParticipantSchema>;

export type AddParticipantResponse = {
  participant: {
    id: string;
    userId: string | null;
    displayName: string;
    avatarUrl: string | null;
  };
};
