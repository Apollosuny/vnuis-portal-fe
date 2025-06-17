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
  // Early validation of time string format
  if (!timeString || !timeString.includes(':')) {
    console.error('Invalid time string format:', timeString);
    return timeString; // Return original if invalid
  }

  try {
    // Parse the time components
    const parts = timeString.split(':');
    if (parts.length !== 2 || !parts[0] || !parts[1]) {
      console.error('Invalid time string format (must be HH:MM):', timeString);
      return timeString;
    }

    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);

    if (
      isNaN(hours) ||
      isNaN(minutes) ||
      hours < 0 ||
      hours > 23 ||
      minutes < 0 ||
      minutes > 59
    ) {
      console.error('Invalid time values:', timeString);
      return timeString; // Return original if invalid values
    }

    // Parse the date
    let dateObject: DateTime;

    if (typeof date === 'string') {
      dateObject = DateTime.fromISO(date);
      if (!dateObject.isValid) {
        console.error(
          'Invalid date string:',
          date,
          dateObject.invalidExplanation
        );
        dateObject = DateTime.now(); // Use current date as fallback
      }
    } else {
      dateObject = DateTime.fromJSDate(date);
    }

    // Create a new DateTime object with the specific time components
    // and appropriate timezone handling
    let result: string;

    if (toUTC) {
      // Local to UTC conversion - interpret time as local time, then convert to UTC
      const localTime = dateObject
        .set({ hour: hours, minute: minutes })
        .setZone('local');

      const utcTime = localTime.toUTC();
      result = utcTime.toFormat('HH:mm');

      console.log('Local to UTC conversion:', {
        original: timeString,
        localTime: localTime.toString(),
        utcTime: utcTime.toString(),
        result,
      });
    } else {
      // UTC to local conversion - interpret time as UTC, then convert to local
      const utcTime = DateTime.fromObject(
        {
          year: dateObject.year,
          month: dateObject.month,
          day: dateObject.day,
          hour: hours,
          minute: minutes,
        },
        { zone: 'UTC' }
      );

      const localTime = utcTime.toLocal();
      result = localTime.toFormat('HH:mm');

      console.log('UTC to local conversion:', {
        original: timeString,
        utcTime: utcTime.toString(),
        localTime: localTime.toString(),
        result,
      });
    }

    return result;
  } catch (error) {
    console.error('Error converting timezone:', error);
    return timeString; // Return original on error
  }
}

/**
 * Properly converts a time string between timezones using Luxon
 * This is a more robust implementation than convertTimeZone
 *
 * @param timeStr Time string in format HH:MM
 * @param dateStr Date string in format YYYY-MM-DD (or ISO)
 * @param fromZone Source timezone (default: 'UTC')
 * @param toZone Target timezone (default: 'local')
 * @returns Formatted time string in HH:MM format
 */
export function convertBetweenTimezones(
  timeStr: string,
  dateStr: string,
  fromZone: string = 'UTC',
  toZone: string = 'local'
): string {
  try {
    // Parse the time components safely
    const parts = timeStr.split(':');
    if (parts.length < 2 || !parts[0] || !parts[1]) {
      console.error('Invalid time format, expected HH:MM:', timeStr);
      return timeStr;
    }

    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);

    if (isNaN(hours) || isNaN(minutes)) {
      console.error('Invalid time components:', timeStr);
      return timeStr;
    }

    // Parse the date safely
    const baseDate = DateTime.fromISO(dateStr);
    if (!baseDate.isValid) {
      console.error('Invalid date format:', dateStr);
      return timeStr;
    }

    // Create DateTime in source timezone
    const sourceTime = DateTime.fromObject(
      {
        year: baseDate.year,
        month: baseDate.month,
        day: baseDate.day,
        hour: hours,
        minute: minutes,
      },
      { zone: fromZone }
    );

    if (!sourceTime.isValid) {
      console.error('Invalid source time:', sourceTime.invalidExplanation);
      return timeStr;
    }

    // Convert to target timezone
    const targetTime = sourceTime.setZone(toZone);

    if (!targetTime.isValid) {
      console.error('Invalid target time:', targetTime.invalidExplanation);
      return timeStr;
    }

    // Format result
    const result = targetTime.toFormat('HH:mm');

    // Detailed logging for debugging
    console.log('Time conversion:', {
      original: timeStr,
      date: dateStr,
      from: fromZone,
      to: toZone,
      sourceTime: sourceTime.toString(),
      targetTime: targetTime.toString(),
      result,
    });

    return result;
  } catch (error) {
    console.error('Error converting between timezones:', error);
    return timeStr;
  }
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
