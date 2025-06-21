/**
 * Safely parses a JSON string, returning a fallback value if the string is not valid JSON.
 *
 * @param str - The JSON string to parse.
 * @param fallback - A fallback value if parsing fails.
 * @returns The parsed JSON as an object, string, number, array, boolean, or null.
 */
export const safeJsonParse = <T>(
  str: string | null | undefined,
  fallback?: T
): T | null => {
  if (!str) {
    return fallback ?? null;
  }

  try {
    return JSON.parse(str) as T;
  } catch {
    return fallback ?? null;
  }
};
