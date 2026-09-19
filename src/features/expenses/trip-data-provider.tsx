import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

import { MOCK_EXPENSES, type Expense } from '@/features/expenses/expenses-config';

export type ExpenseInput = Omit<Expense, 'id'>;

type TripDataContextValue = {
  expenses: Expense[];
  addExpense: (input: ExpenseInput) => void;
  updateExpense: (id: string, input: ExpenseInput) => void;
  deleteExpense: (id: string) => void;
};

const TripDataContext = createContext<TripDataContextValue | null>(null);

/**
 * Holds trip expenses in memory for the current app session. This is a
 * deliberate stand-in for what will eventually be a TanStack Query cache
 * backed by the real trip API: add/update/deleteExpense have the same
 * shape a mutation would have, and every screen reads through
 * useTripData() rather than importing MOCK_EXPENSES directly, so swapping
 * the data source later shouldn't require touching the screens themselves.
 */
export function TripDataProvider({ children }: { children: ReactNode }) {
  // SECURITY NOTE — when the real trip API is wired here:
  // Every mutation (add/update/delete) must be validated server-side:
  //   - The expense belongs to a trip the authenticated user is a member of.
  //   - DELETE and UPDATE verify ownership:
  //       WHERE id = ? AND trip_id IN (SELECT id FROM trips WHERE member_id = session.user.id)
  //   - Use session.user.id from getAuth().api.getSession() — same pattern as onboarding-handler.ts.
  //   - Never trust a client-supplied expense id for mutation without this ownership check.
  const [expenses, setExpenses] = useState<Expense[]>(MOCK_EXPENSES);

  function addExpense(input: ExpenseInput) {
    const expense: Expense = { ...input, id: `local-${Date.now()}` };
    setExpenses((current) => [expense, ...current]);
  }

  function updateExpense(id: string, input: ExpenseInput) {
    setExpenses((current) => current.map((expense) => (expense.id === id ? { ...input, id } : expense)));
  }

  function deleteExpense(id: string) {
    setExpenses((current) => current.filter((expense) => expense.id !== id));
  }

  const value = useMemo(() => ({ expenses, addExpense, updateExpense, deleteExpense }), [expenses]);

  return <TripDataContext.Provider value={value}>{children}</TripDataContext.Provider>;
}

export function useTripData() {
  const context = useContext(TripDataContext);
  if (!context) {
    throw new Error('useTripData must be used within a TripDataProvider');
  }
  return context;
}
