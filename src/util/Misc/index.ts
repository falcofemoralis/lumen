export const setTimeoutSafe = (callback: () => void, ms?: number): number | null => {
  try {
    return setTimeout(() => {
      try {
        callback();
      } catch (e) {
        console.error('error', e);
      }
    }, ms) as unknown as number;
  } catch (e) {
    // sometimes it can throw an error
    // Error: The 1st argument cannot be cast to type expo.modules.video.player.VideoPlayer
    // (received class java.lang.Integer)
    // → Caused by: Cannot use shared object that was already released
    console.error('error', e);

    return null;
  }
};

export const setIntervalSafe = (callback: () => void, ms?: number): number | null => {
  try {
    return setInterval(() => {
      try {
        callback();
      } catch (e) {
        console.error('error', e);
      }
    }, ms) as unknown as number;
  } catch (e) {
    // sometimes it can throw an error
    // Error: The 1st argument cannot be cast to type expo.modules.video.player.VideoPlayer
    // (received class java.lang.Integer)
    // → Caused by: Cannot use shared object that was already released
    console.error('error', e);

    return null;
  }
};

export const wait = (ms: number): Promise<void> => new Promise((resolve) => { setTimeoutSafe(resolve, ms); });

/**
 * A comparable number for a `major.minor.patch` version. Each segment gets its
 * own decimal band, so multi-digit segments still order correctly (a plain digit
 * concatenation made 1.5.10 look newer than 1.6.0).
 */
export const versionStringToNumber = (versionString: string): number => {
  const [major = 0, minor = 0, patch = 0] = versionString
    .replace(/[^\d.]/g, '')
    .split('.')
    .map((part) => parseInt(part, 10) || 0);

  return (major * 1000000) + (minor * 1000) + patch;
};
