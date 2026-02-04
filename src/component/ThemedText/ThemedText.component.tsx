import { Text } from 'react-native';
import { useAppTheme } from 'Theme/context';

import { ThemedTextProps } from './ThemedText.type';

const ThemedText = ({
  style,
  ...props
}: ThemedTextProps) => {
  const { theme, scale } = useAppTheme();

  return (
    <Text
      style={ [{ color: theme.colors.text, fontSize: scale(theme.text.xs.fontSize) }, style] }
      { ...props }
    />
  );
};

export default ThemedText;
