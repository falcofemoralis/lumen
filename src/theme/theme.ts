import { colors as colorsLight } from './colors';
import { colors as colorsDark } from './colorsDark';
import { spacing } from './spacing';
import { text } from './text';
import type { Theme } from './types';

// Here we define our themes.
export const lightTheme: Omit<Theme, 'scale' | 'dimensions'> = {
  colors: colorsLight,
  spacing,
  text,
  isDark: false,
};
export const darkTheme: Omit<Theme, 'scale' | 'dimensions'> = {
  colors: colorsDark,
  spacing,
  text,
  isDark: true,
};
