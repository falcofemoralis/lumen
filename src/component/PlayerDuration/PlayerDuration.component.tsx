import ThemedText from 'Component/ThemedText';
import { usePlayerContext } from 'Context/PlayerContext';

export const PlayerDurationComponent = () => {
  const {
    progressStatus: {
      currentTime,
      durationTime,
      remainingTime,
    } = {},
  } = usePlayerContext();

  return (
    <ThemedText>
      { `${currentTime} / ${durationTime} (${remainingTime})` }
    </ThemedText>
  );
};

export default PlayerDurationComponent;
