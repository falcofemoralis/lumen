import { useThemeColor } from 'Hooks/useThemeColor';
import { View, type ViewProps } from 'react-native';
import Animated from 'react-native-reanimated';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  useAnimations?: boolean;
};

export default function ThemedView({
  style,
  lightColor,
  darkColor,
  useAnimations,
  ...otherProps
}: ThemedViewProps) {
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');

  if (useAnimations) {
    return <Animated.View style={[{ backgroundColor }, style]} {...otherProps} />;
  }

  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}
