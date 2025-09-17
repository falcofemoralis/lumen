import Comments from 'Component/Comments';
import { CommentsRef } from 'Component/Comments/Comments.container';
import ThemedOverlay from 'Component/ThemedOverlay';
import { useCallback, useRef } from 'react';

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
      onOpen={ onOverlayVisible }
      onClose={ onClose }
    >
      <Comments
        ref={ commentsRef }
        style={ contentStyle }
        film={ film }
      />
    </ThemedOverlay>
  );
};

export default CommentsOverlayComponent;