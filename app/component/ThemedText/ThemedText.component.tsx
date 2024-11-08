import { useThemeColor } from 'Hooks/useThemeColor';
import { Text } from 'react-native';
import { ThemedTextProps } from './ThemedText.type';

export default function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  return (
    <Text
      style={[{ color }, style]}
      {...rest}
    />
  );
}
