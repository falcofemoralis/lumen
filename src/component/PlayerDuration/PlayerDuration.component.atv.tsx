import ThemedText from 'Component/ThemedText';
import { usePlayerProgressContext } from 'Context/PlayerProgressContext';
import t from 'i18n/t';
import { View } from 'react-native';

import { styles } from './PlayerDuration.style.atv';

export const PlayerDurationComponent = () => {
  const {
    progressStatus: {
      currentTime,
      durationTime,
      remainingTime,
    } = {},
  } = usePlayerProgressContext();

  return (
    <View style={ styles.duration }>
      <ThemedText style={ styles.durationText }>
        { t('Remaining: %s', remainingTime) }
      </ThemedText>
      <ThemedText style={ styles.durationText }>
        { `${currentTime} / ${durationTime}` }
      </ThemedText>
    </View>
  );
};

export default PlayerDurationComponent;
