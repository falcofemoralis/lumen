import { useMutation } from '@tanstack/react-query';
import { useIsTV } from 'Context/ConfigContext';
import { useServiceContext } from 'Context/ServiceContext';
import * as Haptics from 'expo-haptics';
import { usePaginatedQuery } from 'Hooks/usePaginatedQuery';
import { t } from 'i18n/translate';
import { forwardRef, useCallback, useImperativeHandle, useState } from 'react';
import NotificationStore from 'Store/Notification.store';
import { CommentInterface } from 'Type/Comment.interface';
import { queryKeys } from 'Util/Query';

import CommentsComponent from './Comments.component';
import CommentsComponentTV from './Comments.component.atv';
import { CommentsContainerProps } from './Comments.type';

export type CommentsRef = {
  loadComments: () => void;
};

export const CommentsContainer = forwardRef<CommentsRef, CommentsContainerProps>(
  ({ film, loaderFullScreen, style, initialLoad, disableRefresh }, ref) => {
    const isTV = useIsTV();
    const { id } = film;
    const { isSignedIn, currentService } = useServiceContext();
    // comments are only fetched once the overlay that hosts them is opened
    const [isStarted, setIsStarted] = useState(!!initialLoad);

    const {
      itemsOrNull: comments,
      isFetching,
      onNextLoad,
      updateItems,
    } = usePaginatedQuery<CommentInterface>({
      queryKey: queryKeys.comments(id),
      fetchPage: (page) => currentService.getComments(id, page),
      enabled: isStarted,
    });

    useImperativeHandle(ref, () => ({
      loadComments: () => {
        setIsStarted(true);
      },
    }));

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

    const containerProps = {
      comments,
      style,
      isLoading: isFetching,
      loaderFullScreen,
      disableRefresh,
      onNextLoad,
      handlePostLike,
    };

    return isTV ? <CommentsComponentTV { ...containerProps } /> : <CommentsComponent { ...containerProps } />;
  }
);

export default CommentsContainer;
