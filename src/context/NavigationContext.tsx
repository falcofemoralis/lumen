import {
  createContext,
  use,
  useCallback,
  useMemo,
  useState
} from 'react';

interface NavigationContextInterface {
  isMenuOpen: boolean;
  toggleMenu:(isOpen: boolean) => void
  isNavigationLocked: boolean;
  lockNavigation: () => void;
  unlockNavigation: () => void;
}

const NavigationContext = createContext<NavigationContextInterface>({
  isMenuOpen: false,
  toggleMenu: () => {},
  isNavigationLocked: false,
  lockNavigation: () => {},
  unlockNavigation: () => {},
});

export const NavigationProvider = ({ children }: { children: React.ReactNode }) => {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isNavigationLocked, setIsNavigationLocked] = useState<boolean>(false);

  const lockNavigation = useCallback(() => {
    setIsNavigationLocked(true);
  }, []);

  const unlockNavigation = useCallback(() => {
    setIsNavigationLocked(false);
  }, []);

  const value = useMemo(() => ({
    isMenuOpen,
    toggleMenu: setIsMenuOpen,
    isNavigationLocked,
    lockNavigation,
    unlockNavigation,
  }), [
    isMenuOpen,
    setIsMenuOpen,
    isNavigationLocked,
    lockNavigation,
    unlockNavigation,
  ]);

  return (
    <NavigationContext.Provider value={ value }>
      { children }
    </NavigationContext.Provider>
  );
};

export const useNavigationContext = () => use(NavigationContext);
