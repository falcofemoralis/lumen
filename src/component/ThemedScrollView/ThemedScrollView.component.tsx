import { View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

import { ThemedScrollViewComponentProps } from './ThemedScrollView.type';

export const ThemedScrollViewComponent = ({
  children,
  horizontal,
  style,
  containerStyle,
  contentContainerStyle,
}: ThemedScrollViewComponentProps) => {
  return (
    <ScrollView
      horizontal={ horizontal }
      style={ containerStyle }
      contentContainerStyle={ contentContainerStyle }
      showsHorizontalScrollIndicator={ false }
      showsVerticalScrollIndicator={ false }
    >
      <View style={ [{ flexDirection: horizontal ? 'row' : 'column' }, style] }>
        { children }
      </View>
    </ScrollView>
  );
};

export default ThemedScrollViewComponent;