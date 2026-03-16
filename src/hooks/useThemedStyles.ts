import { useMemo } from 'react';
import { useAppTheme } from 'Theme/context';
import { ThemedStyle } from 'Theme/types';

export const useThemedStyles = <T>(
  styleOrStyleFn: ThemedStyle<T>
): T => {
  const { themedStyles } = useAppTheme();

  return useMemo(() => themedStyles(styleOrStyleFn), [themedStyles, styleOrStyleFn]);
};
