import ThemedImage from 'Component/ThemedImage';
import { useState } from 'react';
import { Dimensions, Modal, TouchableHighlight, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Colors } from 'Style/Colors';

import ImageViewer from './ImageViewer';
import { ThemedImageModalComponentProps } from './ThemedImageModal.type';

export const ThemedImageModalComponent = ({
  src,
  modalSrc,
  style,
  imageStyle,
}: ThemedImageModalComponentProps) => {
  const { width } = Dimensions.get('window');
  const height = width / (166 / 250);
  const [isOpened, setIsOpened] = useState(false);

  const handleOpen = () => setIsOpened(true);
  const handleClose = () => setIsOpened(false);

  const renderOverlay = () => {
    if (!modalSrc) {
      return null;
    }

    return (
      <Modal
        presentationStyle='fullScreen'
        animationType='fade'
        visible={ isOpened }
        onRequestClose={ handleClose }
        backdropColor={ Colors.modal }
      >
        <GestureHandlerRootView style={ { flex: 1 } }>
          <ImageViewer
            imageUrl={ modalSrc }
            width={ width }
            height={ height }
            onRequestClose={ handleClose }
          />
        </GestureHandlerRootView>
      </Modal>
    );
  };

  return (
    <View style={ style }>
      <TouchableHighlight
        onPress={ handleOpen }
      >
        <ThemedImage
          src={ src }
          style={ imageStyle }
        />
      </TouchableHighlight>
      { renderOverlay() }
    </View>
  );
};

export default ThemedImageModalComponent;
