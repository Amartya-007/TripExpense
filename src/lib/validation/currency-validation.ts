/**
 * Currency input sanitisation and validation helpers.
 *
 * All monetary values in this app are stored as plain JavaScript numbers
 * (rupee integers for display, floating-point for split arithmetic). This
 * module centralises the rules so that every entry-point that accepts a
 * user-typed amount uses the same parsing logic.
 */

/** Maximum amount accepted in a single expense or budget field (₹1 crore). */
export const MAX_CURRENCY_AMOUNT = 10_000_000;

/**
 * Removes any character that is not a digit or a single decimal point so
 * that raw keyboard output from `decimal-pad` / `numeric` keyboards can be
 * fed into a Number() call safely.
 *
 * - Strips leading zeros (e.g. "007" → "7").
 * - Keeps at most one decimal point.
 * - Strips anything that could cause parseFloat / Number to return NaN or
 *   Infinity (e.g. "e", "+", "-", multiple dots).
 *
 * Returns the sanitised string. The caller is responsible for calling
 * `Number()` and validating the result.
 */
export function sanitiseCurrencyInput(raw: string): string {
  // Keep only digits and the first decimal point.
  let cleaned = raw.replace(/[^\d.]/g, '');

  // Collapse multiple dots - keep only the first one.
  const firstDot = cleaned.indexOf('.');
  if (firstDot !== -1) {
    cleaned = cleaned.slice(0, firstDot + 1) + cleaned.slice(firstDot + 1).replace(/\./g, '');
  }

  // Strip leading zeros before a non-zero digit (but keep "0." intact).
  cleaned = cleaned.replace(/^0+(?=[1-9])/, '');

  return cleaned;
}

/**
 * Returns `true` when `input` is a finite, positive number or numeric string
 * that does not exceed `MAX_CURRENCY_AMOUNT` and has at most two decimal places.
 */
export function validateCurrencyAmount(input: string | number): boolean {
  if (typeof input === 'number') {
    if (!Number.isFinite(input) || input <= 0 || input > MAX_CURRENCY_AMOUNT) return false;
    // Check decimal places safely without floating point drift
    const parts = input.toString().split('.');
    if (parts.length > 1 && parts[1].length > 2) return false;
    return true;
  }

  const cleaned = sanitiseCurrencyInput(input);
  if (!cleaned || !/^\d+(\.\d{1,2})?$/.test(cleaned)) return false;
  const num = Number(cleaned);
  return Number.isFinite(num) && num > 0 && num <= MAX_CURRENCY_AMOUNT;
}

/**
 * Alias for `validateCurrencyAmount` for backward-compatibility.
 */
export const isValidCurrencyAmount = (value: number): boolean => validateCurrencyAmount(value);

/**
 * Returns a human-readable validation message for an amount string, or
 * `null` when the value is acceptable.
 *
 * Designed for inline form error display.
 */
export function getCurrencyAmountError(raw: string): string | null {
  if (!raw || raw.trim() === '') return 'Enter an amount';

  const cleaned = sanitiseCurrencyInput(raw);
  if (!cleaned) return 'Enter a valid amount';

  if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) {
    if (/^\d+\.\d{3,}$/.test(cleaned)) {
      return 'Enter at most two decimal places';
    }
    return 'Enter a valid amount';
  }

  const value = Number(cleaned);
  if (!Number.isFinite(value) || Number.isNaN(value)) return 'Enter a valid amount';
  if (value <= 0) return 'Amount must be greater than zero';
  if (value > MAX_CURRENCY_AMOUNT) return `Amount cannot exceed ₹${MAX_CURRENCY_AMOUNT.toLocaleString('en-IN')}`;

  return null;
}
