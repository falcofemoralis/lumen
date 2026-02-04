import { useThemedStyles } from 'Hooks/useThemedStyles';
import { TextInput, View } from 'react-native';
import { useAppTheme } from 'Theme/context';

import { componentStyles } from './ThemedInput.style';
import { ThemedInputComponentProps } from './ThemedInput.type';

export const ThemedInputComponent = ({
  placeholder,
  onChangeText,
  style,
  containerStyle,
  editable = true,
  ...props
}: ThemedInputComponentProps) => {
  const { theme } = useAppTheme();
  const styles = useThemedStyles(componentStyles);

  return (
    <View style={ [styles.container, containerStyle] }>
      <TextInput
        placeholder={ placeholder }
        onChangeText={ onChangeText }
        style={ [ styles.input, style ] }
        placeholderTextColor={ theme.colors.text }
        selectionColor={ theme.colors.secondary }
        cursorColor={ theme.colors.secondary }
        underlineColorAndroid={ theme.colors.transparent }
        selectionHandleColor={ theme.colors.secondary }
        tvFocusable={ false }
        editable={ editable }
        { ...props }
      />
    </View>
  );
};

export default ThemedInputComponent;
