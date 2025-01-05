import { ActivityIndicator } from 'react-native-paper';
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

export default LoaderComponent;
