import ThemedText from 'Component/ThemedText';
import Clock from 'react-live-clock';
import { View } from 'react-native';

export const PlayerClockComponent = () => (
  <View>
    <Clock
      element={ ThemedText }
      ticking
    />
  </View>
);

export default PlayerClockComponent;
