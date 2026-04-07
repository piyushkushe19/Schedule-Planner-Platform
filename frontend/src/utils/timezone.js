/**
 * Detect the user's local IANA timezone string.
 */
export const detectTimezone = () =>
  Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';

/**
 * Format a UTC ISO string as a time (e.g. "9:30 AM") in the given timezone.
 * Uses native Intl API — no external dependency needed.
 */
export const formatSlot = (isoString, timezone) => {
  try {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: timezone,
    }).format(new Date(isoString));
  } catch {
    return new Date(isoString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }
};

/**
 * Format a UTC ISO string as full date+time in the given timezone.
 * e.g. "Mon, Jan 15, 2024, 10:00 AM EST"
 */
export const formatDateTime = (isoString, timezone) => {
  try {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: timezone,
      timeZoneName: 'short',
    }).format(new Date(isoString));
  } catch {
    return new Date(isoString).toLocaleString();
  }
};

/**
 * Format just the date portion.
 */
export const formatDate = (isoString, timezone) => {
  try {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      timeZone: timezone,
    }).format(new Date(isoString));
  } catch {
    return new Date(isoString).toDateString();
  }
};

/**
 * Common IANA timezone options for the selector.
 */
export const TIMEZONES = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Vancouver',
  'America/Toronto',
  'America/Sao_Paulo',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Europe/Amsterdam',
  'Europe/Moscow',
  'Africa/Cairo',
  'Africa/Johannesburg',
  'Asia/Dubai',
  'Asia/Kolkata',
  'Asia/Dhaka',
  'Asia/Bangkok',
  'Asia/Singapore',
  'Asia/Shanghai',
  'Asia/Tokyo',
  'Asia/Seoul',
  'Australia/Sydney',
  'Australia/Melbourne',
  'Pacific/Auckland',
  'Pacific/Honolulu',
];
