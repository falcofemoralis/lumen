import { RewindDirection } from 'Component/Player/Player.config';
import { Status } from 'Component/Player/Player.type';

export interface PlayerProgressBarContainerProps {
  status: Status;
  focusedElement?: string;
  showControls: boolean;
  setFocusedElement?: (element: string) => void;
  rewindPosition: (type: RewindDirection, ms?: number) => void;
  seekToPosition: (percent: number) => void;
}

export interface PlayerProgressBarComponentProps {
  status: Status;
  focusedElement?: string;
  showControls: boolean;
  setFocusedElement?: (element: string) => void;
  rewindPosition: (type: RewindDirection, ms?: number) => void;
  seekToPosition: (percent: number) => void;
}
