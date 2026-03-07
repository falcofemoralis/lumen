import { ThemedText } from 'Component/ThemedText';
import { useConfigContext } from 'Context/ConfigContext';
import { usePlayerProgressContext } from 'Context/PlayerProgressContext';
import Moment from 'react-moment';
import { useAppTheme } from 'Theme/context';

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
  const { theme } = useAppTheme();
  const { playerShowBufferTime, playerShowEndTime } = useConfigContext();

  const getRenderedTime = () => {
    let base = `${currentTime} / ${durationTime}`;

    if (playerShowBufferTime && bufferedTime && bufferedTime !== '0') {
      base = base.concat(`+${bufferedTime}`);
    }

    base = base.concat(` (${remainingTime})`);

    if (playerShowEndTime && endDate) {
      base = base.concat(' > ');
    }

    return base;
  };

  return (
    <ThemedText style={ { color: theme.colors.textOnContrast } }>
      { getRenderedTime() }
      { playerShowEndTime && endDate && (
        <Moment
          element={ ThemedText }
          format="HH:mm"
          locale="ru"
          style={ { color: theme.colors.textOnContrast } }
        >
          { endDate }
        </Moment>
      ) }
    </ThemedText>
  );
};

export default PlayerDurationComponent;
