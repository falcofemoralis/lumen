import { View } from 'react-native';

import { styles } from './ThemedCard.style';
import { ThemedCardComponentProps } from './ThemedCard.type';

export const ThemedCardComponent = ({
  style,
  children,
}: ThemedCardComponentProps) => (
  <View style={ [styles.card, style] }>
    { children }
  </View>
);

export default ThemedCardComponent;
