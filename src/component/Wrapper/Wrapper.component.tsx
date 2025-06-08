import { View } from 'react-native';
import ConfigStore from 'Store/Config.store';
import { CONTENT_WRAPPER_PADDING, CONTENT_WRAPPER_PADDING_TV } from 'Style/Layout';

import { WrapperProps } from './Wrapper.type';

export const WrapperComponent = ({
  children,
  style,
}: WrapperProps) => {
  return (
    <View
      style={ [{
        marginHorizontal: ConfigStore.isTV()
          ? CONTENT_WRAPPER_PADDING_TV
          : CONTENT_WRAPPER_PADDING,
      }, style] }
    >
      { children }
    </View>
  );
};

export default WrapperComponent;