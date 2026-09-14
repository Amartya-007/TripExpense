const MONTH_LABELS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const MS_PER_DAY = 86_400_000;

export function parseISODate(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function toISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

/** "Today" / "Tomorrow" / "Yesterday" for near dates, otherwise "12 Sep" (+ year if not this year). */
export function formatFriendlyDate(value: string): string {
  const date = parseISODate(value);
  const today = startOfDay(new Date());
  const diffDays = Math.round((startOfDay(date).getTime() - today.getTime()) / MS_PER_DAY);

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays === -1) return 'Yesterday';

  const withYear = date.getFullYear() !== today.getFullYear() ? ` ${date.getFullYear()}` : '';
  return `${date.getDate()} ${MONTH_LABELS[date.getMonth()].slice(0, 3)}${withYear}`;
}

/** Absolute range for trip cards, e.g. "12 Apr – 16 Apr 2026". Always includes the end year. */
export function formatDateRange(startISO: string, endISO: string): string {
  const start = parseISODate(startISO);
  const end = parseISODate(endISO);
  const startLabel = `${start.getDate()} ${MONTH_LABELS[start.getMonth()].slice(0, 3)}`;
  const endLabel = `${end.getDate()} ${MONTH_LABELS[end.getMonth()].slice(0, 3)} ${end.getFullYear()}`;
  return `${startLabel} – ${endLabel}`;
}

export function formatTime(dateTime: string): string {
  const date = new Date(dateTime);
  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const period = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${hours}:${minutes} ${period}`;
}
