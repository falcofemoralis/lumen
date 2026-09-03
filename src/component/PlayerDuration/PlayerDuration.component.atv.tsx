import { ThemedText } from 'Component/ThemedText';
import { useConfigContext } from 'Context/ConfigContext';
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
      bufferedTime,
    } = {},
  } = usePlayerProgressContext();
  const styles = useThemedStyles(componentStyles);
  const { playerShowBufferTime } = useConfigContext();

  const getRenderedTime = () => {
    const showBuffer = playerShowBufferTime && bufferedTime && bufferedTime !== '0';
    const current = showBuffer ? `${currentTime}+${bufferedTime}` : `${currentTime}`;

    return `${current} / ${durationTime}`;
  };

  return (
    <View style={ styles.duration }>
      <View style={ styles.remainingWrapper }>
        <ThemedText style={ styles.durationText }>
          { t('Remaining: {{remaining}}', { remaining: remainingTime ?? '' } ) }
        </ThemedText>
      </View>
      <ThemedText style={ styles.durationText }>
        { getRenderedTime() }
      </ThemedText>
    </View>
  );
};

export default PlayerDurationComponent;
