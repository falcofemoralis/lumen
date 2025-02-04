import ThemedText from 'Component/ThemedText';

import { PlayerDurationComponentProps } from './PlayerDuration.type';

export const PlayerDurationComponent = ({
  progressStatus,
}: PlayerDurationComponentProps) => {
  const { currentTime, durationTime, remainingTime } = progressStatus;

  return (
    <ThemedText>
      { `${currentTime} / ${durationTime} (${remainingTime})` }
    </ThemedText>
  );
};

export default PlayerDurationComponent;
