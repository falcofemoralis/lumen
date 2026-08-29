import { ThemedButton } from 'Component/ThemedButton';
import { ThemedOverlay } from 'Component/ThemedOverlay';
import { ThemedOverlayRef } from 'Component/ThemedOverlay/ThemedOverlay.type';
import { ThemedText } from 'Component/ThemedText';
import { t } from 'i18n/translate';
import Reply from 'lucide-react-native/icons/reply';
import ThumbsUp from 'lucide-react-native/icons/thumbs-up';
import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { View } from 'react-native';
import { ThemedStyles } from 'Theme/types';
import { CommentInterface } from 'Type/Comment.interface';

import { CommentForm } from './CommentForm.atv';
import { getCommentId } from './Comments.config';
import { componentStyles } from './Comments.style.atv';

export type CommentActionsRef = {
  open: (comment: CommentInterface) => void;
};

export interface CommentActionsProps {
  isPosting: boolean;
  styles: ThemedStyles<typeof componentStyles>;
  handlePostLike: (commentId: string) => void;
  handlePostComment: (text: string, replyToId?: string) => Promise<void>;
}

/**
 * The TV counterpart of the per-comment reply button: a D-Pad long press on a
 * comment opens this menu, and picking "Reply" swaps it for a compose overlay.
 * Two overlays rather than one so the menu keeps holding "Like" as well - the
 * comment itself only has the short press, which reveals its spoilers.
 */
export const CommentActions = forwardRef<CommentActionsRef, CommentActionsProps>(({
  isPosting,
  styles,
  handlePostLike,
  handlePostComment,
}, ref) => {
  const menuRef = useRef<ThemedOverlayRef>(null);
  const replyRef = useRef<ThemedOverlayRef>(null);
  const [comment, setComment] = useState<CommentInterface | null>(null);

  useImperativeHandle(ref, () => ({
    open: (target: CommentInterface) => {
      setComment(target);
      menuRef.current?.open();
    },
  }), []);

  const onReply = () => {
    // The overlay hands its restore target down to whatever takes focus from it
    // while it closes, so the reply overlay still lands back on the comment.
    menuRef.current?.close();
    replyRef.current?.open();
  };

  const onLike = () => {
    if (comment) {
      handlePostLike(getCommentId(comment));
    }

    menuRef.current?.close();
  };

  const renderMenu = () => (
    <ThemedOverlay
      ref={ menuRef }
      contentContainerStyle={ styles.actionsOverlay }
    >
      <View style={ styles.actions }>
        <ThemedText
          style={ styles.actionsTitle }
          numberOfLines={ 1 }
        >
          { comment?.username }
        </ThemedText>
        <ThemedButton
          title={ t('Reply') }
          IconComponent={ Reply }
          style={ styles.actionButton }
          onPress={ onReply }
        />
        <ThemedButton
          title={ comment?.isDisabled ? t('Liked') : t('Like') }
          IconComponent={ ThumbsUp }
          style={ styles.actionButton }
          onPress={ onLike }
        />
      </View>
    </ThemedOverlay>
  );

  const renderReply = () => (
    <ThemedOverlay
      ref={ replyRef }
      contentContainerStyle={ styles.replyOverlay }
      useKeyboardAdjustment
    >
      <View style={ styles.replyForm }>
        <ThemedText style={ styles.actionsTitle }>
          { t('Reply to {{username}}', { username: comment?.username ?? '' }) }
        </ThemedText>
        <CommentForm
          isPosting={ isPosting }
          replyTo={ comment }
          styles={ styles }
          handlePostComment={ handlePostComment }
          onPosted={ () => replyRef.current?.close() }
        />
      </View>
    </ThemedOverlay>
  );

  return (
    <>
      { renderMenu() }
      { renderReply() }
    </>
  );
});

export default CommentActions;
