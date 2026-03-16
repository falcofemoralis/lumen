import {
  createContext,
  use,
  useCallback,
  useMemo,
  useState,
} from 'react';

interface OverlayContextInterface {
  isOverlayOpen: boolean;
  setIsOverlayOpen: (overlayId: string, isOpen: boolean) => void;
}

const OverlayContext = createContext<OverlayContextInterface>({
  isOverlayOpen: false,
  setIsOverlayOpen: () => {},
});

export const OverlayProvider = ({ children }: { children: React.ReactNode }) => {
  const [openedOverlays, setOpenedOverlays] = useState<Record<string, boolean>>({});

  const setIsOverlayOpen = useCallback((overlayId: string, isOpen: boolean) => {
    setOpenedOverlays(prev => ({
      ...prev,
      [overlayId]: isOpen,
    }));
  }, []);

  const isOverlayOpen = useMemo(() => {
    return Object.values(openedOverlays).some(isOpen => isOpen);
  }, [openedOverlays]);

  const value = useMemo(() => ({
    isOverlayOpen, setIsOverlayOpen,
  }), [isOverlayOpen, setIsOverlayOpen]);

  return (
    <OverlayContext.Provider value={ value }>
      { children }
    </OverlayContext.Provider>
  );
};

export const useOverlayContext = () => use(OverlayContext);
