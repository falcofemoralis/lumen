import { ThemedText } from 'Component/ThemedText';
import { useConfigContext } from 'Context/ConfigContext';
import { usePlayerProgressContext } from 'Context/PlayerProgressContext';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import { t } from 'i18n/translate';
import { View } from 'react-native';
import { formatClockTime } from 'Util/Date';

import { componentStyles } from './PlayerDurationEnd.style.atv';

export const PlayerDurationComponent = () => {
  const {
    progressStatus: { endDate } = {},
  } = usePlayerProgressContext();
  const styles = useThemedStyles(componentStyles);
  const { playerShowEndTime } = useConfigContext();

  if (!playerShowEndTime) {
    return null;
  }

  return (
    <View style={ styles.duration }>
      <View style={ styles.remainingWrapper }>
        <ThemedText style={ styles.durationText }>
          { t('Duration end in ') }
        </ThemedText>
        <ThemedText style={ styles.clockText }>
          { endDate ? formatClockTime(endDate) : '-' }
        </ThemedText>
      </View>
    </View>
  );
};

export default PlayerDurationComponent;
