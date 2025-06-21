import { Pressable, View } from 'react-native';
import { SpatialNavigationFocusableView } from 'react-tv-space-navigation';
import { Colors } from 'Style/Colors';
import { noopFn } from 'Util/Function';

import { ThemedPressableProps } from './ThemedPressable.type';

/**
 * A themed pressable component for TV OS that can be used to add support for mouse\pointer interaction.
 * Currently not used in the app.
 */
const ThemedPressable = ({
  onPress,
  children,
  style,
  contentStyle,
  ref,
  disabled = false,
  mode = 'light',
  pressDelay = 50,
}: ThemedPressableProps) => {
  return (
    <SpatialNavigationFocusableView
      onSelect={ noopFn }
    >
      { ({ isFocused }) => (
        <View style={ [style, { overflow: 'hidden' }] }>
          <Pressable
            ref={ ref }
            onPress={ onPress }
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
      ) }
    </SpatialNavigationFocusableView>
  );
};
