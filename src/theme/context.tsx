import {
  DarkTheme as NavDarkTheme,
  DefaultTheme as NavDefaultTheme,
  Theme as NavTheme,
} from '@react-navigation/native';
import { useConfigContext } from 'Context/ConfigContext';
import {
  createContext,
  FC,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
} from 'react';
import { Dimensions, StyleProp, useColorScheme, useWindowDimensions } from 'react-native';
import { moderateScale } from 'react-native-size-matters';

import { setImperativeTheming } from './context.utils';
import { darkTheme, lightTheme } from './theme';
import type {
  AllowedStylesT,
  ImmutableThemeContextModeT,
  Theme,
  ThemeContextModeT,
  ThemedStyle,
} from './types';

export type ThemeContextType = {
  navigationTheme: NavTheme
  setThemeContextOverride: (newTheme?: ThemeContextModeT) => void
  theme: Theme
  themeContext: ImmutableThemeContextModeT
  themeScheme?: string
  themed: <T>(styleOrStyleFn: AllowedStylesT<T>) => T
  themedStyles: <T>(styleOrStyleFn: ThemedStyle<T>) => T
  scale: (number: number) => number
}

export const ThemeContext = createContext<ThemeContextType | null>(null);

export interface ThemeProviderProps {
  initialContext?: ThemeContextModeT
}

/**
 * The ThemeProvider is the heart and soul of the design token system. It provides a context wrapper
 * for your entire app to consume the design tokens as well as global functionality like the app's theme.
 *
 * To get started, you want to wrap your entire app's JSX hierarchy in `ThemeProvider`
 * and then use the `useAppTheme()` hook to access the theme context.
 *
 * Documentation: https://docs.infinite.red/ignite-cli/boilerplate/app/theme/Theming/
 */
export const ThemeProvider: FC<PropsWithChildren<ThemeProviderProps>> = ({
  children,
  initialContext,
}) => {
  // The operating system theme:
  const systemColorScheme = useColorScheme();
  // Our saved theme context: can be "light", "dark", or undefined (system theme)
  const { themeScheme, isConfigured, isTV, setConfig } = useConfigContext();
  const dimensions = useWindowDimensions();

  /**
   * This function is used to set the theme context and is exported from the useAppTheme() hook.
   *  - setThemeContextOverride("dark") sets the app theme to dark no matter what the system theme is.
   *  - setThemeContextOverride("light") sets the app theme to light no matter what the system theme is.
   *  - setThemeContextOverride(undefined) the app will follow the operating system theme.
   */
  const setThemeContextOverride = useCallback(
    (newTheme?: ThemeContextModeT) => {
      setConfig('themeScheme', newTheme);
    },
    [setConfig]
  );

  const tvScale = useMemo(() => (Dimensions.get('screen').width / 960), []);

  const scale = useCallback((number: number) => {
    if (!isConfigured) {
      return Number(number.toFixed(0));
    }

    const value = isTV ? number * Number(tvScale.toFixed(1)) : moderateScale(number);

    return Number(value.toFixed(0));
  }, [isConfigured, isTV, tvScale]);

  /**
   * initialContext is the theme context passed in from the app.tsx file and always takes precedence.
   * themeScheme is the value from MMKV. If undefined, we fall back to the system theme
   * systemColorScheme is the value from the device. If undefined, we fall back to "light"
   */
  const themeContext: ImmutableThemeContextModeT = useMemo(() => {
    const t = initialContext || themeScheme || (!!systemColorScheme ? systemColorScheme : 'light');

    return t === 'dark' ? 'dark' : 'light';
  }, [initialContext, themeScheme, systemColorScheme]);

  const navigationTheme: NavTheme = useMemo(() => {
    switch (themeContext) {
      case 'dark':
        return NavDarkTheme;
      default:
        return NavDefaultTheme;
    }
  }, [themeContext]);

  const theme: Theme = useMemo(() => {
    const selected = themeContext === 'dark' ? darkTheme : lightTheme;

    return {
      ...selected,
      scale,
      dimensions,
    };
  }, [themeContext, scale, dimensions]);

  useEffect(() => {
    setImperativeTheming(theme);
  }, [theme]);

  const themed = useCallback(
    <T, >(styleOrStyleFn: AllowedStylesT<T>) => {
      const flatStyles = [styleOrStyleFn].flat(3) as (ThemedStyle<T> | StyleProp<T>)[];
      const stylesArray = flatStyles.map((f) => {
        if (typeof f === 'function') {
          return (f as ThemedStyle<T>)(theme);
        }

        return f;

      });

      // Flatten the array of styles into a single object
      return Object.assign({}, ...stylesArray) as T;
    },
    [theme]
  );

  const themedStyles = useCallback(
    <T, >(styleOrStyleFn: ThemedStyle<T>): T => {
      return (styleOrStyleFn as ThemedStyle<T>)(theme);
    },
    [theme]
  );

  const value = {
    navigationTheme,
    theme,
    themeContext,
    themeScheme,
    setThemeContextOverride,
    themed,
    themedStyles,
    scale,
  };

  return <ThemeContext.Provider value={ value }>{ children }</ThemeContext.Provider>;
};

/**
 * This is the primary hook that you will use to access the theme context in your components.
 * Documentation: https://docs.infinite.red/ignite-cli/boilerplate/app/theme/useAppTheme.tsx/
 */
export const useAppTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useAppTheme must be used within an ThemeProvider');
  }

  return context;
};
