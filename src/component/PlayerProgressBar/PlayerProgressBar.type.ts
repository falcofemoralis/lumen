import { RewindDirection } from 'Component/Player/Player.config';
import { Status } from 'Component/Player/Player.type';
import { Video } from 'expo-av';

export type PlayerProgressBarContainerProps = {
  status: Status;
  playerRef: React.RefObject<Video>;
  focusedElement?: string;
  setFocusedElement?: (element: string) => void;
  seekToPosition: (percent: number) => void;
  rewindPosition: (type: RewindDirection, ms?: number) => void;
  rewindPositionAuto: (type: RewindDirection, ms?: number) => void;
  toggleControls? : () => void;
};

export type PlayerProgressBarComponentProps = {
  status: Status;
  playerRef: React.RefObject<Video>;
  focusedElement?: string;
  setFocusedElement?: (element: string) => void;
  seekToPosition: (percent: number) => void;
  rewindPosition: (type: RewindDirection, ms?: number) => void;
  rewindPositionAuto: (type: RewindDirection, ms?: number) => void;
  toggleControls? : () => void;
};
