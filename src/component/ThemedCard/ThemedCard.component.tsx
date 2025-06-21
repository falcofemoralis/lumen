import { View } from 'react-native';

import { ThemedCardComponentProps } from './ThemedCard.type';

export const ThemedCardComponent = ({
  style,
  children,
}: ThemedCardComponentProps) => (
  <View style={ style }>
    { children }
  </View>
);

export default ThemedCardComponent;
