import { memo } from 'react';
import { ActivityIndicator } from 'react-native';
import Colors from 'Style/Colors';

import { styles } from './Loader.style';
import { LoaderComponentProps } from './Loader.type';

export const LoaderComponent = ({
  isLoading,
  fullScreen,
}: LoaderComponentProps) => (
  <ActivityIndicator
    style={ [
      styles.loader,
      fullScreen && styles.fullscreenLoader,
    ] }
    animating={ isLoading }
    size="large"
    color={ Colors.primary }
  />
);

export default memo(LoaderComponent);
