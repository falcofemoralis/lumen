import { useThemeColor } from 'Hooks/useThemeColor';
import { Text } from 'react-native';
import { ThemedTextProps } from './ThemedText.type';
import Animated from 'react-native-reanimated';

export default function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  useAnimation,
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  if (useAnimation) {
    return (
      <Animated.Text
        style={[{ color }, style]}
        {...rest}
      />
    );
  }

  return (
    <Text
      style={[{ color }, style]}
      {...rest}
    />
  );
}
