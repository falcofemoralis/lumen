import { TrueSheet } from '@lodev09/react-native-true-sheet';
import { Portal } from 'Component/ThemedPortal';
import { View } from 'react-native';
import { useAppTheme } from 'Theme/context';

import { ThemedBottomSheetComponentProps } from './ThemedBottomSheet.type';

export const ThemedBottomSheetComponent = ({
  ref,
  children,
  detents = [0.4, 'auto'],
  backgroundColor,
}: ThemedBottomSheetComponentProps) => {
  const { theme, scale } = useAppTheme();

  return (
    <View>
      <Portal>
        <TrueSheet
          ref={ ref }
          detents={ detents }
          cornerRadius={ 24 }
          backgroundColor={ backgroundColor ?? theme.colors.backgroundLight }
        >
          <View style={ { paddingTop: scale(32), paddingBottom: scale(8) } }>
            { children }
          </View>
        </TrueSheet>
      </Portal>
    </View>
  );
};

export default ThemedBottomSheetComponent;
