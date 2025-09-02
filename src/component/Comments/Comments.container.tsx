import { useServiceContext } from 'Context/ServiceContext';
import { withTV } from 'Hooks/withTV';
import {
  forwardRef, useEffect, useImperativeHandle, useRef, useState,
} from 'react';
import NotificationStore from 'Store/Notification.store';
import { CommentInterface } from 'Type/Comment.interface';

import CommentsComponent from './Comments.component';
import CommentsComponentTV from './Comments.component.atv';
import { CommentsContainerProps } from './Comments.type';

export type CommentsRef = {
  loadComments: () => void;
};

export const CommentsContainer = forwardRef<CommentsRef, CommentsContainerProps>(
  ({ film, loaderFullScreen, style }, ref) => {
    const { id } = film;
    const [comments, setComments] = useState<CommentInterface[] | null>(null);
    const paginationRef = useRef({
      page: 1,
      totalPages: 1,
    });
    const updatingStateRef = useRef(false);
    const [isLoading, setIsLoading] = useState(false);
    const { getCurrentService } = useServiceContext();

    useEffect(() => {
      updatingStateRef.current = false;
    }, [comments]);

    useImperativeHandle(ref, () => ({
      loadComments: () => {
        loadComments(1);
      },
    }));

    const loadComments = async (page: number) => {
      const { totalPages } = paginationRef.current;

      if (page > totalPages) {
        return;
      }

      if (!updatingStateRef.current) {
        updatingStateRef.current = true;
        setIsLoading(true);

        try {
          const {
            items: newItems,
            totalPages: newTotalsPages,
          } = await getCurrentService().getComments(
            id,
            page
          );

          paginationRef.current = {
            page,
            totalPages: newTotalsPages,
          };

          setComments([...(comments ?? []), ...newItems]);
        } catch (error) {
          NotificationStore.displayError(error as Error);
          updatingStateRef.current = false;
        } finally {
          setIsLoading(false);
        }
      }
    };

    const onNextLoad = async () => {
      const newPage = paginationRef.current.page + 1;

      if (newPage <= paginationRef.current.totalPages) {
        await loadComments(newPage);
      }
    };

    const containerFunctions = {
      onNextLoad,
    };

    const containerProps = () => ({
      comments,
      style,
      isLoading,
      loaderFullScreen,
    });

    return withTV(CommentsComponentTV, CommentsComponent, {
      ...containerFunctions,
      ...containerProps(),
    });
  }
);

export default CommentsContainer;
