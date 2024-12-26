import ThemedIcon from 'Component/ThemedIcon';
import { Text, View } from 'react-native';
import { SpatialNavigationFocusableView } from 'react-tv-space-navigation';
import { scale } from 'Util/CreateStyles';

import { styles } from './ThemedButton.style.atv';
import { ThemedButtonProps } from './ThemedButton.type';

export default function ThemedButton({
  onPress,
  onFocus,
  children,
  style,
  isSelected,
  icon,
  variant = 'filled',
}: ThemedButtonProps) {
  return (
    <SpatialNavigationFocusableView
      onSelect={ onPress }
      onFocus={ onFocus }
    >
      { ({ isFocused, isActive }) => (
        <View
          style={ [
            styles.container,
            style,
            isSelected && styles.containerSelected,
            isFocused && styles.containerFocused,
            variant === 'outlined' && {
              ...styles.containerOutlined,
              ...(isSelected && isActive && styles.containerOutlinedSelected),
              ...(isFocused && styles.containerOutlinedFocused),
            },
          ] }
        >
          { icon && (
            <ThemedIcon
              style={ [
                styles.icon,
                isFocused && styles.iconFocused,
                variant === 'outlined' && {
                  ...styles.iconOutlined,
                  ...(isSelected && isActive && styles.iconOutlinedSelected),
                  ...(isFocused && styles.iconOutlinedFocused),
                },
              ] }
              icon={ icon }
              size={ scale(18) }
              color={ isFocused ? 'black' : 'gray' }
            />
          ) }
          <Text
            style={ [
              styles.text,
              isFocused && styles.textFocused,
              variant === 'outlined' && {
                ...styles.textOutlined,
                ...(isSelected && isActive && styles.textOutlinedSelected),
                ...(isFocused && styles.textOutlinedFocused),
              },
            ] }
          >
            { children }
          </Text>
        </View>
      ) }
    </SpatialNavigationFocusableView>
  );
}
