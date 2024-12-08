import { Text, View } from 'react-native';
import { SpatialNavigationFocusableView } from 'react-tv-space-navigation';
import { styles } from './ThemedButton.style';
import { ThemedButtonProps } from './ThemedButton.type';

export default function ThemedButton({ onPress, label, style, selected }: ThemedButtonProps) {
  return (
    <SpatialNavigationFocusableView onSelect={onPress}>
      {({ isFocused, isRootActive }) => (
        <View
          style={[
            styles.container,
            style,
            selected && styles.containerSelected,
            isFocused && isRootActive && styles.containerFocused,
          ]}
        >
          <Text style={[styles.text, isFocused && isRootActive && styles.textFocused]}>
            {label}
          </Text>
        </View>
      )}
    </SpatialNavigationFocusableView>
  );
}
