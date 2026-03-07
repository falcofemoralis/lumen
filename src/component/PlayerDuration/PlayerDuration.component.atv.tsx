import { ThemedText } from 'Component/ThemedText';
import { useConfigContext } from 'Context/ConfigContext';
import { usePlayerProgressContext } from 'Context/PlayerProgressContext';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import { t } from 'i18n/translate';
import Moment from 'react-moment';
import { View } from 'react-native';
import { useAppTheme } from 'Theme/context';

import { componentStyles } from './PlayerDuration.style.atv';

export const PlayerDurationComponent = () => {
  const {
    progressStatus: {
      currentTime,
      durationTime,
      remainingTime,
      bufferedTime,
      endDate,
    } = {},
  } = usePlayerProgressContext();
  const styles = useThemedStyles(componentStyles);
  const { theme, scale } = useAppTheme();
  const { playerShowBufferTime, playerShowEndTime } = useConfigContext();

  const getRenderedTime = () => {
    let base = `${currentTime} / ${durationTime}`;

    if (playerShowBufferTime && bufferedTime && bufferedTime !== '0') {
      base = base.concat(`+${bufferedTime}`);
    }

    return base;
  };

  const remainingTimeText = () => {
    let base = remainingTime ?? '';

    if (playerShowEndTime && endDate) {
      base = base.concat(' > ');
    }

    return base;
  };

  return (
    <View style={ styles.duration }>
      <View style={ styles.remainingWrapper }>
        <ThemedText style={ styles.durationText }>
          { t('Remaining: {{remaining}}', { remaining: remainingTimeText() } ) }
        </ThemedText>
        { playerShowEndTime && endDate && (
          <Moment
            element={ ThemedText }
            format="HH:mm"
            locale="ru"
            style={ { color: theme.colors.textOnContrast, fontSize: scale(16) } }
          >
            { endDate }
          </Moment>
        ) }
      </View>
      <ThemedText style={ styles.durationText }>
        { getRenderedTime() }
      </ThemedText>
    </View>
  );
};

export default PlayerDurationComponent;
