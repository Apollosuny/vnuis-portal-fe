// Helper functions for date formatting using luxon
import { DateTime } from 'luxon';

/**
 * Format ISO date string to a readable format
 * @param isoString ISO date string
 * @param format Format to use (default: 'MMMM d, yyyy')
 * @returns Formatted date string
 */
export function formatDate(
  isoString: string,
  format: string = 'MMMM d, yyyy'
): string {
  if (!isoString) return 'N/A';
  return DateTime.fromISO(isoString).toFormat(format);
}

/**
 * Format ISO date string to relative time (e.g., '2 days ago')
 * @param isoString ISO date string
 * @returns Relative time string
 */
export function formatRelativeTime(isoString: string): string {
  if (!isoString) return 'N/A';
  return DateTime.fromISO(isoString).toRelative() ?? 'N/A';
}

/**
 * Format ISO date string to include time
 * @param isoString ISO date string
 * @returns Formatted date string with time
 */
export function formatDateTime(isoString: string): string {
  if (!isoString) return 'N/A';
  return DateTime.fromISO(isoString).toFormat('MMMM d, yyyy - h:mm a');
}

/**
 * Calculate days elapsed since a given date
 * @param isoString ISO date string
 * @returns Number of days elapsed
 */
export function daysElapsed(isoString: string): number {
  if (!isoString) return 0;
  const date = DateTime.fromISO(isoString);
  const now = DateTime.local();
  return Math.floor(now.diff(date, 'days').days);
}
