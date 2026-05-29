import { ThemedOverlayRef } from 'Component/ThemedOverlay/ThemedOverlay.type';
import { RefObject } from 'react';

export interface ConfirmOverlayProps {
  overlayRef: RefObject<ThemedOverlayRef | null>;
  title: string;
  message?: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
  disableCancelButton?: boolean;
  onConfirm: () => void;
}