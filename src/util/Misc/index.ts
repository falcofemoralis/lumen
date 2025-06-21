export const setTimeoutSafe = (callback: () => void, ms?: number): NodeJS.Timeout | null => {
  try {
    return setTimeout(() => {
      try {
        callback();
      } catch (e) {
        console.error('error', e);
      }
    }, ms) as unknown as NodeJS.Timeout;
  } catch (e) {
    // sometimes it can throw an error
    // Error: The 1st argument cannot be cast to type expo.modules.video.player.VideoPlayer
    // (received class java.lang.Integer)
    // → Caused by: Cannot use shared object that was already released
    console.error('error', e);

    return null;
  }
};

export const setIntervalSafe = (callback: () => void, ms?: number): NodeJS.Timeout | null => {
  try {
    return setInterval(() => {
      try {
        callback();
      } catch (e) {
        console.error('error', e);
      }
    }, ms) as unknown as NodeJS.Timeout;
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
