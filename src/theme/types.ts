import type { ImageStyle, StyleProp, TextStyle, ViewStyle } from 'react-native';

import { colors as colorsLight } from './colors';
import { colors as colorsDark } from './colorsDark';
import { spacing } from './spacing';
import { text } from './text';

// This supports "light" and "dark" themes by default. If undefined, it'll use the system theme
export type ImmutableThemeContextModeT = 'light' | 'dark'
export type ThemeContextModeT = ImmutableThemeContextModeT | undefined

// Because we have two themes, we need to define the types for each of them.
// colorsLight and colorsDark should have the same keys, but different values.
export type Colors = typeof colorsLight | typeof colorsDark
// The spacing type needs to take into account the different spacing values for light and dark themes.
export type Spacing = typeof spacing;

// These two are consistent across themes.
export type Text = typeof text;

// The overall Theme object should contain all of the data you need to style your app.
export interface Theme {
  colors: Colors
  spacing: Spacing
  text: Text
  isDark: boolean
  scale: (number: number) => number
  dimensions: { width: number; height: number }
}

/**
 * Represents a function that returns a styled component based on the provided theme.
 * @template T The type of the style.
 * @param theme The theme object.
 * @returns The styled component.
 *
 * @example
 * const $container: ThemedStyle<ViewStyle> = (theme) => ({
 *   flex: 1,
 *   backgroundColor: theme.colors.background,
 *   justifyContent: "center",
 *   alignItems: "center",
 * })
 * // Then use in a component like so:
 * const Component = () => {
 *   const { themed } = useAppTheme()
 *   return <View style={themed($container)} />
 * }
 */
export type ThemedStyle<T> = (theme: Theme) => T
export type ThemedStyleArray<T> = (
  | ThemedStyle<T>
  | StyleProp<T>
  | (StyleProp<T> | ThemedStyle<T>)[]
)[]

/**
 */
export type AllowedStylesT<T> = ThemedStyle<T> | StyleProp<T> | ThemedStyleArray<T>
/**
 */
export type ThemedFnT = <T>(styleOrStyleFn: AllowedStylesT<T>) => T

export type ExtendedViewStyle = ViewStyle & {
  transitionProperty?: string | string[];
  transitionDuration?: string;
  transitionTimingFunction?: string;
}
export type StyleValue = ExtendedViewStyle | TextStyle | ImageStyle;
export type ThemedStylesObject = Record<string, StyleValue>;
export type ThemedStylesFunction<T = any> = (theme: Theme) => T;
export type ThemedStyles<T = ThemedStylesObject> = T extends (...args: any[]) => any ? ReturnType<T> : T;