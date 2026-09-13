import { describe, expect, it } from 'vitest';

import { DASHBOARD_MOCK_DATA } from '@/features/home/dashboard-config';
import {
  computeNetBalances,
  getExpense,
  groupExpensesByDate,
  MOCK_EXPENSES,
  simplifyDebts,
  TRIP_PEOPLE,
  type Expense,
  type PersonId,
} from '@/features/expenses/expenses-config';

describe('computeNetBalances', () => {
  it('splits a simple two-person expense evenly', () => {
    const expenses: Expense[] = [
      { id: 'x1', title: 'Test', amount: 100, category: 'other', paidBy: 'you', splitBetween: ['you', 'priya'], dateTime: '2026-09-13T09:00:00' },
    ];

    const balances = computeNetBalances(expenses);

    expect(balances.you).toBe(50);
    expect(balances.priya).toBe(-50);
    expect(balances.rohan).toBe(0);
    expect(balances.sneha).toBe(0);
  });

  it('nets out to zero across the whole mock dataset (money is conserved)', () => {
    const balances = computeNetBalances(MOCK_EXPENSES);
    const total = Object.values(balances).reduce((sum, amount) => sum + amount, 0);

    expect(total).toBeCloseTo(0, 6);
  });

  it('matches the dashboard mock totals', () => {
    const totalSpent = MOCK_EXPENSES.reduce((sum, expense) => sum + expense.amount, 0);
    expect(totalSpent).toBe(DASHBOARD_MOCK_DATA.trip.spent);
    expect(MOCK_EXPENSES).toHaveLength(DASHBOARD_MOCK_DATA.trip.expenses);

    // Filtered by the fixed calendar dates the mock data was written against
    // (not by the 'Today'/'Yesterday' label, which is relative to whenever
    // the test happens to run and would silently drift out of sync).
    const byDate = (dateKey: string) =>
      MOCK_EXPENSES.filter((expense) => expense.dateTime.startsWith(dateKey)).reduce((sum, expense) => sum + expense.amount, 0);

    expect(byDate('2026-09-13')).toBe(DASHBOARD_MOCK_DATA.today.spent);
    expect(byDate('2026-09-12')).toBe(DASHBOARD_MOCK_DATA.today.yesterday);
  });
});

describe('groupExpensesByDate', () => {
  it('groups by calendar date, most recent date first', () => {
    const groups = groupExpensesByDate(MOCK_EXPENSES);
    const dateKeys = groups.map((group) => group.dateKey);

    expect(dateKeys).toEqual(['2026-09-13', '2026-09-12', '2026-09-11', '2026-09-10']);
  });

  it('orders expenses within a day most recent first', () => {
    const groups = groupExpensesByDate(MOCK_EXPENSES);
    const day1 = groups.find((group) => group.dateKey === '2026-09-10');

    expect(day1).toBeDefined();
    const times = day1!.expenses.map((expense) => expense.dateTime);
    const sorted = [...times].sort().reverse();
    expect(times).toEqual(sorted);
  });

  it('every expense appears in exactly one group', () => {
    const groups = groupExpensesByDate(MOCK_EXPENSES);
    const totalGrouped = groups.reduce((sum, group) => sum + group.expenses.length, 0);
    expect(totalGrouped).toBe(MOCK_EXPENSES.length);
  });
});

describe('getExpense', () => {
  it('finds an expense by id', () => {
    expect(getExpense(MOCK_EXPENSES, 'e1')?.title).toBe('Flight/cab from airport');
  });

  it('returns undefined for an unknown id', () => {
    expect(getExpense(MOCK_EXPENSES, 'does-not-exist')).toBeUndefined();
  });
});

describe('simplifyDebts', () => {
  it('settles a simple one-creditor, two-debtor case correctly', () => {
    const balances: Record<PersonId, number> = { you: 100, priya: -60, rohan: -40, sneha: 0 };

    const settlements = simplifyDebts(balances);

    expect(settlements).toEqual([
      { from: 'priya', to: 'you', amount: 60 },
      { from: 'rohan', to: 'you', amount: 40 },
    ]);
  });

  it('returns nothing when everyone is already settled up', () => {
    const balances: Record<PersonId, number> = { you: 0, priya: 0, rohan: 0, sneha: 0 };
    expect(simplifyDebts(balances)).toEqual([]);
  });

  it('produces a settlement plan that actually zeroes out every balance', () => {
    const balances = computeNetBalances(MOCK_EXPENSES);
    const settlements = simplifyDebts(balances);

    const remaining = { ...balances };
    for (const { from, to, amount } of settlements) {
      remaining[from] += amount;
      remaining[to] -= amount;
    }

    for (const person of TRIP_PEOPLE) {
      expect(Math.abs(remaining[person.id])).toBeLessThan(1);
    }
  });

  it('never suggests someone pay themselves', () => {
    const settlements = simplifyDebts(computeNetBalances(MOCK_EXPENSES));
    for (const settlement of settlements) {
      expect(settlement.from).not.toBe(settlement.to);
    }
  });
});
