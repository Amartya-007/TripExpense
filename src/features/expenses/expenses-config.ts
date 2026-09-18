import type { IconName } from '@/components/ui/icon';
import { SETTLEMENT_EPSILON } from '@/constants/app-settings';
import { formatFriendlyDate } from '@/lib/date/friendly-date';

export type PersonId =
  | 'you'
  | 'priya'
  | 'rohan'
  | 'sneha'
  | 'amit'
  | 'neha'
  | 'vikas'
  | 'ananya';

export type Person = {
  id: PersonId;
  name: string;
  color: 'primary' | 'accent' | 'secondary' | 'info';
};

export const TRIP_PEOPLE: Person[] = [
  { id: 'you', name: 'You', color: 'primary' },
  { id: 'priya', name: 'Priya', color: 'accent' },
  { id: 'rohan', name: 'Rohan', color: 'secondary' },
  { id: 'sneha', name: 'Sneha', color: 'info' },
  { id: 'amit', name: 'Amit', color: 'primary' },
  { id: 'neha', name: 'Neha', color: 'accent' },
  { id: 'vikas', name: 'Vikas', color: 'secondary' },
  { id: 'ananya', name: 'Ananya', color: 'info' },
];

export type ExpenseCategory = 'food' | 'transport' | 'stay' | 'ticket' | 'other';

export const EXPENSE_CATEGORIES: Record<
  ExpenseCategory,
  {
    label: string;
    icon: IconName;
    gradientFrom: string;
    gradientTo: string;
  }
> = {
  food: {
    label: 'Food',
    icon: 'food',
    gradientFrom: '#F97316',
    gradientTo: '#FBBF24',
  },
  transport: {
    label: 'Transport',
    icon: 'transport',
    gradientFrom: '#2563EB',
    gradientTo: '#60A5FA',
  },
  stay: {
    label: 'Stay',
    icon: 'stay',
    gradientFrom: '#0D9488',
    gradientTo: '#2DD4BF',
  },
  ticket: {
    label: 'Activity',
    icon: 'ticket',
    gradientFrom: '#DB2777',
    gradientTo: '#F472B6',
  },
  other: {
    label: 'Other',
    icon: 'list',
    gradientFrom: '#64748B',
    gradientTo: '#94A3B8',
  },
};

export type Expense = {
  id: string;
  title: string;
  amount: number;
  category: ExpenseCategory;
  paidBy: PersonId;
  splitBetween: PersonId[];
  dateTime: string;
  note?: string;
  hasReceipt?: boolean;
};

/**
 * Mock data intentionally contains different payer/split combinations
 * so the expense, picker, balance, settlement and detail screens can
 * be tested with realistic edge cases.
 *
 * Coverage:
 * - 8 people
 * - 32 expenses
 * - all expense categories
 * - every person appears as payer
 * - 2, 3, 4, 5, 6, 7 and 8-person splits
 * - payer included in split
 * - payer excluded from split
 * - notes present/absent
 * - receipts present/absent
 * - multiple expenses on the same day
 * - multiple dates
 */
export const MOCK_EXPENSES: Expense[] = [
  // ------------------------------------------------------------
  // DAY 1
  // ------------------------------------------------------------

  {
    id: 'e1',
    title: 'Airport cab',
    amount: 1850,
    category: 'transport',
    paidBy: 'you',
    splitBetween: ['you', 'priya', 'rohan', 'sneha'],
    dateTime: '2026-09-10T08:30:00',
    note: 'Cab from airport to the hotel.',
    hasReceipt: true,
  },

  {
    id: 'e2',
    title: 'Hotel booking',
    amount: 7200,
    category: 'stay',
    paidBy: 'rohan',
    splitBetween: [
      'you',
      'priya',
      'rohan',
      'sneha',
      'amit',
      'neha',
      'vikas',
      'ananya',
    ],
    dateTime: '2026-09-10T10:00:00',
    note: 'Two rooms booked for the first two nights.',
    hasReceipt: true,
  },

  {
    id: 'e3',
    title: 'Breakfast',
    amount: 980,
    category: 'food',
    paidBy: 'priya',
    splitBetween: ['you', 'priya', 'rohan', 'sneha'],
    dateTime: '2026-09-10T11:30:00',
  },

  {
    id: 'e4',
    title: 'Extra luggage',
    amount: 650,
    category: 'other',
    paidBy: 'sneha',
    splitBetween: ['you', 'priya', 'rohan', 'sneha'],
    dateTime: '2026-09-10T12:15:00',
    hasReceipt: true,
  },

  {
    id: 'e5',
    title: 'Scooter rentals',
    amount: 2400,
    category: 'transport',
    paidBy: 'amit',
    splitBetween: ['you', 'priya', 'rohan', 'sneha', 'amit', 'neha'],
    dateTime: '2026-09-10T14:00:00',
    note: 'Three scooters for the afternoon.',
    hasReceipt: true,
  },

  {
    id: 'e6',
    title: 'Beach entry',
    amount: 400,
    category: 'ticket',
    paidBy: 'neha',
    splitBetween: ['you', 'priya', 'rohan', 'sneha', 'neha'],
    dateTime: '2026-09-10T15:30:00',
  },

  {
    id: 'e7',
    title: 'Drinking water',
    amount: 180,
    category: 'food',
    paidBy: 'vikas',
    splitBetween: [
      'you',
      'priya',
      'rohan',
      'sneha',
      'amit',
      'neha',
      'vikas',
      'ananya',
    ],
    dateTime: '2026-09-10T16:00:00',
  },

  {
    id: 'e8',
    title: 'Beach umbrella',
    amount: 300,
    category: 'ticket',
    paidBy: 'you',
    splitBetween: ['you', 'sneha'],
    dateTime: '2026-09-10T16:30:00',
  },

  {
    id: 'e9',
    title: 'Coffee and snacks',
    amount: 520,
    category: 'food',
    paidBy: 'ananya',
    splitBetween: ['you', 'priya', 'ananya'],
    dateTime: '2026-09-10T17:30:00',
  },

  {
    id: 'e10',
    title: 'Welcome dinner',
    amount: 3200,
    category: 'food',
    paidBy: 'sneha',
    splitBetween: [
      'you',
      'priya',
      'rohan',
      'sneha',
      'amit',
      'neha',
      'vikas',
      'ananya',
    ],
    dateTime: '2026-09-10T20:00:00',
    note: 'First night dinner for everyone.',
    hasReceipt: true,
  },

  // ------------------------------------------------------------
  // DAY 2
  // ------------------------------------------------------------

  {
    id: 'e11',
    title: 'Morning auto',
    amount: 220,
    category: 'transport',
    paidBy: 'priya',
    splitBetween: ['priya', 'rohan', 'sneha'],
    dateTime: '2026-09-11T08:15:00',
  },

  {
    id: 'e12',
    title: 'Scuba diving',
    amount: 4800,
    category: 'ticket',
    paidBy: 'priya',
    splitBetween: ['priya', 'rohan'],
    dateTime: '2026-09-11T09:30:00',
    note: 'Scuba package for Priya and Rohan.',
    hasReceipt: true,
  },

  {
    id: 'e13',
    title: 'Breakfast at cafe',
    amount: 1250,
    category: 'food',
    paidBy: 'you',
    splitBetween: ['you', 'priya', 'rohan', 'sneha', 'amit'],
    dateTime: '2026-09-11T10:30:00',
  },

  {
    id: 'e14',
    title: 'Parking fee',
    amount: 120,
    category: 'transport',
    paidBy: 'rohan',
    splitBetween: ['you', 'priya', 'rohan', 'sneha'],
    dateTime: '2026-09-11T12:00:00',
  },

  {
    id: 'e15',
    title: 'Lunch',
    amount: 1850,
    category: 'food',
    paidBy: 'amit',
    splitBetween: [
      'you',
      'priya',
      'rohan',
      'sneha',
      'amit',
      'neha',
      'vikas',
    ],
    dateTime: '2026-09-11T13:30:00',
    hasReceipt: true,
  },

  {
    id: 'e16',
    title: 'Museum tickets',
    amount: 960,
    category: 'ticket',
    paidBy: 'ananya',
    splitBetween: ['you', 'priya', 'rohan', 'sneha', 'ananya'],
    dateTime: '2026-09-11T15:00:00',
  },

  {
    id: 'e17',
    title: 'Ice cream',
    amount: 360,
    category: 'food',
    paidBy: 'neha',
    splitBetween: ['neha', 'vikas', 'ananya'],
    dateTime: '2026-09-11T17:00:00',
  },

  {
    id: 'e18',
    title: 'Taxi back to hotel',
    amount: 740,
    category: 'transport',
    paidBy: 'vikas',
    splitBetween: ['you', 'priya', 'rohan', 'sneha', 'vikas'],
    dateTime: '2026-09-11T18:30:00',
  },

  {
    id: 'e19',
    title: 'Dinner',
    amount: 2650,
    category: 'food',
    paidBy: 'rohan',
    splitBetween: [
      'you',
      'priya',
      'rohan',
      'sneha',
      'amit',
      'neha',
      'vikas',
      'ananya',
    ],
    dateTime: '2026-09-11T21:00:00',
    note: 'Dinner near the beach.',
    hasReceipt: true,
  },

  // ------------------------------------------------------------
  // DAY 3
  // ------------------------------------------------------------

  {
    id: 'e20',
    title: 'Hotel extra night',
    amount: 3600,
    category: 'stay',
    paidBy: 'you',
    splitBetween: ['you', 'priya', 'rohan', 'sneha'],
    dateTime: '2026-09-12T09:00:00',
    hasReceipt: true,
  },

  {
    id: 'e21',
    title: 'Breakfast takeaway',
    amount: 620,
    category: 'food',
    paidBy: 'sneha',
    splitBetween: ['you', 'priya', 'sneha', 'ananya'],
    dateTime: '2026-09-12T09:30:00',
  },

  {
    id: 'e22',
    title: 'Fuel',
    amount: 950,
    category: 'transport',
    paidBy: 'vikas',
    splitBetween: ['you', 'priya', 'rohan', 'sneha', 'amit', 'vikas'],
    dateTime: '2026-09-12T11:00:00',
    hasReceipt: true,
  },

  {
    id: 'e23',
    title: 'Boat ride',
    amount: 2800,
    category: 'ticket',
    paidBy: 'neha',
    splitBetween: [
      'you',
      'priya',
      'rohan',
      'sneha',
      'neha',
      'ananya',
    ],
    dateTime: '2026-09-12T13:00:00',
    note: 'Private boat ride.',
  },

  {
    id: 'e24',
    title: 'Lunch at shack',
    amount: 1450,
    category: 'food',
    paidBy: 'ananya',
    splitBetween: ['you', 'priya', 'rohan', 'sneha', 'ananya'],
    dateTime: '2026-09-12T14:30:00',
  },

  {
    id: 'e25',
    title: 'Souvenir',
    amount: 850,
    category: 'other',
    paidBy: 'you',
    splitBetween: ['you'],
    dateTime: '2026-09-12T16:00:00',
    note: 'Personal souvenir. Not shared.',
  },

  {
    id: 'e26',
    title: 'Sunset cruise',
    amount: 5200,
    category: 'ticket',
    paidBy: 'rohan',
    splitBetween: [
      'you',
      'priya',
      'rohan',
      'sneha',
      'amit',
      'neha',
      'vikas',
      'ananya',
    ],
    dateTime: '2026-09-12T18:00:00',
    hasReceipt: true,
  },

  {
    id: 'e27',
    title: 'Dinner at Thalassa',
    amount: 3400,
    category: 'food',
    paidBy: 'priya',
    splitBetween: ['you', 'priya', 'rohan', 'sneha', 'neha', 'ananya'],
    dateTime: '2026-09-12T21:00:00',
    hasReceipt: true,
  },

  // ------------------------------------------------------------
  // DAY 4
  // ------------------------------------------------------------

  {
    id: 'e28',
    title: 'Cafe breakfast',
    amount: 760,
    category: 'food',
    paidBy: 'you',
    splitBetween: ['you', 'priya', 'rohan', 'sneha'],
    dateTime: '2026-09-13T08:30:00',
  },

  {
    id: 'e29',
    title: 'Auto rickshaw',
    amount: 280,
    category: 'transport',
    paidBy: 'priya',
    splitBetween: ['you', 'priya', 'rohan'],
    dateTime: '2026-09-13T09:15:00',
  },

  {
    id: 'e30',
    title: 'Adventure park',
    amount: 3600,
    category: 'ticket',
    paidBy: 'amit',
    splitBetween: ['you', 'priya', 'rohan', 'sneha', 'amit', 'neha'],
    dateTime: '2026-09-13T11:00:00',
    note: 'Adventure park entry for six people.',
    hasReceipt: true,
  },

  {
    id: 'e31',
    title: 'Lunch',
    amount: 1680,
    category: 'food',
    paidBy: 'neha',
    splitBetween: ['you', 'priya', 'rohan', 'sneha', 'neha'],
    dateTime: '2026-09-13T13:30:00',
  },

  {
    id: 'e32',
    title: 'Late checkout',
    amount: 1100,
    category: 'stay',
    paidBy: 'sneha',
    splitBetween: ['you', 'priya', 'rohan', 'sneha'],
    dateTime: '2026-09-13T15:00:00',
    hasReceipt: true,
  },

  {
    id: 'e33',
    title: 'Airport transfer',
    amount: 1600,
    category: 'transport',
    paidBy: 'vikas',
    splitBetween: [
      'you',
      'priya',
      'rohan',
      'sneha',
      'amit',
      'neha',
      'vikas',
      'ananya',
    ],
    dateTime: '2026-09-13T17:30:00',
    note: 'Final transfer to the airport.',
    hasReceipt: true,
  },

  {
    id: 'e34',
    title: 'Coffee before flight',
    amount: 540,
    category: 'food',
    paidBy: 'ananya',
    splitBetween: ['you', 'priya', 'ananya'],
    dateTime: '2026-09-13T18:30:00',
  },

  {
    id: 'e35',
    title: 'Airport snacks',
    amount: 420,
    category: 'food',
    paidBy: 'rohan',
    splitBetween: ['you', 'priya', 'rohan', 'sneha'],
    dateTime: '2026-09-13T19:00:00',
  },

  {
    id: 'e36',
    title: 'Travel insurance',
    amount: 1200,
    category: 'other',
    paidBy: 'you',
    splitBetween: [
      'you',
      'priya',
      'rohan',
      'sneha',
      'amit',
      'neha',
      'vikas',
      'ananya',
    ],
    dateTime: '2026-09-13T19:30:00',
    note: 'Shared travel insurance purchased for the group.',
    hasReceipt: true,
  },
];

export function getPerson(id: PersonId): Person {
  const person = TRIP_PEOPLE.find((candidate) => candidate.id === id);

  if (!person) {
    throw new Error(`Unknown person id: ${id}`);
  }

  return person;
}

export function getExpense(
  expenses: Expense[],
  id: string,
): Expense | undefined {
  return expenses.find((expense) => expense.id === id);
}

export type ExpenseDateGroup = {
  dateKey: string;
  label: string;
  expenses: Expense[];
};

/** Groups expenses by calendar date, most recent date first, most recent time first within each day. */
export function groupExpensesByDate(
  expenses: Expense[],
): ExpenseDateGroup[] {
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
      expenses: [...groupExpenses].sort((a, b) =>
        a.dateTime < b.dateTime ? 1 : -1,
      ),
    }));
}

/**
 * Net balance per person: positive means the group owes them money,
 * negative means they owe the group.
 */
export function computeNetBalances(
  expenses: Expense[],
): Record<PersonId, number> {
  const balances = Object.fromEntries(
    TRIP_PEOPLE.map((person) => [person.id, 0]),
  ) as Record<PersonId, number>;

  for (const expense of expenses) {
    if (expense.splitBetween.length === 0) {
      continue;
    }

    const share = expense.amount / expense.splitBetween.length;

    for (const participant of expense.splitBetween) {
      balances[participant] -= share;
    }

    balances[expense.paidBy] += expense.amount;
  }

  return balances;
}

export type Settlement = {
  from: PersonId;
  to: PersonId;
  amount: number;
};

/**
 * Greedily matches the largest debtor against the largest creditor.
 */
export function simplifyDebts(
  balances: Record<PersonId, number>,
): Settlement[] {
  const EPSILON = SETTLEMENT_EPSILON;

  const creditors = Object.entries(balances)
    .filter(([, amount]) => amount > EPSILON)
    .map(([id, amount]) => ({
      id: id as PersonId,
      amount,
    }))
    .sort((a, b) => b.amount - a.amount);

  const debtors = Object.entries(balances)
    .filter(([, amount]) => amount < -EPSILON)
    .map(([id, amount]) => ({
      id: id as PersonId,
      amount: -amount,
    }))
    .sort((a, b) => b.amount - a.amount);

  const settlements: Settlement[] = [];

  let creditorIndex = 0;
  let debtorIndex = 0;

  while (
    debtorIndex < debtors.length &&
    creditorIndex < creditors.length
  ) {
    const debtor = debtors[debtorIndex];
    const creditor = creditors[creditorIndex];

    const amount = Math.min(
      debtor.amount,
      creditor.amount,
    );

    settlements.push({
      from: debtor.id,
      to: creditor.id,
      amount: Math.round(amount),
    });

    debtor.amount -= amount;
    creditor.amount -= amount;

    if (debtor.amount <= EPSILON) {
      debtorIndex += 1;
    }

    if (creditor.amount <= EPSILON) {
      creditorIndex += 1;
    }
  }

  return settlements;
}
