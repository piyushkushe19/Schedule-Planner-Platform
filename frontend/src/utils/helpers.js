export const copyToClipboard = async (text) => {
  await navigator.clipboard.writeText(text);
};

export const truncate = (str, maxLen = 60) =>
  str.length > maxLen ? str.slice(0, maxLen) + '…' : str;

export const initials = (name = '') =>
  name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

// ── Native date helpers (no date-fns needed) ──────────────────────────────

/** Return today's date at midnight local time */
export const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

/** Add N days to a date, returns new Date */
export const addDays = (date, n) => {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
};

/** True if two dates are the same calendar day */
export const isSameDay = (a, b) => {
  const da = new Date(a);
  const db = new Date(b);
  return (
    da.getFullYear() === db.getFullYear() &&
    da.getMonth()    === db.getMonth()    &&
    da.getDate()     === db.getDate()
  );
};

/** Format date as "yyyy-MM-dd" for API calls */
export const toISODate = (date) => {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

/** Format date for display, e.g. "January 2024" or "Jan 15" */
export const fmtDate = (date, opts) => {
  return new Intl.DateTimeFormat('en-US', opts).format(new Date(date));
};

/** Shorthand formatters */
export const fmtMonthYear  = (d) => fmtDate(d, { month: 'long',  year: 'numeric' });
export const fmtMonthDay   = (d) => fmtDate(d, { month: 'short', day: 'numeric'  });
export const fmtDayNum     = (d) => fmtDate(d, { day: 'numeric' });
export const fmtWeekdayLong= (d) => fmtDate(d, { weekday: 'long', month: 'long', day: 'numeric' });
export const fmtShortDate  = (d) => fmtDate(d, { weekday: 'short', month: 'short', day: 'numeric' });
