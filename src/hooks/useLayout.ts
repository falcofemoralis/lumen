import { NAVIGATION_BAR_TV_WIDTH } from 'Component/NavigationBar/NavigationBar.style.atv';
import { useConfigContext } from 'Context/ConfigContext';
import { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';
import { useAppTheme } from 'Theme/context';

export const useLayout = (additionalWidth?: number) => {
  const { width } = useWindowDimensions();
  const { isTV } = useConfigContext();
  const { scale, theme } = useAppTheme();

  const layoutWidth = useMemo(() => {
    const navBarWidth = isTV ? scale(NAVIGATION_BAR_TV_WIDTH) : 0;
    const paddingWidth = scale(isTV ? theme.spacing.wrapperPaddingTV : theme.spacing.wrapperPadding);

    return (width - (paddingWidth * 2) - navBarWidth - (additionalWidth || 0));
  }, [width, additionalWidth, isTV, scale, theme]);

  return {
    width: layoutWidth,
  };
};
