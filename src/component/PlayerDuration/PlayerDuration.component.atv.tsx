import ThemedText from 'Component/ThemedText';
import t from 'i18n/t';
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
        { t('Remaining: %s', remainingTime) }
      </ThemedText>
      <ThemedText style={ styles.durationText }>
        { `${currentTime} / ${durationTime}` }
      </ThemedText>
    </View>
  );
};

export default PlayerDurationComponent;
