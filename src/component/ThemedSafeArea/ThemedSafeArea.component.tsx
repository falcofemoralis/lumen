import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { styles } from './ThemedSafeArea.style';
import { ThemedSafeAreaComponentProps } from './ThemedSafeArea.type';

export const ThemedSafeAreaComponent = ({
  children,
  edges = ['top'],
  style,
}: ThemedSafeAreaComponentProps) => {
  const { top, bottom, left, right } = useSafeAreaInsets();

  return (
    <View
      style={ [
        styles.container,
        style,
        {
          paddingTop: edges.includes('top') ? top : 0,
          paddingBottom: edges.includes('bottom') ? bottom : 0,
          paddingLeft: edges.includes('left') ? left : 0,
          paddingRight: edges.includes('right') ? right : 0,
        },
      ] }
    >
      { children }
    </View>
  );
};

export default ThemedSafeAreaComponent;