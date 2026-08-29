import {
  createContext,
  ReactNode,
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

export const OverlayProvider = ({ children }: { children: ReactNode }) => {
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

// Marks the subtree rendered inside an overlay. Overlay content is portaled, so
// it is re-parented under the portal host and cannot be told apart from the page
// underneath by its position in the React tree -- this is how a focusable knows
// it belongs to the overlay that is open rather than to the page behind it.
const OverlayScopeContext = createContext(false);

export const OverlayScopeProvider = ({ children }: { children: ReactNode }) => (
  <OverlayScopeContext.Provider value={ true }>
    { children }
  </OverlayScopeContext.Provider>
);

export const useIsInsideOverlay = () => use(OverlayScopeContext);
