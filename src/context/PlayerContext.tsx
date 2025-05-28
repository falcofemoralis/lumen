import { DEFAULT_PROGRESS_STATUS, FocusedElement } from 'Component/Player/Player.config';
import { ProgressStatus } from 'Component/Player/Player.type';
import {
  createContext,
  use,
  useCallback,
  useMemo,
  useState,
} from 'react';
import { FilmVoiceInterface } from 'Type/FilmVoice.interface';
import { convertSecondsToTime } from 'Util/Date';

interface PlayerContextInterface {
  progressStatus: ProgressStatus;
  focusedElement: FocusedElement;
  selectedVoice: {
    filmId: string;
    voice: FilmVoiceInterface;
  } | null
  updateProgressStatus: (currentTime: number, bufferedPosition: number, duration: number) => void;
  resetProgressStatus: () => void;
  updateFocusedElement: (element: FocusedElement) => void;
  updateSelectedVoice: (filmId: string, voice: FilmVoiceInterface) => void;
}

const PlayerContext = createContext<PlayerContextInterface>({
  progressStatus: DEFAULT_PROGRESS_STATUS,
  focusedElement: FocusedElement.PROGRESS_THUMB,
  selectedVoice: null,
  updateProgressStatus: () => {},
  resetProgressStatus: () => {},
  updateFocusedElement: () => {},
  updateSelectedVoice: () => {},
});

export const PlayerProvider = ({ children }: { children: React.ReactNode }) => {
  const [progressStatus, setProgressStatus] = useState(DEFAULT_PROGRESS_STATUS);
  const [focusedElement, setFocusedElement] = useState(FocusedElement.PROGRESS_THUMB);
  const [selectedVoice, setSelectedVoice] = useState<{
    filmId: string;
    voice: FilmVoiceInterface;
  } | null>(null);

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

  const updateFocusedElement = useCallback((element: FocusedElement) => {
    setFocusedElement(element);
  }, []);

  const updateSelectedVoice = useCallback((filmId: string, voice: FilmVoiceInterface) => {
    setSelectedVoice({
      filmId,
      voice,
    });
  }, []);

  const value = useMemo(() => ({
    progressStatus,
    focusedElement,
    selectedVoice,
    updateProgressStatus,
    resetProgressStatus,
    updateFocusedElement,
    updateSelectedVoice,
  }), [
    progressStatus,
    focusedElement,
    selectedVoice,
    updateProgressStatus,
    resetProgressStatus,
    updateFocusedElement,
    updateSelectedVoice,
  ]);

  return (
    <PlayerContext.Provider value={ value }>
      { children }
    </PlayerContext.Provider>
  );
};

export const usePlayerContext = () => use(PlayerContext);
