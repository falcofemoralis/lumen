import { ThemedImage } from 'Component/ThemedImage';
import { useState } from 'react';
import { Modal, TouchableHighlight, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useAppTheme } from 'Theme/context';

import ImageViewer from './ImageViewer';
import { ThemedImageModalComponentProps } from './ThemedImageModal.type';

export const ThemedImageModalComponent = ({
  src,
  modalSrc,
  style,
  imageStyle,
}: ThemedImageModalComponentProps) => {
  const { theme } = useAppTheme();
  const height = theme.dimensions.width / (166 / 250);
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
        backdropColor={ theme.colors.modal }
      >
        <GestureHandlerRootView style={ { flex: 1 } }>
          <ImageViewer
            imageUrl={ modalSrc }
            width={ theme.dimensions.width }
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
