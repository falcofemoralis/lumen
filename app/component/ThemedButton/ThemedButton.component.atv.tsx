import { Text, View } from 'react-native';
import { SpatialNavigationFocusableView } from 'react-tv-space-navigation';
import { styles } from './ThemedButton.style.atv';
import { ThemedButtonProps } from './ThemedButton.type';

export default function ThemedButton({ onPress, children, style, isSelected }: ThemedButtonProps) {
  return (
    <SpatialNavigationFocusableView onSelect={onPress}>
      {({ isFocused, isRootActive }) => (
        <View
          style={[
            styles.container,
            style,
            isSelected && styles.containerSelected,
            isFocused && isRootActive && styles.containerFocused,
          ]}
        >
          <Text style={[styles.text, isFocused && isRootActive && styles.textFocused]}>
            {children}
          </Text>
        </View>
      )}
    </SpatialNavigationFocusableView>
  );
}
