import { useCallback, useRef } from 'react';

export const useTripleTap = () => {
  const tapTimesRef = useRef<number>(0);
  const timeoutRef = useRef<number | null>(null);

  const resetTapCount = useCallback(() => {
    tapTimesRef.current = 0;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const handleTap = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    tapTimesRef.current += 1;

    if (tapTimesRef.current >= 3) {
      resetTapCount();

      return true;
    }

    timeoutRef.current = setTimeout(() => {
      resetTapCount();
    }, 1000);

    return false;

  }, [resetTapCount]);

  return {
    handleTap,
  };
};
