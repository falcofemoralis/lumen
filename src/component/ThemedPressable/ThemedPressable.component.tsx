import { Pressable, View } from 'react-native';
import { Colors } from 'Style/Colors';

import { ThemedPressableProps } from './ThemedPressable.type';

export const ThemedPressable = ({
  onPress,
  children,
  style,
  contentStyle,
  stateStyle,
  ref,
  disabled = false,
  mode = 'light',
}: ThemedPressableProps) => {
  return (
    <View style={ [style, { overflow: 'hidden' }] }>
      <Pressable
        ref={ ref }
        onPress={ onPress }
        disabled={ disabled }
        android_ripple={ {
          color: mode === 'light' ? Colors.whiteTransparent : Colors.button,
        } }
        unstable_pressDelay={ 50 }
        style={ stateStyle ? stateStyle : [{
          flex: 1,
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
        }, contentStyle] }
        tvFocusable
      >
        { children }
      </Pressable>
    </View>
  );
};

export default ThemedPressable;