import {
  createContext,
  use,
  useCallback,
  useMemo,
  useState
} from 'react';

interface OverlayContextInterface {
  currentOverlay: string[];
  hasOpenedOverlay: () => boolean;
  isOverlayOpened: (id: string) => boolean;
  isOverlayVisible: (id: string) => boolean;
  openOverlay: (id: string) => void;
  closeOverlay: (id: string) => void;
  goToPreviousOverlay: () => void;
}

const OverlayContext = createContext<OverlayContextInterface>({
  currentOverlay: [],
  hasOpenedOverlay: () => false,
  isOverlayOpened: () => false,
  isOverlayVisible: () => false,
  openOverlay: () => {},
  closeOverlay: () => {},
  goToPreviousOverlay: () => {},
});

export const OverlayProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentOverlay, setCurrentOverlay] = useState<string[]>([]);

  const hasOpenedOverlay = useCallback(() => {
    return currentOverlay.length > 0;
  }, [currentOverlay]);

  const isOverlayOpened = useCallback((id: string) => {
    if (!currentOverlay.length) {
      return false;
    }

    return currentOverlay.includes(id);
  }, [currentOverlay]);

  const isOverlayVisible = useCallback((id: string) => {
    if (!currentOverlay.length) {
      return false;
    }

    return currentOverlay[currentOverlay.length - 1] === id;
  }, [currentOverlay]);

  const closeOverlay = useCallback((id: string) => {
    setCurrentOverlay(
      (prev) => prev.filter((overlayId) => overlayId !== id)
    );
  }, []);

  const openOverlay = useCallback((id: string) => {
    closeOverlay(id);

    setCurrentOverlay((prev) => [...prev, id]);
  }, [closeOverlay]);

  const goToPreviousOverlay = useCallback(() => {
    setCurrentOverlay((prev) => prev.slice(0, -1));
  }, []);

  const value = useMemo(() => ({
    currentOverlay,
    hasOpenedOverlay,
    isOverlayOpened,
    isOverlayVisible,
    openOverlay,
    closeOverlay,
    goToPreviousOverlay
  }), [
    currentOverlay,
    hasOpenedOverlay,
    isOverlayOpened,
    isOverlayVisible,
    openOverlay,
    closeOverlay,
    goToPreviousOverlay
  ]);

  return (
    <OverlayContext.Provider value={ value }>
      { children }
    </OverlayContext.Provider>
  );
};

export const useOverlayContext = () => use(OverlayContext);
