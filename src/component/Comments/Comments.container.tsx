import { useMutation } from '@tanstack/react-query';
import { useConfigContext } from 'Context/ConfigContext';
import { useServiceContext } from 'Context/ServiceContext';
import * as Haptics from 'expo-haptics';
import { usePaginatedQuery } from 'Hooks/usePaginatedQuery';
import { t } from 'i18n/translate';
import { forwardRef, useCallback, useImperativeHandle, useState } from 'react';
import NotificationStore from 'Store/Notification.store';
import { CommentInterface } from 'Type/Comment.interface';
import { addLocalComment } from 'Util/LocalComments';
import { queryKeys } from 'Util/Query';

import CommentsComponent from './Comments.component';
import CommentsComponentTV from './Comments.component.atv';
import { getCommentId } from './Comments.config';
import { CommentsContainerProps } from './Comments.type';

export type CommentsRef = {
  loadComments: () => void;
};

export const CommentsContainer = forwardRef<CommentsRef, CommentsContainerProps>(
  ({ film, loaderFullScreen, style, initialLoad, disableRefresh, sheetRef }, ref) => {
    const { isTV, commentPostingMobile, commentPostingTV } = useConfigContext();
    const { id } = film;
    const { isSignedIn, currentService } = useServiceContext();
    // Posting needs an account, and the user can switch the whole thing off per
    // device - this gates the composer and every reply entry point with it.
    const canPostComments = isSignedIn && (isTV ? commentPostingTV : commentPostingMobile);
    // comments are only fetched once the overlay that hosts them is opened
    const [isStarted, setIsStarted] = useState(!!initialLoad);
    // the comment the mobile composer is currently answering
    const [replyTo, setReplyTo] = useState<CommentInterface | null>(null);

    const {
      itemsOrNull: comments,
      isFetching,
      onNextLoad,
      updateItems,
      refresh,
    } = usePaginatedQuery<CommentInterface>({
      queryKey: queryKeys.comments(id),
      fetchPage: (page) => currentService.getComments(id, page),
      enabled: isStarted,
    });

    const handleStartLoad = useCallback(() => {
      setIsStarted(true);
    }, []);

    useImperativeHandle(ref, () => ({
      loadComments: handleStartLoad,
    }), [handleStartLoad]);

    const { mutate: postLike } = useMutation({
      mutationFn: (commentId: string) => currentService.postLike(commentId),
      onSuccess: ({ type }, commentId) => {
        updateItems((pageItems) => pageItems.map((comment) => {
          if (comment.id !== commentId) {
            return comment;
          }

          const likes = type === 'plus' ? comment.likes + 1 : comment.likes - 1;

          return { ...comment, likes, isDisabled: type === 'plus' };
        }));
      },
    });

    const handlePostLike = useCallback((commentId: string) => {
      if (!isSignedIn) {
        return;
      }

      if (isTV) {
        NotificationStore.displayMessage(t('Liked'));
      } else {
        Haptics.performAndroidHapticsAsync(Haptics.AndroidHaptics.Gesture_Start);
      }

      postLike(commentId);
    }, [isSignedIn, isTV, postLike]);

    // The reply target reaches the mutation as an id only. On TV that id is the
    // one the service knows, which a split comment carries as `originalId` --
    // `getCommentId` resolves both forms.
    const findUsername = (commentId: string) => comments?.find(
      (comment) => getCommentId(comment) === commentId
    )?.username;

    const { mutateAsync: postComment, isPending: isPosting } = useMutation({
      mutationFn: ({ text, replyToId }: { text: string; replyToId?: string }) => {
        return currentService.postComment(id, text, replyToId);
      },
      onSuccess: (result, { text, replyToId }) => {
        setReplyTo(null);
        // The service offers no way to list what this account has written, so
        // the comment is only ever recoverable from what is kept here.
        addLocalComment(film, text, replyToId ? findUsername(replyToId) : undefined);
        NotificationStore.displayMessage(result ?? t('Comment posted'));

        // the service assigns the id and the date, so the new comment can only
        // come from a re-read of the first page
        refresh();
      },
      onError: (error) => {
        NotificationStore.displayError(error as Error);
      },
    });

    /**
     * Resolves only once the comment is in - the forms keep the typed text on a
     * failure and clear it on success, so the user never has to retype it.
     */
    const handlePostComment = useCallback(async (text: string, replyToId?: string) => {
      const message = text.trim();

      if (!canPostComments || !message) {
        throw new Error('Cannot post an empty comment');
      }

      await postComment({ text: message, replyToId });
    }, [canPostComments, postComment]);

    const handleReply = useCallback((comment: CommentInterface | null) => {
      if (!canPostComments) {
        return;
      }

      setReplyTo(comment);
    }, [canPostComments]);

    const containerProps = {
      comments,
      style,
      isLoading: isFetching,
      loaderFullScreen,
      disableRefresh,
      sheetRef,
      canPostComments,
      isPosting,
      replyTo,
      onNextLoad,
      handleStartLoad,
      handlePostLike,
      handleReply,
      handlePostComment,
    };

    return isTV ? <CommentsComponentTV { ...containerProps } /> : <CommentsComponent { ...containerProps } />;
  }
);

export default CommentsContainer;
