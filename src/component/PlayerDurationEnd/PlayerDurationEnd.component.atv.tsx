import { ThemedText } from 'Component/ThemedText';
import { useConfigContext } from 'Context/ConfigContext';
import { usePlayerProgressContext } from 'Context/PlayerProgressContext';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import { t } from 'i18n/translate';
import Moment from 'react-moment';
import { View } from 'react-native';

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
        { endDate && (
          <Moment
            element={ ThemedText }
            format="HH:mm"
            locale="ru"
            style={ styles.clockText }
          >
            { endDate }
          </Moment>
        ) }
      </View>
    </View>
  );
};

export default PlayerDurationComponent;
