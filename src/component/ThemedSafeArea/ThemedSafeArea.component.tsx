import { SafeAreaView } from 'react-native-safe-area-context';

import { styles } from './ThemedSafeArea.style';
import { ThemedSafeAreaComponentProps } from './ThemedSafeArea.type';

export const ThemedSafeAreaComponent = ({
  children,
  edges = ['top'],
  style,
}: ThemedSafeAreaComponentProps) => {
  return (
    <SafeAreaView edges={ edges } style={ [styles.container, style] }>
      { children }
    </SafeAreaView>
  );
};

export default ThemedSafeAreaComponent;