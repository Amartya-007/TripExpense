import { BUDGET_HEALTH_THRESHOLDS } from '@/constants/app-settings';
import { parseISODate, startOfDay, toISODate } from '@/lib/date/friendly-date';

const MS_PER_DAY = 86_400_000;

function diffDays(a: Date, b: Date): number {
  return Math.round((a.getTime() - b.getTime()) / MS_PER_DAY);
}

export type TripStatsInput = {
  budget: number;
  startDate: string;
  endDate: string;
  expenses: { amount: number; dateTime: string }[];
  /** Injectable for tests; defaults to the real current time. */
  now?: Date;
};

export type TripStatusTone = 'success' | 'warning' | 'danger';

export type TripStats = {
  totalSpent: number;
  remainingBalance: number;
  remainingPercentage: number;
  todaySpent: number;
  yesterdaySpent: number;
  totalDays: number;
  daysPassed: number;
  daysRemaining: number;
  /** Average spend per day so far. */
  dailyBurnRate: number;
  /** "Safe to spend today" - remaining balance spread over the days left. */
  remainingPerDay: number;
  /** How much you're projected to go over by, at the current pace. 0 if on track. */
  projectedDeficit: number;
  isOverspending: boolean;
  hasStarted: boolean;
  hasEnded: boolean;
  statusTone: TripStatusTone;
};

/**
 * Budget-health math ported from TripSpend's calculateStats(), adapted to
 * this app's Expense shape. Pure and date-injectable so it's testable
 * without mocking the clock globally.
 */
export function calculateTripStats({ budget, startDate, endDate, expenses, now = new Date() }: TripStatsInput): TripStats {
  const todayKey = toISODate(now);
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = toISODate(yesterday);

  const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const todaySpent = expenses.filter((expense) => expense.dateTime.startsWith(todayKey)).reduce((sum, expense) => sum + expense.amount, 0);
  const yesterdaySpent = expenses.filter((expense) => expense.dateTime.startsWith(yesterdayKey)).reduce((sum, expense) => sum + expense.amount, 0);

  const remainingBalance = budget - totalSpent;
  const remainingPercentage = budget > 0 ? (remainingBalance / budget) * 100 : 0;

  const start = startOfDay(parseISODate(startDate));
  const end = startOfDay(parseISODate(endDate));
  const today = startOfDay(now);
  const totalDays = Math.max(1, diffDays(end, start) + 1);

  const hasStarted = today >= start;
  const hasEnded = today > end;

  const daysPassed = hasStarted ? Math.max(1, diffDays(today, start) + 1) : 0;
  const daysRemaining = hasEnded ? 0 : hasStarted ? Math.max(0, diffDays(end, today)) : totalDays;

  const dailyBurnRate = daysPassed > 0 ? totalSpent / daysPassed : 0;
  const remainingPerDay = daysRemaining > 0 ? remainingBalance / daysRemaining : remainingBalance;

  const projectedEndBalance = hasStarted ? remainingBalance - dailyBurnRate * daysRemaining : remainingBalance;
  const projectedDeficit = projectedEndBalance < 0 ? Math.abs(projectedEndBalance) : 0;
  const isOverspending = remainingBalance < 0 || (hasStarted && daysRemaining > 0 && dailyBurnRate > remainingPerDay);

  let statusTone: TripStatusTone = 'success';
  if (remainingPercentage < BUDGET_HEALTH_THRESHOLDS.dangerBelowPercent) statusTone = 'danger';
  else if (remainingPercentage <= BUDGET_HEALTH_THRESHOLDS.warningAtOrBelowPercent) statusTone = 'warning';

  return {
    totalSpent,
    remainingBalance,
    remainingPercentage,
    todaySpent,
    yesterdaySpent,
    totalDays,
    daysPassed,
    daysRemaining,
    dailyBurnRate,
    remainingPerDay,
    projectedDeficit,
    isOverspending,
    hasStarted,
    hasEnded,
    statusTone,
  };
}
