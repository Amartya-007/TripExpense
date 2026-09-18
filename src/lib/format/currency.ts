import { CURRENCY_LOCALE, CURRENCY_SYMBOL } from '@/constants/app-settings';

/**
 * Formats an amount as display currency, e.g. `formatCurrency(32750)` -> "₹32,750".
 *
 * This replaces what used to be an identical `formatCurrency` helper
 * copy-pasted into six different screens/components (dashboard, expenses
 * list, expense row, expense detail, category breakdown, settle). Changing
 * the app's currency symbol or locale now only requires editing
 * `src/constants/app-settings.ts` - previously it required six separate edits.
 */
export function formatCurrency(amount: number): string {
  return `${CURRENCY_SYMBOL}${amount.toLocaleString(CURRENCY_LOCALE)}`;
}

/**
 * Same as `formatCurrency`, but rounds to the nearest whole unit and drops
 * the sign first - the shape the Settle Up screen wants for a transfer
 * amount, which is always shown as a positive, whole-currency figure.
 */
export function formatCurrencyRounded(amount: number): string {
  return `${CURRENCY_SYMBOL}${Math.round(Math.abs(amount)).toLocaleString(CURRENCY_LOCALE)}`;
}
