import { memo } from 'react';
import { ActivityIndicator } from 'react-native';
import { useAppTheme } from 'Theme/context';

import { styles } from './Loader.style';
import { LoaderComponentProps } from './Loader.type';

export const LoaderComponent = ({
  isLoading,
  fullScreen,
}: LoaderComponentProps) => {
  const { theme } = useAppTheme();

  return (
    <ActivityIndicator
      style={ [
        fullScreen && styles.fullscreenLoader,
      ] }
      animating={ isLoading }
      size="large"
      color={ theme.colors.secondary }
    />
  );
};

export default memo(LoaderComponent);
