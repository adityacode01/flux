// All date maths is UTC so results don't depend on the server's timezone.

export const startOfDayUTC = (d) => new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
export const endOfDayUTC = (d) => new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 23, 59, 59, 999));
export const startOfMonthUTC = (d) => new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
export const addDaysUTC = (d, days) => new Date(d.getTime() + days * 86_400_000);

const daysInMonth = (year, month) => new Date(Date.UTC(year, month + 1, 0)).getUTCDate();

/** Adds months, clamping the day (31 Jan + 1 month = 28/29 Feb). `anchorDay` keeps the original day-of-month across clamps. */
export function addMonthsUTC(d, months, anchorDay = d.getUTCDate()) {
  const total = d.getUTCMonth() + months;
  const year = d.getUTCFullYear() + Math.floor(total / 12);
  const month = ((total % 12) + 12) % 12;
  return new Date(Date.UTC(year, month, Math.min(anchorDay, daysInMonth(year, month))));
}

/** Next occurrence of a recurring rule after `current`. */
export function nextOccurrence(current, frequency, anchorDay = current.getUTCDate()) {
  switch (frequency) {
    case "DAILY":
      return addDaysUTC(current, 1);
    case "WEEKLY":
      return addDaysUTC(current, 7);
    case "MONTHLY":
      return addMonthsUTC(current, 1, anchorDay);
    case "YEARLY":
      return addMonthsUTC(current, 12, anchorDay);
    default:
      throw new Error(`Unknown frequency: ${frequency}`);
  }
}

/** Monday-based week start, matching Postgres date_trunc('week'). */
export function startOfWeekUTC(d) {
  const day = startOfDayUTC(d);
  const offset = (day.getUTCDay() + 6) % 7;
  return addDaysUTC(day, -offset);
}

export function truncate(d, unit) {
  if (unit === "month") return startOfMonthUTC(d);
  if (unit === "week") return startOfWeekUTC(d);
  return startOfDayUTC(d);
}

export function stepBucket(d, unit) {
  if (unit === "month") return addMonthsUTC(d, 1, 1);
  if (unit === "week") return addDaysUTC(d, 7);
  return addDaysUTC(d, 1);
}

/** Turns a range preset (or custom dates) into { from, to, unit } for analytics. */
export function resolveRange(range, now = new Date(), custom = {}) {
  const today = startOfDayUTC(now);
  let from;
  let to = endOfDayUTC(now);

  switch (range) {
    case "7d":
      from = addDaysUTC(today, -6);
      break;
    case "30d":
      from = addDaysUTC(today, -29);
      break;
    case "3m":
      from = addDaysUTC(addMonthsUTC(today, -3), 1);
      break;
    case "6m":
      from = addDaysUTC(addMonthsUTC(today, -6), 1);
      break;
    case "1y":
      from = addDaysUTC(addMonthsUTC(today, -12), 1);
      break;
    case "custom":
      from = startOfDayUTC(custom.from);
      to = endOfDayUTC(custom.to);
      break;
    default:
      throw new Error(`Unknown range: ${range}`);
  }

  const days = Math.round((to - from) / 86_400_000) + 1;
  const unit = days <= 45 ? "day" : days <= 120 ? "week" : "month";
  return { from, to, unit };
}
