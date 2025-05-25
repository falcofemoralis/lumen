import { DimensionValue, Pressable, View } from 'react-native';
import { Colors } from 'Style/Colors';

import { ThemedPressableProps } from './ThemedPressable.type';

export const ThemedPressable = ({
  onPress,
  children,
  style,
  disabled = false,
  mode = 'light',
}: ThemedPressableProps) => {
  let padding: DimensionValue | undefined = 0;

  if (Array.isArray(style) && style.length > 0) {
    style.forEach((s) => {
      if (typeof s === 'object' && s && 'padding' in s) {
        padding = s.padding;
      }
    });
  } else if (style && typeof style === 'object' && 'padding' in style) {
    padding = style.padding;
  }

  return (
    <View style={ [style, { padding: 0, overflow: 'hidden' }] }>
      <Pressable
        onPress={ onPress }
        disabled={ disabled }
        android_ripple={ {
          color: mode === 'light' ? Colors.whiteTransparent : Colors.button,
        } }
        style={ [{
          flex: 1,
          padding,
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
        }] }
      >
        { children }
      </Pressable>
    </View>
  );
};

export default ThemedPressable;