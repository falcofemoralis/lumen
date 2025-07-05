import { DEFAULT_PROGRESS_STATUS } from 'Component/Player/Player.config';
import { ProgressStatus } from 'Component/Player/Player.type';
import {
  createContext,
  use,
  useCallback,
  useMemo,
  useState,
} from 'react';
import { convertSecondsToTime } from 'Util/Date';

interface PlayerProgressContextInterface {
  progressStatus: ProgressStatus;
  updateProgressStatus: (currentTime: number, bufferedPosition: number, duration: number) => void;
  resetProgressStatus: () => void;
}

const PlayerProgressContext = createContext<PlayerProgressContextInterface>({
  progressStatus: DEFAULT_PROGRESS_STATUS,
  updateProgressStatus: () => {},
  resetProgressStatus: () => {},
});

export const PlayerProgressProvider = ({ children }: { children: React.ReactNode }) => {
  const [progressStatus, setProgressStatus] = useState(DEFAULT_PROGRESS_STATUS);

  const updateProgressStatus = useCallback(
    (currentTime: number, bufferedPosition: number, duration: number) => {
      setProgressStatus({
        progressPercentage: (currentTime / duration) * 100,
        playablePercentage: (bufferedPosition / duration) * 100,
        currentTime: convertSecondsToTime(currentTime),
        durationTime: convertSecondsToTime(duration),
        remainingTime: convertSecondsToTime(duration - currentTime),
      });
    },
    []
  );

  const resetProgressStatus = useCallback(() => {
    setProgressStatus(DEFAULT_PROGRESS_STATUS);
  }, []);

  const value = useMemo(() => ({
    progressStatus,
    updateProgressStatus,
    resetProgressStatus,
  }), [
    progressStatus,
    updateProgressStatus,
    resetProgressStatus,
  ]);

  return (
    <PlayerProgressContext.Provider value={ value }>
      { children }
    </PlayerProgressContext.Provider>
  );
};

export const usePlayerProgressContext = () => use(PlayerProgressContext);
