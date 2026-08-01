import { TrueSheet } from '@lodev09/react-native-true-sheet';
import { StyleSheet, View } from 'react-native';
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
        <GestureHandlerRootView style={ scrollable ? styles.filled : styles.auto }>
          { children }
        </GestureHandlerRootView>
      </View>
    </TrueSheet>
  );
};

const styles = StyleSheet.create({
  // flex (not flexGrow) so the scrollable child is bounded by the sheet and can
  // actually scroll, instead of overflowing it with flexShrink 0.
  filled: { flex: 1 },
  auto: { flexGrow: 1 },
});

export default ThemedBottomSheetComponent;