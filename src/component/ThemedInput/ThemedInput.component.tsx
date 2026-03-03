import { ThemedPressable } from 'Component/ThemedPressable';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import { Eye, EyeOff } from 'lucide-react-native';
import { useState } from 'react';
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
  secureTextEntry = false,
  ...props
}: ThemedInputComponentProps) => {
  const { theme } = useAppTheme();
  const styles = useThemedStyles(componentStyles);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const renderSecureIcon = () => {
    if (!secureTextEntry) {
      return null;
    }

    return (
      <ThemedPressable
        style={ styles.secureIcon }
        onPress={ () => setIsPasswordVisible(!isPasswordVisible) }
      >
        { isPasswordVisible ? (
          <EyeOff
            color={ theme.colors.icon }
          />
        ) : (
          <Eye
            color={ theme.colors.icon }
          />
        ) }
      </ThemedPressable>
    );
  };

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
        secureTextEntry={ secureTextEntry ? !isPasswordVisible : false }
        { ...props }
      />
      { renderSecureIcon() }
    </View>
  );
};

export default ThemedInputComponent;
