import Comments from 'Component/Comments';
import { CommentsRef } from 'Component/Comments/Comments.container';
import ThemedOverlay from 'Component/ThemedOverlay';
import ThemedSafeArea from 'Component/ThemedSafeArea';
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
      onShow={ onOverlayVisible }
      onClose={ onClose }
      transparent
    >
      <ThemedSafeArea edges={ ['top', 'bottom', 'left', 'right'] }>
        <Comments
          ref={ commentsRef }
          style={ contentStyle }
          film={ film }
          loaderFullScreen
        />
      </ThemedSafeArea>
    </ThemedOverlay>
  );
};

export default CommentsOverlayComponent;