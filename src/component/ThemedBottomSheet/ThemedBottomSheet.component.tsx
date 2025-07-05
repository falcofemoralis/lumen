import { TrueSheet } from '@lodev09/react-native-true-sheet';
import { Portal } from 'Component/ThemedPortal';
import React from 'react';
import { View } from 'react-native';
import { Colors } from 'Style/Colors';

import { ThemedBottomSheetComponentProps } from './ThemedBottomSheet.type';

export const ThemedBottomSheetComponent = ({
  ref,
  children,
  sizes = ['40%', 'large'],
  backgroundColor = Colors.backgroundLight,
  onMount,
}: ThemedBottomSheetComponentProps) => {
  return (
    <View>
      <Portal>
        <TrueSheet
          ref={ ref }
          sizes={ sizes }
          cornerRadius={ 24 }
          backgroundColor={ backgroundColor }
          onMount={ onMount }
        >
          { children }
        </TrueSheet>
      </Portal>
    </View>
  );
};

export default ThemedBottomSheetComponent;
