import { TrueSheet } from '@lodev09/react-native-true-sheet';
import { ThemedOverlayRef } from 'Component/ThemedOverlay/ThemedOverlay.type';
import { UpdateInterface } from 'Type/Update.interface';

export interface AppUpdaterComponentProps {
  update: UpdateInterface;
  isLoading: boolean;
  overlayRef: React.RefObject<ThemedOverlayRef | null>;
  bottomSheetRef: React.RefObject<TrueSheet | null>;
  progress: number;
  acceptUpdate: () => void;
  rejectUpdate: () => void;
  onBottomSheetMount: () => void;
}

export interface MetaData {
  skipUpdate: boolean;
  version: number;
}