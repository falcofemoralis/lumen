import { memo } from 'react';
import { ActivityIndicator } from 'react-native';
import { useAppTheme } from 'Theme/context';

import { styles } from './Loader.style';
import { LoaderComponentProps } from './Loader.type';

// `isLoading`, `size` and `color` default to the shape an icon component is
// rendered with, so this can be dropped in wherever one is expected (the player
// swaps its play/pause icon for a spinner while the video loads).
export const LoaderComponent = ({
  isLoading = true,
  fullScreen,
  style,
  backdrop,
  size = 'large',
  color,
}: LoaderComponentProps) => {
  const { theme } = useAppTheme();

  return (
    <ActivityIndicator
      style={ [
        fullScreen && styles.fullscreenLoader,
        backdrop && isLoading && { backgroundColor: theme.colors.backdrop },
        style,
      ] }
      animating={ isLoading }
      size={ size }
      color={ color ?? theme.colors.secondary }
    />
  );
};

export default memo(LoaderComponent);
