import { ThemedText } from 'Component/ThemedText';
import { usePlayerProgressContext } from 'Context/PlayerProgressContext';
import Moment from 'react-moment';

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

  return (
    <ThemedText>
      { `${currentTime} / ${durationTime}${bufferedTime ? `+${bufferedTime}` : ''} (${remainingTime}) ->` }
      { endDate && (
        <Moment
          element={ ThemedText }
          format="HH:mm"
          locale="ru"
        >
          { endDate }
        </Moment>
      ) }
    </ThemedText>
  );
};

export default PlayerDurationComponent;
