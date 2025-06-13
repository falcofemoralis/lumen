import { Pressable, View } from 'react-native';
import { Colors } from 'Style/Colors';

import { ThemedPressableProps } from './ThemedPressable.type';

export const ThemedPressable = ({
  onPress,
  children,
  style,
  contentStyle,
  disabled = false,
  mode = 'light',
}: ThemedPressableProps) => {
  return (
    <View style={ [style, { overflow: 'hidden' }] }>
      <Pressable
        onPress={ onPress }
        disabled={ disabled }
        android_ripple={ {
          color: mode === 'light' ? Colors.whiteTransparent : Colors.button,
        } }
        unstable_pressDelay={ 50 }
        style={ [{
          flex: 1,
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
        }, contentStyle] }
      >
        { children }
      </Pressable>
    </View>
  );
};

export default ThemedPressable;