import { ThemedText } from 'Component/ThemedText';
import { useConfigContext } from 'Context/ConfigContext';
import { usePlayerProgressContext } from 'Context/PlayerProgressContext';
import { useThemedStyles } from 'Hooks/useThemedStyles';

import { componentStyles } from './PlayerDuration.style';

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
    let base = `${currentTime} / ${durationTime}`;

    if (playerShowBufferTime && bufferedTime && bufferedTime !== '0') {
      base = base.concat(`+${bufferedTime}`);
    }

    base = base.concat(` (${remainingTime})`);

    return base;
  };

  return (
    <ThemedText style={ styles.durationText }>
      { getRenderedTime() }
    </ThemedText>
  );
};

export default PlayerDurationComponent;
