import { Text, View } from 'react-native';
import { SpatialNavigationNode } from 'react-tv-space-navigation';
import { styles } from './ThemedButton.style';
import { ThemedButtonProps } from './ThemedButton.type';

export default function ThemedButton({ onPress, label }: ThemedButtonProps) {
  return (
    <SpatialNavigationNode
      onSelect={onPress}
      isFocusable
    >
      {({ isFocused, isRootActive }) => (
        <View style={[styles.container, isFocused && isRootActive && styles.containerFocused]}>
          <Text style={[styles.text, isFocused && isRootActive && styles.textFocused]}>
            {label}
          </Text>
        </View>
      )}
    </SpatialNavigationNode>
  );
}
