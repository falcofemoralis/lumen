import ThemedText from 'Component/ThemedText';
import __ from 'i18n/__';
import { View } from 'react-native';

import { styles } from './PlayerDuration.style.atv';
import { PlayerDurationComponentProps } from './PlayerDuration.type';

export const PlayerDurationComponent = ({
  progressStatus,
}: PlayerDurationComponentProps) => {
  const {
    currentTime,
    durationTime,
    remainingTime,
  } = progressStatus;

  return (
    <View style={ styles.duration }>
      <ThemedText style={ styles.durationText }>
        { __('Remaining: %s', remainingTime) }
      </ThemedText>
      <ThemedText style={ styles.durationText }>
        { `${currentTime} / ${durationTime}` }
      </ThemedText>
    </View>
  );
};

export default PlayerDurationComponent;
