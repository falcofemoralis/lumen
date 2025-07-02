import ThemedText from 'Component/ThemedText';
import { usePlayerProgressContext } from 'Context/PlayerProgressContext';

export const PlayerDurationComponent = () => {
  const {
    progressStatus: {
      currentTime,
      durationTime,
      remainingTime,
    } = {},
  } = usePlayerProgressContext();

  return (
    <ThemedText>
      { `${currentTime} / ${durationTime} (${remainingTime})` }
    </ThemedText>
  );
};

export default PlayerDurationComponent;
