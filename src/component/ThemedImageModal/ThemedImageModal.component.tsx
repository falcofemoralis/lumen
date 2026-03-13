import { ThemedImage } from 'Component/ThemedImage';
import { ThemedPressable } from 'Component/ThemedPressable';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import { ArrowLeft } from 'lucide-react-native';
import { useState } from 'react';
import { Modal, TouchableHighlight, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from 'Theme/context';

import ImageViewer from './ImageViewer';
import { componentStyles } from './ThemedImageModal.style';
import { ThemedImageModalComponentProps } from './ThemedImageModal.type';

export const ThemedImageModalComponent = ({
  src,
  modalSrc,
  style,
  imageStyle,
}: ThemedImageModalComponentProps) => {
  const { scale, theme } = useAppTheme();
  const height = theme.dimensions.width / (166 / 250);
  const [isOpened, setIsOpened] = useState(false);
  const { top } = useSafeAreaInsets();
  const styles = useThemedStyles(componentStyles);

  const handleOpen = () => setIsOpened(true);
  const handleClose = () => setIsOpened(false);

  const renderCloseButton = () => {
    return (
      <ThemedPressable
        style={ [styles.topActionsButton, { top: top + styles.topActionsButton.top }] }
        contentStyle={ styles.topActionsButtonContent }
        onPress={ handleClose }
      >
        <ArrowLeft
          size={ scale(24) }
          color={ theme.colors.icon }
        />
      </ThemedPressable>
    );
  };

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
        <GestureHandlerRootView style={ styles.wrapper }>
          { renderCloseButton() }
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
