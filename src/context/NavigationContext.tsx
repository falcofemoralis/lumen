import {
  createContext,
  ReactNode,
  useContext,
  useMemo,
  useState,
} from 'react';
import { makeMutable, SharedValue } from 'react-native-reanimated';

// NOTE: a shared value, not React state -- every `ThemedPressable` in the app reads
// this context (through `useDefaultFocus`), so masking the scene as state re-rendered
// the whole tree twice per tab preview and made the sidebar stutter. Only `SceneMask`
// reads it, and it animates on the UI thread.
//
// It lives at module level rather than in `useSharedValue` on purpose: there is exactly
// one sidebar in the app, and writing to a value that was passed to a hook is what
// react-hooks/immutability is there to catch.
const sceneHidden = makeMutable(false);

const hideScene = (isHidden: boolean) => {
  sceneHidden.value = isHidden;
};

interface NavigationContextInterface {
  isMenuOpen: boolean;
  toggleMenu:(isOpen: boolean) => void
  isSceneHidden: SharedValue<boolean>;
  hideScene: (isHidden: boolean) => void;
}

const NavigationContext = createContext<NavigationContextInterface>({
  isMenuOpen: false,
  toggleMenu: () => {},
  isSceneHidden: sceneHidden,
  hideScene,
});

export const NavigationProvider = ({ children }: { children: ReactNode }) => {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  const value = useMemo(() => ({
    isMenuOpen,
    toggleMenu: setIsMenuOpen,
    isSceneHidden: sceneHidden,
    hideScene,
  }), [
    isMenuOpen,
    setIsMenuOpen,
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
