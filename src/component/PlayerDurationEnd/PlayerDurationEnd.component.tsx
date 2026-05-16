import { ThemedText } from 'Component/ThemedText';
import { useConfigContext } from 'Context/ConfigContext';
import { usePlayerProgressContext } from 'Context/PlayerProgressContext';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import { t } from 'i18n/translate';
import Moment from 'react-moment';

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
      { endDate ? (
        <Moment
          element={ ThemedText }
          format="HH:mm"
          locale="ru"
          style={ styles.durationText }
        >
          { endDate }
        </Moment>
      ) : <ThemedText style={ styles.durationText }>-</ThemedText> }
    </ThemedText>
  );
};

export default PlayerDurationComponent;
