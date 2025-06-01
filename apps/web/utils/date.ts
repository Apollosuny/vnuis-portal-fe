/**
 * Date formatting utility functions
 */
import { DateTime } from 'luxon';

/**
 * Format a date string (YYYY-MM-DD) for UI display
 * @param date Date object or ISO date string
 * @returns Formatted date string like "June 2, 2025"
 */
export function formatDateForDisplay(dateStr: string | Date): string {
  if (typeof dateStr === 'string') {
    return DateTime.fromISO(dateStr).toLocaleString({
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } else {
    return DateTime.fromJSDate(dateStr).toLocaleString({
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
}

/**
 * Format a date object to YYYY-MM-DD string for input[type="date"]
 * @param date Date object
 * @returns YYYY-MM-DD formatted string
 */
export function formatISODateForUI(date: Date): string {
  return DateTime.fromJSDate(date).toFormat('yyyy-MM-dd');
}

/**
 * Parse an ISO date string and return a formatted time string (HH:MM)
 * @param isoString ISO date string
 * @param convertFromUTC Whether to convert from UTC to local time (default: true)
 * @returns Time string in HH:MM format
 */
export function formatTimeFromISOString(
  isoString: string,
  convertFromUTC = true
): string {
  let dateTime = DateTime.fromISO(isoString);

  // If the time is from UTC and needs conversion to local time
  if (convertFromUTC && isoString.includes('Z')) {
    dateTime = dateTime.toLocal();
  }

  return dateTime.toFormat('HH:mm');
}

/**
 * Convert time string (HH:MM) between UTC and local timezone
 * @param timeString Time string in HH:MM format
 * @param date Date to use for the conversion (defaults to today)
 * @param toUTC Convert to UTC (true) or from UTC to local (false)
 * @returns Converted time string in HH:MM format
 */
export function convertTimeZone(
  timeString: string,
  date: string | Date = new Date(),
  toUTC = false
): string {
  // Create a datetime from the time string and date
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const [hours, minutes] = timeString.split(':').map(Number);

  let dt: DateTime;

  if (toUTC) {
    // Local to UTC conversion
    dt = DateTime.fromObject({
      year: dateObj.getFullYear(),
      month: dateObj.getMonth() + 1,
      day: dateObj.getDate(),
      hour: hours,
      minute: minutes,
    }).toUTC();
  } else {
    // UTC to local conversion
    dt = DateTime.fromObject(
      {
        year: dateObj.getFullYear(),
        month: dateObj.getMonth() + 1,
        day: dateObj.getDate(),
        hour: hours,
        minute: minutes,
      },
      { zone: 'UTC' }
    ).toLocal();
  }

  return dt.toFormat('HH:mm');
}

/**
 * Get the day of the week abbreviation (MON, TUE, etc.) from a date
 * @param date Date object
 * @returns Day of week abbreviation
 */
export function getDayOfWeekAbbr(date: Date): string {
  const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  return days[date.getDay()] || '';
}
