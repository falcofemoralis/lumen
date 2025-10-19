import {
  createContext,
  use,
  useMemo,
  useState,
} from 'react';

interface OverlayContextInterface {
  isOverlayOpen: boolean;
  setIsOverlayOpen: (isOpen: boolean) => void;
}

const OverlayContext = createContext<OverlayContextInterface>({
  isOverlayOpen: false,
  setIsOverlayOpen: () => {},
});

export const OverlayProvider = ({ children }: { children: React.ReactNode }) => {
  const [isOverlayOpen, setIsOverlayOpen] = useState<boolean>(false);

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
