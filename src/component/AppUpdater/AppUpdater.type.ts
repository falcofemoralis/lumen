import { TrueSheet } from '@lodev09/react-native-true-sheet';
import { UpdateInterface } from 'Type/Update.interface';

export interface AppUpdaterComponentProps {
  update: UpdateInterface;
  isLoading: boolean;
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