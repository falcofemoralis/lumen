import { TextInput, View } from 'react-native';
import { Colors } from 'Style/Colors';

import { styles } from './ThemedInput.style';
import { ThemedInputComponentProps } from './ThemedInput.type';

export const ThemedInputComponent = ({
  placeholder,
  onChangeText,
  style,
  containerStyle,
  ...props
}: ThemedInputComponentProps) => {
  return (
    <View style={ [styles.container, containerStyle] }>
      <TextInput
        placeholder={ placeholder }
        onChangeText={ onChangeText }
        style={ [ styles.input, style ] }
        placeholderTextColor={ Colors.text }
        selectionColor={ Colors.secondary }
        cursorColor={ Colors.secondary }
        underlineColorAndroid={ Colors.transparent }
        selectionHandleColor={ Colors.secondary }
        tvFocusable={ false }
        focusable={ false }
        { ...props }
      />
    </View>
  );
};

export default ThemedInputComponent;
