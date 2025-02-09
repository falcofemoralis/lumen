import { StyleProp, ViewStyle } from 'react-native';

export interface PlayerStoryboardComponentProps {
  storyboardUrl: string;
  currentTime: number;
  style?: StyleProp<ViewStyle>
  scale?: number;
}
