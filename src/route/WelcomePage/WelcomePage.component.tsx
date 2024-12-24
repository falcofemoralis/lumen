import ThemedText from 'Component/ThemedText';
import ThemedView from 'Component/ThemedView';
import { TouchableOpacity } from 'react-native';

import { WelcomePageComponentProps } from './WelcomePage.type';

export function WelcomePageComponent({
  handleSelectTV,
  handleSelectMobile,
}: WelcomePageComponentProps) {
  return (
    <ThemedView>
      <ThemedText>Welcome!!!</ThemedText>
      <TouchableOpacity onPress={ handleSelectTV }>
        <ThemedText>TV</ThemedText>
      </TouchableOpacity>
      <ThemedText>-------------</ThemedText>
      <TouchableOpacity onPress={ handleSelectMobile }>
        <ThemedText>Mobile</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

export default WelcomePageComponent;
