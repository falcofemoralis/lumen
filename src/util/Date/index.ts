export const convertSecondsToTime = (seconds: number): string => {
  // Hours, minutes and seconds
  const hrs = ~~(seconds / 3600);
  const mins = ~~((seconds % 3600) / 60);
  const secs = ~~seconds % 60;

  let ret = '';

  if (hrs > 0) {
    ret += `${hrs}:${mins < 10 ? '0' : ''}`;
  }

  ret += `${mins}:${secs < 10 ? '0' : ''}`;
  ret += `${secs}`;

  return ret;
};

/**
 * 24-hour wall clock, zero padded -- the `HH:mm` moment format this replaced.
 * Computed from the Date directly rather than through Intl, so no hour-cycle
 * quirk can turn midnight into `24:00`.
 */
export const formatClockTime = (date: Date | number): string => {
  const value = new Date(date);

  const hours = String(value.getHours()).padStart(2, '0');
  const minutes = String(value.getMinutes()).padStart(2, '0');

  return `${hours}:${minutes}`;
};

/**
 * Building an Intl.DateTimeFormat is the expensive part, so keep one per locale.
 */
const clockDateFormatters = new Map<string, Intl.DateTimeFormat>();

const getClockDateFormatter = (locale: string): Intl.DateTimeFormat => {
  const cached = clockDateFormatters.get(locale);

  if (cached) {
    return cached;
  }

  const formatter = new Intl.DateTimeFormat(locale, {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  });

  clockDateFormatters.set(locale, formatter);

  return formatter;
};

/**
 * The player clock: `ddd DD MMM HH:mm` in the app's language. Assembled from
 * parts so the separators stay fixed -- formatting the whole date in one pass
 * would add the locale's own commas and reorder the fields.
 */
export const formatClockDateTime = (date: Date | number, locale: string): string => {
  const value = new Date(date);
  const parts = getClockDateFormatter(locale).formatToParts(value);
  const pick = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? '';

  return `${pick('weekday')} ${pick('day')} ${pick('month')} ${formatClockTime(value)}`;
};

export const getFormattedDate = () => {
  const now = new Date();

  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();

  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
};
