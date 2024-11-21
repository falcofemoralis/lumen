import ThemedText from 'Component/ThemedText';
import ThemedView from 'Component/ThemedView';
import { TouchableOpacity } from 'react-native';

export default function SettingsScreen() {
  return (
    <ThemedView>
      <TouchableOpacity>
        <ThemedText>Settings page</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}
