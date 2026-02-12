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
  onMount,
}: ThemedBottomSheetComponentProps) => {
  const { theme } = useAppTheme();

  return (
    <View>
      <Portal>
        <TrueSheet
          ref={ ref }
          detents={ detents }
          cornerRadius={ 24 }
          backgroundColor={ backgroundColor ?? theme.colors.backgroundLight }
          onMount={ onMount }
        >
          { children }
        </TrueSheet>
      </Portal>
    </View>
  );
};

export default ThemedBottomSheetComponent;
