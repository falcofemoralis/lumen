/** Compare validated sync payloads, reusing record references retained by merge. */
export const equalCloudSyncData = (first: unknown, second: unknown): boolean => {
  if (first === second) return true;
  if (!first || !second || typeof first !== 'object' || typeof second !== 'object') return false;
  if (Array.isArray(first) || Array.isArray(second)) {
    return Array.isArray(first) && Array.isArray(second) && first.length === second.length
      && first.every((value, index) => equalCloudSyncData(value, second[index]));
  }
  const left = first as Record<string, unknown>, right = second as Record<string, unknown>;
  const keys = Object.keys(left);

  return keys.length === Object.keys(right).length && keys.every(key =>
    Object.prototype.hasOwnProperty.call(right, key) && equalCloudSyncData(left[key], right[key]));
};
