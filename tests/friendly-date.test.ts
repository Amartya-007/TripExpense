import { describe, expect, it } from 'vitest';

import { formatFriendlyDate, isSameDay, parseISODate, toISODate } from '@/lib/date/friendly-date';

function isoOffsetFromToday(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return toISODate(date);
}

describe('parseISODate / toISODate', () => {
  it('round-trips a date without a timezone shift', () => {
    expect(toISODate(parseISODate('2026-09-13'))).toBe('2026-09-13');
    expect(toISODate(parseISODate('2026-01-01'))).toBe('2026-01-01');
    expect(toISODate(parseISODate('2026-12-31'))).toBe('2026-12-31');
  });

  it('pads single-digit months and days', () => {
    expect(toISODate(new Date(2026, 0, 5))).toBe('2026-01-05');
  });
});

describe('isSameDay', () => {
  it('is true for the same calendar date regardless of time', () => {
    expect(isSameDay(new Date(2026, 8, 13, 1, 0), new Date(2026, 8, 13, 23, 59))).toBe(true);
  });

  it('is false across a day boundary even by one minute', () => {
    expect(isSameDay(new Date(2026, 8, 13, 23, 59), new Date(2026, 8, 14, 0, 0))).toBe(false);
  });
});

describe('formatFriendlyDate', () => {
  it('labels today, tomorrow, and yesterday relative to right now', () => {
    expect(formatFriendlyDate(isoOffsetFromToday(0))).toBe('Today');
    expect(formatFriendlyDate(isoOffsetFromToday(1))).toBe('Tomorrow');
    expect(formatFriendlyDate(isoOffsetFromToday(-1))).toBe('Yesterday');
  });

  it('falls back to a formatted date further out, with no year shown for the current year', () => {
    const thisYear = new Date().getFullYear();
    expect(formatFriendlyDate(`${thisYear}-01-01`)).toMatch(/^1 Jan$/);
  });

  it('includes the year when the date is not in the current year', () => {
    expect(formatFriendlyDate('2020-06-15')).toBe('15 Jun 2020');
  });
});
