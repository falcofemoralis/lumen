import { useThemeColor } from 'Hooks/useThemeColor';
import { Text } from 'react-native';
import Animated from 'react-native-reanimated';

import { ThemedTextProps } from './ThemedText.type';

function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  return (
    <Text
      style={ [{ color }, style] }
      { ...rest }
    />
  );
}

function ThemedTextAnimated({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  return (
    <Animated.Text
      style={ [{ color }, style] }
      { ...rest }
    />
  );
}

ThemedText.Animated = ThemedTextAnimated;

export default ThemedText;
