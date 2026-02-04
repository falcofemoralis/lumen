import { ThemedText } from 'Component/ThemedText';
import { usePlayerProgressContext } from 'Context/PlayerProgressContext';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import { t } from 'i18n/translate';
import { View } from 'react-native';

import { componentStyles } from './PlayerDuration.style.atv';

export const PlayerDurationComponent = () => {
  const {
    progressStatus: {
      currentTime,
      durationTime,
      remainingTime,
    } = {},
  } = usePlayerProgressContext();
  const styles = useThemedStyles(componentStyles);

  return (
    <View style={ styles.duration }>
      <ThemedText style={ styles.durationText }>
        { t('Remaining: {{remaining}}', { remaining: remainingTime } ) }
      </ThemedText>
      <ThemedText style={ styles.durationText }>
        { `${currentTime} / ${durationTime}` }
      </ThemedText>
    </View>
  );
};

export default PlayerDurationComponent;
