import { Text } from 'react-native';
import Animated from 'react-native-reanimated';
import { Colors } from 'Style/Colors';

import { ThemedTextProps } from './ThemedText.type';

function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  return (
    <Text
      style={ [{ color: Colors.text }, style] }
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
  return (
    <Animated.Text
      style={ [{ color: Colors.text }, style] }
      { ...rest }
    />
  );
}

ThemedText.Animated = ThemedTextAnimated;

export default ThemedText;
