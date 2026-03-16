import { ThemedOverlayRef } from 'Component/ThemedOverlay/ThemedOverlay.type';

export interface ConfirmOverlayProps {
  overlayRef: React.RefObject<ThemedOverlayRef | null>;
  title: string;
  message?: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
  onConfirm: () => void;
}