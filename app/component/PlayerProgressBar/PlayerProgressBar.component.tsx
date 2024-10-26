import Slider from '@react-native-community/slider';
import { DimensionValue, View } from 'react-native';
import { styles } from './PlayerProgressBar.style';
import { PlayerProgressBarComponentProps } from './PlayerProgressBar.type';

export function PlayerProgressBarComponent(props: PlayerProgressBarComponentProps) {
  const { status: { progressPercentage, playablePercentage } = {}, seekToPosition } = props;

  const onProgressChange = (value: number) => {
    seekToPosition(value);
  };

  return (
    <View style={styles.container}>
      <Slider
        style={styles.progressBar}
        value={progressPercentage}
        minimumValue={0}
        maximumValue={100}
        minimumTrackTintColor="#FFFF00"
        maximumTrackTintColor="#ffffff00"
        onSlidingComplete={onProgressChange}
      />
      <View
        style={{
          ...styles.playableBar,
          width: (playablePercentage + '%') as DimensionValue,
        }}
      />
    </View>
  );
}

export default PlayerProgressBarComponent;
