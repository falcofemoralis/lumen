import { View } from 'react-native';
import { Pressable } from 'react-native-gesture-handler';
import { Colors } from 'Style/Colors';

import { ThemedPressableProps } from './ThemedPressable.type';

export const ThemedPressable = ({
  onPress,
  onLongPress,
  children,
  style,
  contentStyle,
  ref,
  disabled = false,
  mode = 'light',
  pressDelay = 50,
  additionalElement,
}: ThemedPressableProps) => {
  return (
    <View style={ [style, { overflow: 'hidden' }] }>
      { additionalElement }
      <Pressable
        ref={ ref }
        onPress={ onPress }
        onLongPress={ onLongPress }
        disabled={ disabled }
        android_ripple={ {
          color: mode === 'light' ? Colors.whiteTransparent : Colors.button,
        } }
        unstable_pressDelay={ pressDelay }
        style={ [{
          flex: 1,
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
        }, contentStyle] }
        tvFocusable={ false }
        focusable={ false }
      >
        { children }
      </Pressable>
    </View>
  );
};

export default ThemedPressable;