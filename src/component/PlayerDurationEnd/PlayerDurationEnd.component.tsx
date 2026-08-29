import { ThemedText } from 'Component/ThemedText';
import { useConfigContext } from 'Context/ConfigContext';
import { usePlayerProgressContext } from 'Context/PlayerProgressContext';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import { t } from 'i18n/translate';
import { formatClockTime } from 'Util/Date';

import { componentStyles } from './PlayerDurationEnd.style';

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
    <ThemedText style={ styles.durationText }>
      <ThemedText style={ styles.durationText }>
        { t('Duration end in ') }
      </ThemedText>
      <ThemedText style={ styles.durationText }>
        { endDate ? formatClockTime(endDate) : '-' }
      </ThemedText>
    </ThemedText>
  );
};

export default PlayerDurationComponent;
