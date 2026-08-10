import { useFocusable } from '@noriginmedia/norigin-spatial-navigation-react-native-tvos';
import { ThemedFocusableNodeState } from 'Component/ThemedPressable/ThemedPressable.type';
import { useDefaultFocus } from 'Hooks/useDefaultFocus';
import {
  ReactElement,
  ReactNode,
} from 'react';
import {
  Pressable,
  StyleProp,
  View,
  ViewStyle,
} from 'react-native';
import { useAppTheme } from 'Theme/context';
import { ThemedStyles } from 'Theme/types';

import { componentStyles } from '../WelcomeScreen.style';

export const SlidePressable = ({
  style,
  contentStyle,
  children,
  styles,
  autofocus = false,
  onPress,
  onFocus,
  focusKey: propFocusKey,
}: {
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  children?: ReactNode | ((props: ThemedFocusableNodeState) => ReactElement);
  styles: ThemedStyles<typeof componentStyles>;
  autofocus?: boolean;
  onPress?: () => void;
  onFocus?: () => void;
  focusKey?: string;
}) => {
  const { theme } = useAppTheme();
  const { ref, focusKey, focused } = useFocusable({
    focusKey: propFocusKey,
    onEnterPress: onPress,
    onFocus,
  });

  useDefaultFocus(focusKey, autofocus);

  return (
    <View style={ [style, { overflow: 'hidden' }] }>
      <Pressable
        ref={ ref }
        onPress={ onPress }
        android_ripple={ {
          color: theme.colors.pressableHighlight,
          foreground: true,
        } }
        unstable_pressDelay={ 0 }
        style={ [{
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
        }, contentStyle, focused && styles.TVfocused] }
        tvFocusable={ false }
        focusable={ false }
      >
        { typeof children === 'function' ? children({ isFocused: focused }) : children }
      </Pressable>
    </View>
  );
};