import ThemedText from 'Component/ThemedText';
import ThemedView from 'Component/ThemedView';
import { TouchableOpacity } from 'react-native';

export default function RecentScreen() {
  return (
    <ThemedView>
      <TouchableOpacity>
        <ThemedText>Recent page</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}
