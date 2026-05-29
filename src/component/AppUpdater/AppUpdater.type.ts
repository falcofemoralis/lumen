import { TrueSheet } from '@lodev09/react-native-true-sheet';
import { ThemedOverlayRef } from 'Component/ThemedOverlay/ThemedOverlay.type';
import { RefObject } from 'react';
import { UpdateInterface } from 'Type/Update.interface';

export interface AppUpdaterContainerProps {
  position: 'root' | 'page';
}

export interface AppUpdaterComponentProps {
  update: UpdateInterface;
  isLoading: boolean;
  overlayRef: RefObject<ThemedOverlayRef | null>;
  bottomSheetRef: RefObject<TrueSheet | null>;
  progress: number;
  acceptUpdate: () => void;
  rejectUpdate: () => void;
}

export interface MetaData {
  skipUpdate: boolean;
  version: number;
}