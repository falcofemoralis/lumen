import React from 'react';
import { Modal, View } from 'react-native';
import { Colors } from 'Style/Colors';

import { ThemedBottomSheetComponentProps } from './ThemedBottomSheet.type';

export const ThemedBottomSheetComponent = ({
  children,
}: ThemedBottomSheetComponentProps) => {
  return (
    <Modal
      transparent
      animationType="slide"
    >
      <View
        style={ {
          flex: 1,
          justifyContent: 'flex-end',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
        } }
      >
        <View
          style={ {
            backgroundColor: Colors.backgroundLight,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            padding: 20,
            minHeight: '40%',
            maxHeight: '80%',
          } }
        >
          { children }
        </View>
      </View>
    </Modal>
  );
};

export default ThemedBottomSheetComponent;
