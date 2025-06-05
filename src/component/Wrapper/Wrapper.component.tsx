import { View } from 'react-native';
import ConfigStore from 'Store/Config.store';
import { CONTENT_WRAPPER_PADDING, CONTENT_WRAPPER_PADDING_TV } from 'Style/Layout';

export const WrapperComponent = ({ children }: { children: React.ReactNode }) => {
  return (
    <View style={ { marginHorizontal: ConfigStore.isTV() ? CONTENT_WRAPPER_PADDING_TV : CONTENT_WRAPPER_PADDING } }>
      { children }
    </View>
  );
};

export default WrapperComponent;