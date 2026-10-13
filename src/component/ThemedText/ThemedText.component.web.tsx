import { Text } from 'react-native';
import { useAppTheme } from 'Theme/context';
import { ThemedTextProps } from './ThemedText.type';

export default function ThemedText({ style, ...props }: ThemedTextProps) {
  const { theme, scale } = useAppTheme();
  return <Text { ...{ dataSet: { lumenSelectable: true } } }
    style={ [{ color: theme.colors.text, fontSize: scale(theme.text.xs.fontSize) }, style] } { ...props } />;
}