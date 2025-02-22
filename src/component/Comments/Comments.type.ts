import { CommentInterface } from 'Type/Comment.interface';
import { FilmInterface } from 'Type/Film.interface';

export interface CommentsContainerProps {
  film: FilmInterface;
}

export interface CommentsComponentProps {
  comments: CommentInterface[];
  onNextLoad: (isRefresh: boolean) => Promise<void>;
}

export interface CommentItemProps {
  comment: CommentInterface;
  idx: number;
}
