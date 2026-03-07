import { ThemedText } from 'Component/ThemedText';
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

  return (
    <ThemedText style={ { color: theme.colors.textOnContrast } }>
      { `${currentTime} / ${durationTime}${bufferedTime ? `+${bufferedTime}` : ''} (${remainingTime}) ->` }
      { endDate && (
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
