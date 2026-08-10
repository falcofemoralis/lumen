import { Comments } from 'Component/Comments';
import { ThemedOverlay } from 'Component/ThemedOverlay';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CommentsOverlayComponentProps } from './CommentsOverlay.type';

export const CommentsOverlayComponent = ({
  overlayRef,
  film,
  style,
  containerStyle,
  contentStyle,
  contentContainerStyle,
  onClose,
}: CommentsOverlayComponentProps) => {
  const { right, left } = useSafeAreaInsets();

  return (
    <ThemedOverlay
      ref={ overlayRef }
      style={ style }
      containerStyle={ containerStyle }
      contentContainerStyle={ [{ right: left > 0 ? left : right }, contentContainerStyle] }
      onClose={ onClose }
      transparent
    >
      <Comments
        style={ contentStyle }
        film={ film }
        initialLoad
        loaderFullScreen
      />
    </ThemedOverlay>
  );
};

export default CommentsOverlayComponent;