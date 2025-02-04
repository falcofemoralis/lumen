import { VideoPlayer } from 'expo-video';
import { StyleProp, ViewStyle } from 'react-native';

export interface PlayerSubtitlesComponentProps {
  subtitleUrl: string;
  player: VideoPlayer;
  style?: StyleProp<ViewStyle>
}
