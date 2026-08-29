import { DEFAULT_PROGRESS_STATUS } from 'Component/Player/Player.config';
import { ProgressStatus } from 'Component/Player/Player.type';
import {
  createContext,
  ReactNode,
  use,
  useCallback,
  useMemo,
  useState,
} from 'react';
import { convertSecondsToTime } from 'Util/Date';

type UpdateProgressStatus = (
  currentTime: number,
  bufferedPosition: number,
  duration: number,
  rate?: number,
) => void;

interface PlayerProgressContextInterface {
  progressStatus: ProgressStatus;
  updateProgressStatus: UpdateProgressStatus;
  resetProgressStatus: () => void;
}

interface PlayerProgressActionsInterface {
  updateProgressStatus: UpdateProgressStatus;
  resetProgressStatus: () => void;
}

const PlayerProgressContext = createContext<PlayerProgressContextInterface>({
  progressStatus: DEFAULT_PROGRESS_STATUS,
  updateProgressStatus: () => {},
  resetProgressStatus: () => {},
});

// Separate context for actions only - this won't cause re-renders when state changes
const PlayerProgressActionsContext = createContext<PlayerProgressActionsInterface>({
  updateProgressStatus: () => {},
  resetProgressStatus: () => {},
});

export const PlayerProgressProvider = ({ children }: { children: ReactNode }) => {
  const [progressStatus, setProgressStatus] = useState(DEFAULT_PROGRESS_STATUS);

  const updateProgressStatus = useCallback<UpdateProgressStatus>(
    (currentTime, bufferedPosition, duration, rate = 1) => {
      // an unloaded video reports duration 0, which would publish NaN percentages
      if (!duration || duration <= 0) {
        return;
      }

      // the film has `duration - currentTime` seconds of content left, but it is
      // played out `rate` seconds per real second - at 2x the end of it arrives
      // in half the wall clock time. A rate of 0 is the player's way of pausing,
      // and there is no meaningful end time for that
      const remainingSeconds = duration - currentTime;
      const remainingRealSeconds = rate > 0 ? remainingSeconds / rate : remainingSeconds;

      setProgressStatus({
        progressPercentage: (currentTime / duration) * 100,
        playablePercentage: (bufferedPosition / duration) * 100,
        currentTime: convertSecondsToTime(currentTime),
        durationTime: convertSecondsToTime(duration),
        remainingTime: convertSecondsToTime(remainingSeconds),
        bufferedTime: bufferedPosition > currentTime ? convertSecondsToTime(bufferedPosition - currentTime) : '0',
        endDate: Date.now() + remainingRealSeconds * 1000,
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

  const actionsValue = useMemo(() => ({
    updateProgressStatus,
    resetProgressStatus,
  }), [updateProgressStatus, resetProgressStatus]);

  return (
    <PlayerProgressContext.Provider value={ value }>
      <PlayerProgressActionsContext.Provider value={ actionsValue }>
        { children }
      </PlayerProgressActionsContext.Provider>
    </PlayerProgressContext.Provider>
  );
};

export const usePlayerProgressContext = () => use(PlayerProgressContext);

// Hook to get only the actions without subscribing to state changes
export const usePlayerProgressActions = () => use(PlayerProgressActionsContext);
