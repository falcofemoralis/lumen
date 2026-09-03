import { ThemedOverlayRef } from 'Component/ThemedOverlay/ThemedOverlay.type';
import { RefObject } from 'react';

export interface PlayerCDNSelectorProps {
  overlayRef: RefObject<ThemedOverlayRef | null>;
  /** The CDN the streams are pulled from, whether or not it is picked automatically. */
  cdn: string;
  cdnOptions: string[];
  isAutomatic: boolean;
  onAutomaticChange: (value: boolean) => void;
  onChange: (value: string) => void;
  onClose?: () => void;
}
