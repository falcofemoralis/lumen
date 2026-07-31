import { TrueSheet } from '@lodev09/react-native-true-sheet';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useAppTheme } from 'Theme/context';

import { ThemedBottomSheetProps } from './ThemedBottomSheet.type';

export const ThemedBottomSheetComponent = ({
  ref,
  children,
  scrollable,
  ...props
}: ThemedBottomSheetProps) => {
  const { theme, scale } = useAppTheme();

  return (
    <TrueSheet
      ref={ ref }
      cornerRadius={ scale(24) }
      backgroundColor={ theme.colors.backgroundLight }
      scrollable={ scrollable }
      { ...props }
    >
      { /* TrueSheet only stretches its content view when scrollable, so match it here. */ }
      <View
        style={ [
          { paddingTop: scale(32), paddingBottom: scale(8) },
          scrollable && { flex: 1 },
        ] }
      >
        <GestureHandlerRootView style={ { flexGrow: 1 } }>
          { children }
        </GestureHandlerRootView>
      </View>
    </TrueSheet>
  );
};

export default ThemedBottomSheetComponent;