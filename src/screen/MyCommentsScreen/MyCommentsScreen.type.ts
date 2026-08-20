import { ThemedOverlayRef } from 'Component/ThemedOverlay/ThemedOverlay.type';
import { RefObject } from 'react';
import { LocalCommentInterface } from 'Type/LocalComment.interface';
import { CommentSegmentInterface } from 'Util/LocalComments/tags';

/**
 * A stored comment with its timestamp formatted for the current language and
 * its body resolved from the raw BBCode it was posted as.
 */
export type MyCommentItem = LocalCommentInterface & {
  date: string;
  segments: CommentSegmentInterface[];
};

export interface MyCommentsScreenComponentProps {
  items: MyCommentItem[];
  forgetConfirmOverlayRef: RefObject<ThemedOverlayRef | null>;
  /** Opens the film the comment was written on -- all the service allows from here */
  handleOnPress: (item: MyCommentItem) => void;
  openForgetConfirmOverlay: (item: MyCommentItem) => void;
  forgetComment: () => void;
}

export interface MyCommentRowProps {
  item: MyCommentItem;
  index: number;
  handleOnPress: (item: MyCommentItem) => void;
  openForgetConfirmOverlay: (item: MyCommentItem) => void;
}
