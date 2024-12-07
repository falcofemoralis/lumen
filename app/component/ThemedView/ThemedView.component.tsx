import { useThemeColor } from 'Hooks/useThemeColor';
import { View } from 'react-native';
import Animated from 'react-native-reanimated';
import { ThemedViewProps } from './ThemedView.type';

export default function ThemedView({
  style,
  lightColor,
  darkColor,
  useAnimation,
  ...rest
}: ThemedViewProps) {
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');

  if (useAnimation) {
    return (
      <Animated.View
        style={[{ backgroundColor }, style]}
        {...rest}
      />
    );
  }

  return (
    <View
      style={[{ backgroundColor }, style]}
      {...rest}
    />
  );
}
