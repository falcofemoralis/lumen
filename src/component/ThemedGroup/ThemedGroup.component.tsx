import { View } from 'react-native';

import { ThemedGroupComponentProps } from './ThemedScrollView.type';

export const ThemedScrollViewComponent = ({
  children,
  style,
}: ThemedGroupComponentProps) => {
  return (
    <View style={ style }>
      { children }
    </View>
  );
};

export default ThemedScrollViewComponent;
