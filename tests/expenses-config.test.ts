import { describe, expect, it } from 'vitest';

import { DASHBOARD_MOCK_DATA } from '@/features/home/dashboard-config';
import {
  computeNetBalances,
  EXPENSE_GROUP_ORDER,
  MOCK_EXPENSES,
  simplifyDebts,
  TRIP_PEOPLE,
  type Expense,
  type PersonId,
} from '@/features/expenses/expenses-config';

describe('computeNetBalances', () => {
  it('splits a simple two-person expense evenly', () => {
    const expenses: Expense[] = [
      { id: 'x1', title: 'Test', amount: 100, category: 'other', paidBy: 'you', splitBetween: ['you', 'priya'], group: 'Today' },
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

    const byGroup = (group: (typeof EXPENSE_GROUP_ORDER)[number]) =>
      MOCK_EXPENSES.filter((expense) => expense.group === group).reduce((sum, expense) => sum + expense.amount, 0);

    expect(byGroup('Today')).toBe(DASHBOARD_MOCK_DATA.today.spent);
    expect(byGroup('Yesterday')).toBe(DASHBOARD_MOCK_DATA.today.yesterday);
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
