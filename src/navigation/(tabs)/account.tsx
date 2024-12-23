import ThemedText from 'Component/ThemedText';
import ThemedView from 'Component/ThemedView';
import { TouchableOpacity } from 'react-native';

export default function AccountScreen() {
  return (
    <ThemedView>
      <TouchableOpacity>
        <ThemedText>Account page</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}
