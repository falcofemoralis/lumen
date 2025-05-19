import { useThemeColor } from 'Hooks/useThemeColor';
import { View } from 'react-native';
import Animated from 'react-native-reanimated';

import { AnimatedThemedViewProps, ThemedViewProps } from './ThemedView.type';

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
  ...rest
}: AnimatedThemedViewProps) {
  return (
    <Animated.View
      style={ style }
      { ...rest }
    />
  );
}

ThemedView.Animated = ThemedViewAnimated;

export default ThemedView;
