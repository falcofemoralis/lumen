import Comments from 'Component/Comments';
import { CommentsRef } from 'Component/Comments/Comments.container';
import ThemedOverlay from 'Component/ThemedOverlay';
import { useCallback, useRef } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

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
  const commentsRef = useRef<CommentsRef>(null);

  const onOverlayVisible = useCallback(() => {
    commentsRef.current?.loadComments();
  }, []);

  return (
    <ThemedOverlay
      ref={ overlayRef }
      style={ style }
      containerStyle={ containerStyle }
      contentContainerStyle={ contentContainerStyle }
      onShow={ onOverlayVisible }
      onClose={ onClose }
      transparent
    >
      <SafeAreaView style={ { flex: 1 } }>
        <Comments
          ref={ commentsRef }
          style={ contentStyle }
          film={ film }
          loaderFullScreen
        />
      </SafeAreaView>
    </ThemedOverlay>
  );
};

export default CommentsOverlayComponent;