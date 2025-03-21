import ThemedImage from 'Component/ThemedImage';
import ThemedOverlay from 'Component/ThemedOverlay';
import { useRef } from 'react';
import { Dimensions, TouchableHighlight, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import OverlayStore from 'Store/Overlay.store';
import { generateId } from 'Util/Math';

import ImageViewer from './ImageViewer';
import { styles } from './ThemedImageModal.style';
import { ThemedImageModalComponentProps } from './ThemedImageModal.type';

export const ThemedImageModalComponent = ({
  src,
  modalSrc,
  style,
  imageStyle,
}: ThemedImageModalComponentProps) => {
  const id = useRef(generateId());
  const { width } = Dimensions.get('window');
  const height = width / (166 / 250);

  const renderOverlay = () => {
    if (!modalSrc) {
      return null;
    }

    return (
      <ThemedOverlay
        style={ styles.modal }
        contentContainerStyle={ styles.modalContentContainer }
        id={ id.current }
        onHide={ () => OverlayStore.closeOverlay(id.current) }
      >
        <GestureHandlerRootView style={ { flex: 1 } }>
          <ImageViewer
            imageUrl={ modalSrc }
            width={ width }
            height={ height }
            onRequestClose={ () => OverlayStore.closeOverlay(id.current) }
          />
        </GestureHandlerRootView>
      </ThemedOverlay>
    );
  };

  return (
    <View style={ style }>
      <TouchableHighlight
        onPress={ () => OverlayStore.openOverlay(id.current) }
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
