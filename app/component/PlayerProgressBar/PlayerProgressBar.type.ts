import { Status } from 'Component/Player/Player.type';
import { Video } from 'expo-av';

export type PlayerProgressBarContainerProps = {
  status: Status;
  playerRef: React.RefObject<Video>;
  focusedElement?: string;
  setFocusedElement?: (element: string) => void;
};

export type PlayerProgressBarComponentProps = {
  status: Status;
  playerRef: React.RefObject<Video>;
  focusedElement?: string;
  setFocusedElement?: (element: string) => void;
};
