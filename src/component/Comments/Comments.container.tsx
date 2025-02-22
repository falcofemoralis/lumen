import { withTV } from 'Hooks/withTV';
import {
  forwardRef, useEffect, useImperativeHandle, useRef, useState,
} from 'react';
import NotificationStore from 'Store/Notification.store';
import ServiceStore from 'Store/Service.store';
import { CommentInterface } from 'Type/Comment.interface';

import CommentsComponent from './Comments.component';
import { CommentsContainerProps } from './Comments.type';

export type CommentsRef = {
  loadComments: () => void;
};

export const CommentsContainer = forwardRef<CommentsRef, CommentsContainerProps>(
  ({ film }, ref) => {
    const { id } = film;
    const [comments, setComments] = useState<CommentInterface[]>([]);
    const paginationRef = useRef({
      page: 1,
      totalPages: 1,
    });
    const updatingStateRef = useRef(false);

    useEffect(() => {
      loadComments(1);
    }, []);

    useEffect(() => {
      updatingStateRef.current = false;
    }, [comments]);

    useImperativeHandle(ref, () => ({
      loadComments: () => {
        onNextLoad();
      },
    }));

    const loadComments = async (page: number) => {
      const { totalPages } = paginationRef.current;

      if (page > totalPages) {
        return;
      }

      if (!updatingStateRef.current) {
        updatingStateRef.current = true;

        try {
          const {
            items: newItems,
            totalPages: newTotalsPages,
          } = await ServiceStore.getCurrentService().getComments(
            id,
            page,
          );

          paginationRef.current = {
            page,
            totalPages: newTotalsPages,
          };

          setComments([...comments, ...newItems]);
        } catch (error) {
          NotificationStore.displayError(error as Error);
          updatingStateRef.current = false;
        }
      }
    };

    const onNextLoad = async () => {
      const newPage = paginationRef.current.page + 1;

      if (newPage <= paginationRef.current.totalPages) {
        await loadComments(newPage);
      }
    };

    if (!comments.length) {
      return null;
    }

    const containerFunctions = {
      onNextLoad,
    };

    const containerProps = () => ({
      comments,
    });

    return withTV(CommentsComponent, CommentsComponent, {
      ...containerFunctions,
      ...containerProps(),
    });
  },
);

export default CommentsContainer;
