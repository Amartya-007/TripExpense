import type { IconName } from '@/components/ui/icon';
import { formatFriendlyDate } from '@/lib/date/friendly-date';

export type PersonId = 'you' | 'priya' | 'rohan' | 'sneha';

export type Person = {
  id: PersonId;
  name: string;
  /** Key into a solid, always-visible theme token - deliberately not the
   * decorative tint tokens (mint/aqua/peach/lavender), since those are
   * pale background fills in the current theme and would render as
   * near-invisible dots. primary/accent/secondary/info are guaranteed
   * solid in both light and dark mode regardless of theme changes. */
  color: 'primary' | 'accent' | 'secondary' | 'info';
};

export const TRIP_PEOPLE: Person[] = [
  { id: 'you', name: 'You', color: 'primary' },
  { id: 'priya', name: 'Priya', color: 'accent' },
  { id: 'rohan', name: 'Rohan', color: 'secondary' },
  { id: 'sneha', name: 'Sneha', color: 'info' },
];

export type ExpenseCategory = 'food' | 'transport' | 'stay' | 'ticket' | 'other';

export const EXPENSE_CATEGORIES: Record<ExpenseCategory, { label: string; icon: IconName }> = {
  food: { label: 'Food', icon: 'food' },
  transport: { label: 'Transport', icon: 'transport' },
  stay: { label: 'Stay', icon: 'stay' },
  ticket: { label: 'Activity', icon: 'ticket' },
  other: { label: 'Other', icon: 'list' },
};

export type Expense = {
  id: string;
  title: string;
  amount: number;
  category: ExpenseCategory;
  paidBy: PersonId;
  splitBetween: PersonId[];
  /** ISO datetime, e.g. '2026-09-13T08:30:00'. */
  dateTime: string;
  /** Optional free-text note, shown on the expense detail screen. */
  note?: string;
  /** Whether a receipt photo was attached when the expense was logged. */
  hasReceipt?: boolean;
};

// Sums to exactly DASHBOARD_MOCK_DATA.trip.spent (32750) across exactly
// DASHBOARD_MOCK_DATA.trip.expenses (18) items, with Today/Yesterday
// subtotals matching DASHBOARD_MOCK_DATA.today.spent/yesterday, so the
// dashboard and this list agree until real API data replaces both.
// Dates assume the trip started 2026-09-10, with today being 2026-09-13.
export const MOCK_EXPENSES: Expense[] = [
  { id: 'e1', title: 'Flight/cab from airport', amount: 8500, category: 'transport', paidBy: 'you', splitBetween: ['you', 'priya', 'rohan', 'sneha'], dateTime: '2026-09-10T10:30:00' },
  { id: 'e2', title: 'Hotel, night 1', amount: 4000, category: 'stay', paidBy: 'rohan', splitBetween: ['you', 'priya', 'rohan', 'sneha'], dateTime: '2026-09-10T14:00:00', note: 'Sea-facing room with breakfast included, booked for the first two nights.', hasReceipt: true },
  { id: 'e3', title: 'Hotel, night 2', amount: 4000, category: 'stay', paidBy: 'rohan', splitBetween: ['you', 'priya', 'rohan', 'sneha'], dateTime: '2026-09-10T14:05:00' },
  { id: 'e4', title: 'Welcome dinner', amount: 2000, category: 'food', paidBy: 'sneha', splitBetween: ['you', 'priya', 'rohan', 'sneha'], dateTime: '2026-09-10T20:00:00' },
  { id: 'e5', title: 'Drinks at dinner', amount: 1200, category: 'food', paidBy: 'sneha', splitBetween: ['you', 'priya', 'rohan', 'sneha'], dateTime: '2026-09-10T20:30:00' },
  { id: 'e6', title: 'Snacks run', amount: 380, category: 'food', paidBy: 'priya', splitBetween: ['you', 'priya', 'rohan', 'sneha'], dateTime: '2026-09-10T17:00:00' },
  { id: 'e7', title: 'Water bottles', amount: 300, category: 'food', paidBy: 'priya', splitBetween: ['you', 'priya', 'rohan', 'sneha'], dateTime: '2026-09-10T17:05:00' },
  { id: 'e8', title: 'Beach umbrella rental', amount: 300, category: 'ticket', paidBy: 'you', splitBetween: ['you', 'sneha'], dateTime: '2026-09-10T15:00:00' },
  { id: 'e9', title: 'SIM card', amount: 250, category: 'other', paidBy: 'priya', splitBetween: ['you', 'priya', 'rohan', 'sneha'], dateTime: '2026-09-10T11:00:00' },
  { id: 'e10', title: 'Scuba diving', amount: 4000, category: 'ticket', paidBy: 'priya', splitBetween: ['priya', 'rohan'], dateTime: '2026-09-11T09:00:00' },
  { id: 'e11', title: 'Lunch at the shack', amount: 650, category: 'food', paidBy: 'you', splitBetween: ['you', 'priya', 'rohan', 'sneha'], dateTime: '2026-09-11T13:00:00' },
  { id: 'e12', title: 'Drinks at lunch', amount: 200, category: 'food', paidBy: 'you', splitBetween: ['you', 'priya', 'rohan', 'sneha'], dateTime: '2026-09-11T13:15:00' },
  { id: 'e13', title: 'Hotel, extra night', amount: 3200, category: 'stay', paidBy: 'you', splitBetween: ['you', 'priya', 'rohan', 'sneha'], dateTime: '2026-09-12T14:00:00' },
  { id: 'e14', title: 'Dinner at Thalassa', amount: 720, category: 'food', paidBy: 'sneha', splitBetween: ['you', 'priya', 'rohan', 'sneha'], dateTime: '2026-09-12T20:00:00' },
  { id: 'e15', title: 'Scooter fuel', amount: 200, category: 'transport', paidBy: 'priya', splitBetween: ['you', 'priya', 'rohan', 'sneha'], dateTime: '2026-09-12T10:00:00' },
  { id: 'e16', title: 'Beach cafe breakfast', amount: 450, category: 'food', paidBy: 'you', splitBetween: ['you', 'priya', 'rohan', 'sneha'], dateTime: '2026-09-13T08:30:00' },
  { id: 'e17', title: 'Auto rickshaw', amount: 200, category: 'transport', paidBy: 'priya', splitBetween: ['you', 'priya', 'rohan', 'sneha'], dateTime: '2026-09-13T09:15:00' },
  { id: 'e18', title: 'Sunset cruise tickets', amount: 2200, category: 'ticket', paidBy: 'rohan', splitBetween: ['you', 'priya', 'rohan', 'sneha'], dateTime: '2026-09-13T17:30:00', hasReceipt: true },
];

export function getPerson(id: PersonId): Person {
  const person = TRIP_PEOPLE.find((candidate) => candidate.id === id);
  if (!person) throw new Error(`Unknown person id: ${id}`);
  return person;
}

export function getExpense(expenses: Expense[], id: string): Expense | undefined {
  return expenses.find((expense) => expense.id === id);
}

export type ExpenseDateGroup = { dateKey: string; label: string; expenses: Expense[] };

/** Groups expenses by calendar date, most recent date first, most recent time first within each day. */
export function groupExpensesByDate(expenses: Expense[]): ExpenseDateGroup[] {
  const byDateKey = new Map<string, Expense[]>();

  for (const expense of expenses) {
    const dateKey = expense.dateTime.slice(0, 10);
    const bucket = byDateKey.get(dateKey);
    if (bucket) {
      bucket.push(expense);
    } else {
      byDateKey.set(dateKey, [expense]);
    }
  }

  return Array.from(byDateKey.entries())
    .sort(([a], [b]) => (a < b ? 1 : a > b ? -1 : 0))
    .map(([dateKey, groupExpenses]) => ({
      dateKey,
      label: formatFriendlyDate(dateKey),
      expenses: [...groupExpenses].sort((a, b) => (a.dateTime < b.dateTime ? 1 : -1)),
    }));
}

/**
 * Net balance per person: positive means the group owes them money,
 * negative means they owe the group. Splits an expense's amount evenly
 * across its participants; the payer is credited the full amount.
 */
export function computeNetBalances(expenses: Expense[]): Record<PersonId, number> {
  const balances = Object.fromEntries(TRIP_PEOPLE.map((person) => [person.id, 0])) as Record<PersonId, number>;

  for (const expense of expenses) {
    const share = expense.amount / expense.splitBetween.length;
    for (const participant of expense.splitBetween) {
      balances[participant] -= share;
    }
    balances[expense.paidBy] += expense.amount;
  }

  return balances;
}

export type Settlement = { from: PersonId; to: PersonId; amount: number };

/**
 * Greedily matches the largest debtor against the largest creditor until
 * every balance is settled. Not guaranteed to produce the mathematically
 * minimum number of transfers, but always produces a valid, non-negative
 * settlement plan, and is simple enough to reason about and test.
 */
export function simplifyDebts(balances: Record<PersonId, number>): Settlement[] {
  const EPSILON = 0.5;

  const creditors = Object.entries(balances)
    .filter(([, amount]) => amount > EPSILON)
    .map(([id, amount]) => ({ id: id as PersonId, amount }))
    .sort((a, b) => b.amount - a.amount);

  const debtors = Object.entries(balances)
    .filter(([, amount]) => amount < -EPSILON)
    .map(([id, amount]) => ({ id: id as PersonId, amount: -amount }))
    .sort((a, b) => b.amount - a.amount);

  const settlements: Settlement[] = [];
  let creditorIndex = 0;
  let debtorIndex = 0;

  while (debtorIndex < debtors.length && creditorIndex < creditors.length) {
    const debtor = debtors[debtorIndex];
    const creditor = creditors[creditorIndex];
    const amount = Math.min(debtor.amount, creditor.amount);

    settlements.push({ from: debtor.id, to: creditor.id, amount: Math.round(amount) });

    debtor.amount -= amount;
    creditor.amount -= amount;

    if (debtor.amount <= EPSILON) debtorIndex += 1;
    if (creditor.amount <= EPSILON) creditorIndex += 1;
  }

  return settlements;
}
