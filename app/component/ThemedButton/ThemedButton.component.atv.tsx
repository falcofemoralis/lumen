import { Text, View } from 'react-native';
import { SpatialNavigationFocusableView } from 'react-tv-space-navigation';
import { styles } from './ThemedButton.style.atv';
import { ThemedButtonProps } from './ThemedButton.type';
import ThemedIcon from 'Component/ThemedIcon';
import { scale } from 'Util/CreateStyles';

export default function ThemedButton({
  onPress,
  children,
  style,
  isSelected,
  icon,
  variant = 'filled',
}: ThemedButtonProps) {
  return (
    <SpatialNavigationFocusableView onSelect={onPress}>
      {({ isFocused }) => (
        <View
          style={[
            styles.container,
            style,
            isSelected && styles.containerSelected,
            isFocused && styles.containerFocused,
            variant === 'outlined' && {
              ...styles.containerOutlined,
              ...(isSelected && styles.containerOutlinedSelected),
              ...(isFocused && styles.containerOutlinedFocused),
            },
          ]}
        >
          {icon && (
            <ThemedIcon
              style={[
                styles.icon,
                isFocused && styles.iconFocused,
                variant === 'outlined' && {
                  ...styles.iconOutlined,
                  ...(isSelected && styles.iconOutlinedSelected),
                  ...(isFocused && styles.iconOutlinedFocused),
                },
              ]}
              icon={icon}
              size={scale(18)}
              color={isFocused ? 'black' : 'gray'}
            />
          )}
          <Text
            style={[
              styles.text,
              isFocused && styles.textFocused,
              variant === 'outlined' && {
                ...styles.textOutlined,
                ...(isSelected && styles.textOutlinedSelected),
                ...(isFocused && styles.textOutlinedFocused),
              },
            ]}
          >
            {children}
          </Text>
        </View>
      )}
    </SpatialNavigationFocusableView>
  );
}
