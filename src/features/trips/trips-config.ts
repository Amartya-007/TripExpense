import type { IconName } from '@/components/ui/icon';

export type TripSummary = {
  id: string;
  name: string;
  /** Short place name shown next to dates, e.g. "Goa". */
  place: string;
  /** ISO dates, e.g. '2026-09-10'. */
  startDate: string;
  endDate: string;
  budget: number;
  memberCount: number;
  coverFrom: string;
  coverTo: string;
  icon: IconName;
  /**
   * True for the one trip actually wired to TripDataProvider's mock
   * expenses - its spend/expense count is computed live, matching what
   * you see after tapping in. The others are static previews: tapping
   * them shows a "coming soon" toast until real multi-trip data lands.
   */
  isLive: boolean;
  /** Static spend for preview (non-live) trips only. */
  previewSpent?: number;
};

// isLive: true must stay on exactly one trip, and its name should match
// DASHBOARD_MOCK_DATA.trip.name so the card and the dashboard agree.
export const TRIPS: TripSummary[] = [
  {
    id: 'goa',
    name: 'Goa Trip',
    place: 'Goa',
    startDate: '2026-09-10',
    endDate: '2026-09-14',
    budget: 75000,
    memberCount: 8,
    coverFrom: '#F97316',
    coverTo: '#FBBF24',
    icon: 'beach',
    isLive: true,
  },
  {
    id: 'manali',
    name: 'Manali Trip',
    place: 'Manali',
    startDate: '2026-04-12',
    endDate: '2026-04-16',
    budget: 30000,
    memberCount: 4,
    coverFrom: '#2563EB',
    coverTo: '#60A5FA',
    icon: 'mountain',
    isLive: false,
    previewSpent: 18450,
  },
  {
    id: 'rishikesh',
    name: 'Rishikesh Trip',
    place: 'Rishikesh',
    startDate: '2026-06-20',
    endDate: '2026-06-24',
    budget: 20000,
    memberCount: 4,
    coverFrom: '#0D9488',
    coverTo: '#2DD4BF',
    icon: 'waves',
    isLive: false,
    previewSpent: 8760,
  },
];
