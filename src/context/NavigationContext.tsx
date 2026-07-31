import {
  createContext,
  ReactNode,
  useContext,
  useMemo,
  useState,
} from 'react';

interface NavigationContextInterface {
  isMenuOpen: boolean;
  toggleMenu:(isOpen: boolean) => void
  isSceneHidden: boolean;
  hideScene: (isHidden: boolean) => void;
}

const NavigationContext = createContext<NavigationContextInterface>({
  isMenuOpen: false,
  toggleMenu: () => {},
  isSceneHidden: false,
  hideScene: () => {},
});

export const NavigationProvider = ({ children }: { children: ReactNode }) => {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isSceneHidden, setIsSceneHidden] = useState<boolean>(false);

  const value = useMemo(() => ({
    isMenuOpen,
    toggleMenu: setIsMenuOpen,
    isSceneHidden,
    hideScene: setIsSceneHidden,
  }), [
    isMenuOpen,
    setIsMenuOpen,
    isSceneHidden,
    setIsSceneHidden,
  ]);

  return (
    <NavigationContext.Provider value={ value }>
      { children }
    </NavigationContext.Provider>
  );
};

export const useNavigationContext = () => {
  const context = useContext(NavigationContext);
  if (!context) throw new Error('useNavigationContext must be used within a NavigationProvider');

  return context;
};