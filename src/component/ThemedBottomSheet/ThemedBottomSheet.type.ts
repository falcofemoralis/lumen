import { TrueSheet, TrueSheetProps } from '@lodev09/react-native-true-sheet';
import { ReactNode, Ref } from 'react';

export type ThemedBottomSheetRef = TrueSheet;

export interface ThemedBottomSheetProps extends TrueSheetProps {
  ref: Ref<ThemedBottomSheetRef> | null;
  children: ReactNode;
}