import { TrueSheet } from '@lodev09/react-native-true-sheet';

export type ThemedBottomSheetRef =TrueSheet;

export interface ThemedBottomSheetComponentProps {
  ref: React.Ref<ThemedBottomSheetRef>
  children: React.ReactNode;
}
