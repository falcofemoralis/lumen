import Comments from 'Component/Comments';
import { CommentsRef } from 'Component/Comments/Comments.container';
import ThemedOverlay from 'Component/ThemedOverlay';
import { useCallback, useRef } from 'react';

import { CommentsOverlayComponentProps } from './CommentsOverlay.type';
import { ScrollView } from 'react-native';

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
      onOpen={ onOverlayVisible }
      onClose={ onClose }
      transparent
    >
      <ScrollView
        horizontal
        contentContainerStyle={ { width: '100%', height: '100%' } }
      >
        <Comments
          style={ contentStyle }
          film={ film }
          loaderFullScreen
        />
      </ScrollView>
    </ThemedOverlay>
  );
};

export default CommentsOverlayComponent;