import { describe, expect, it } from 'vitest';

import { calculateTripStats } from '@/features/home/trip-stats';

describe('calculateTripStats', () => {
  it('computes remaining balance and percentage', () => {
    const stats = calculateTripStats({
      budget: 10000,
      startDate: '2026-09-10',
      endDate: '2026-09-14',
      expenses: [{ amount: 4000, dateTime: '2026-09-12T10:00:00' }],
      now: new Date(2026, 8, 12),
    });

    expect(stats.totalSpent).toBe(4000);
    expect(stats.remainingBalance).toBe(6000);
    expect(stats.remainingPercentage).toBe(60);
  });

  it('marks the trip as not started when today is before the start date', () => {
    const stats = calculateTripStats({
      budget: 10000,
      startDate: '2026-09-10',
      endDate: '2026-09-14',
      expenses: [],
      now: new Date(2026, 8, 5),
    });

    expect(stats.hasStarted).toBe(false);
    expect(stats.daysPassed).toBe(0);
    expect(stats.daysRemaining).toBe(5); // full trip length, nothing passed yet
  });

  it('marks the trip as ended once today is after the end date', () => {
    const stats = calculateTripStats({
      budget: 10000,
      startDate: '2026-09-10',
      endDate: '2026-09-14',
      expenses: [{ amount: 9000, dateTime: '2026-09-12T10:00:00' }],
      now: new Date(2026, 8, 20),
    });

    expect(stats.hasEnded).toBe(true);
    expect(stats.daysRemaining).toBe(0);
    // Not started/ended path: remainingPerDay falls back to the plain remaining balance.
    expect(stats.remainingPerDay).toBe(stats.remainingBalance);
  });

  it('flags overspending once the balance goes negative', () => {
    const stats = calculateTripStats({
      budget: 5000,
      startDate: '2026-09-10',
      endDate: '2026-09-14',
      expenses: [{ amount: 6000, dateTime: '2026-09-11T10:00:00' }],
      now: new Date(2026, 8, 12),
    });

    expect(stats.remainingBalance).toBe(-1000);
    expect(stats.isOverspending).toBe(true);
  });

  it('flags overspending when the daily burn rate exceeds the safe daily amount, even with balance left', () => {
    // Day 3 of 5, spent 4000 of 5000 already - burn rate way outpaces what's left per day.
    const stats = calculateTripStats({
      budget: 5000,
      startDate: '2026-09-10',
      endDate: '2026-09-14',
      expenses: [{ amount: 4000, dateTime: '2026-09-11T10:00:00' }],
      now: new Date(2026, 8, 12),
    });

    expect(stats.dailyBurnRate).toBeGreaterThan(stats.remainingPerDay);
    expect(stats.isOverspending).toBe(true);
  });

  it('does not flag overspending for a healthy, on-track trip', () => {
    const stats = calculateTripStats({
      budget: 10000,
      startDate: '2026-09-10',
      endDate: '2026-09-14',
      expenses: [{ amount: 1000, dateTime: '2026-09-11T10:00:00' }],
      now: new Date(2026, 8, 12),
    });

    expect(stats.isOverspending).toBe(false);
    expect(stats.projectedDeficit).toBe(0);
  });

  it('tiers status color by remaining percentage', () => {
    const healthy = calculateTripStats({ budget: 10000, startDate: '2026-09-10', endDate: '2026-09-14', expenses: [{ amount: 1000, dateTime: '2026-09-11T10:00:00' }], now: new Date(2026, 8, 12) });
    const warning = calculateTripStats({ budget: 10000, startDate: '2026-09-10', endDate: '2026-09-14', expenses: [{ amount: 6000, dateTime: '2026-09-11T10:00:00' }], now: new Date(2026, 8, 12) });
    const danger = calculateTripStats({ budget: 10000, startDate: '2026-09-10', endDate: '2026-09-14', expenses: [{ amount: 8500, dateTime: '2026-09-11T10:00:00' }], now: new Date(2026, 8, 12) });

    expect(healthy.statusTone).toBe('success');
    expect(warning.statusTone).toBe('warning');
    expect(danger.statusTone).toBe('danger');
  });

  it('only counts todaySpent/yesterdaySpent for the injected "now"', () => {
    const stats = calculateTripStats({
      budget: 10000,
      startDate: '2026-09-10',
      endDate: '2026-09-14',
      expenses: [
        { amount: 500, dateTime: '2026-09-12T09:00:00' },
        { amount: 700, dateTime: '2026-09-11T09:00:00' },
        { amount: 900, dateTime: '2026-09-10T09:00:00' },
      ],
      now: new Date(2026, 8, 12),
    });

    expect(stats.todaySpent).toBe(500);
    expect(stats.yesterdaySpent).toBe(700);
  });
});
