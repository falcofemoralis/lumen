import { CommentInterface } from './Comment.interface';

export interface CommentListInterface {
  items: CommentInterface[];
  totalPages: number;
}
