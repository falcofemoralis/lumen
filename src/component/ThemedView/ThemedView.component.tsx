import { useThemeColor } from 'Hooks/useThemeColor';
import { View } from 'react-native';
import Animated from 'react-native-reanimated';

import { ThemedViewProps } from './ThemedView.type';

function ThemedView({
  style,
  lightColor,
  darkColor,
  ...rest
}: ThemedViewProps) {
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');

  return (
    <View
      style={ [{ backgroundColor }, style] }
      { ...rest }
    />
  );
}

function ThemedViewAnimated({
  style,
  lightColor,
  darkColor,
  ...rest
}: ThemedViewProps) {
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');

  return (
    <Animated.View
      style={ [{ backgroundColor }, style] }
      { ...rest }
    />
  );
}

ThemedView.Animated = ThemedViewAnimated;

export default ThemedView;
