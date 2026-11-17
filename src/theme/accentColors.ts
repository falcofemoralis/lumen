import { ImmutableThemeContextModeT } from './types';

export type AccentColor = 'default' | 'blue' | 'green' | 'purple' | 'orange' | 'red' | (string & {});

export const ACCENT_COLOR_OPTIONS: AccentColor[] = [
  'default',
  'blue',
  'green',
  'purple',
  'orange',
  'red',
];

const accentColors: Record<string, Record<ImmutableThemeContextModeT, string>> = {
  default: {
    light: '#4A9DD9',
    dark: '#004A77',
  },
  blue: {
    light: '#2196F3',
    dark: '#42A5F5',
  },
  green: {
    light: '#2E7D32',
    dark: '#66BB6A',
  },
  purple: {
    light: '#7B1FA2',
    dark: '#AB47BC',
  },
  orange: {
    light: '#EF6C00',
    dark: '#FFA726',
  },
  red: {
    light: '#C62828',
    dark: '#EF5350',
  },
};

export const normalizeAccentColor = (value: string): string | undefined => {
  const normalized = value.trim();

  if (!/^#(?:[0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(normalized)) {
    return undefined;
  }

  if (normalized.length === 4) {
    return (`#${normalized[1]}${normalized[1]}${normalized[2]}${normalized[2]}${normalized[3]}${normalized[3]}`).toUpperCase();
  }

  return normalized.toUpperCase();
};

export const getAccentColor = (
  accentColor: AccentColor,
  themeContext: ImmutableThemeContextModeT,
) => accentColors[accentColor]?.[themeContext] ?? accentColor;