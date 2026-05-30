import { SheetDetent, TrueSheet } from '@lodev09/react-native-true-sheet';
import { ReactNode, Ref } from 'react';

export type ThemedBottomSheetRef = TrueSheet;

export interface ThemedBottomSheetComponentProps {
  ref: Ref<ThemedBottomSheetRef>
  children: ReactNode;
  detents?: SheetDetent[];
  backgroundColor?: string;
}
