import { FocusedElement } from 'Component/Player/Player.config';
import {
  createContext,
  use,
  useCallback,
  useMemo,
  useState,
} from 'react';
import { FilmVoiceInterface } from 'Type/FilmVoice.interface';

interface PlayerContextInterface {
  focusedElement: FocusedElement;
  selectedVoice: {
    filmId: string;
    voice: FilmVoiceInterface;
  } | null
  updateFocusedElement: (element: FocusedElement) => void;
  updateSelectedVoice: (filmId: string, voice: FilmVoiceInterface) => void;
}

const PlayerContext = createContext<PlayerContextInterface>({
  focusedElement: FocusedElement.PROGRESS_THUMB,
  selectedVoice: null,
  updateFocusedElement: () => {},
  updateSelectedVoice: () => {},
});

export const PlayerProvider = ({ children }: { children: React.ReactNode }) => {
  const [focusedElement, setFocusedElement] = useState(FocusedElement.PROGRESS_THUMB);
  const [selectedVoice, setSelectedVoice] = useState<{
    filmId: string;
    voice: FilmVoiceInterface;
  } | null>(null);

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
    focusedElement,
    selectedVoice,
    updateFocusedElement,
    updateSelectedVoice,
  }), [
    focusedElement,
    selectedVoice,
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
