const cache = new Map();

function formatter(currency) {
  if (!cache.has(currency)) {
    cache.set(
      currency,
      new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 2, minimumFractionDigits: 0 }),
    );
  }
  return cache.get(currency);
}

/** 125000 -> "₹1,25,000" (Indian digit grouping) */
export function formatMoney(value, currency = "INR") {
  return formatter(currency).format(value);
}

/** Compact form for chart axes: 125000 -> "₹1.25L" */
export function formatCompact(value) {
  const abs = Math.abs(value);
  if (abs >= 1e7) return `₹${+(value / 1e7).toFixed(2)}Cr`;
  if (abs >= 1e5) return `₹${+(value / 1e5).toFixed(2)}L`;
  if (abs >= 1e3) return `₹${+(value / 1e3).toFixed(1)}k`;
  return `₹${value}`;
}

export function formatDate(value, opts = { day: "2-digit", month: "short", year: "numeric" }) {
  return new Intl.DateTimeFormat("en-IN", opts).format(new Date(value));
}
