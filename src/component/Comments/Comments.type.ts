import { ThemedBottomSheetRef } from 'Component/ThemedBottomSheet/ThemedBottomSheet.type';
import { RefObject } from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { CommentInterface, CommentTextType } from 'Type/Comment.interface';
import { FilmInterface } from 'Type/Film.interface';

export interface CommentsContainerProps {
  film: FilmInterface;
  loaderFullScreen?: boolean;
  style?: StyleProp<ViewStyle> | undefined;
  initialLoad?: boolean;
  disableRefresh?: boolean;
  /**
   * Mobile only. Hosts the list in a bottom sheet owned by this component, so the
   * composer can be handed to TrueSheet as its floating `footer` - the only way
   * to keep it on screen at a partly open detent. Without it the list renders
   * plainly and the composer goes above it.
   */
  sheetRef?: RefObject<ThemedBottomSheetRef | null>;
}

export interface CommentsComponentProps {
  comments: CommentInterface[] | null;
  style?: StyleProp<ViewStyle> | undefined;
  isLoading: boolean;
  loaderFullScreen?: boolean;
  disableRefresh?: boolean;
  /** Mobile only - see `CommentsContainerProps.sheetRef` */
  sheetRef?: RefObject<ThemedBottomSheetRef | null>;
  /** Signed in AND the device's comment-posting setting is on */
  canPostComments: boolean;
  isPosting: boolean;
  /** Mobile only - the TV reply overlay carries its own target */
  replyTo: CommentInterface | null;
  onNextLoad: () => Promise<void>;
  /** Begins the first fetch - the sheet fires it as it opens, so the film page does not */
  handleStartLoad: () => void;
  handlePostLike: (commentId: string) => void;
  handleReply: (comment: CommentInterface | null) => void;
  /** Rejects when the post failed, so the caller can keep the text it was given */
  handlePostComment: (text: string, replyToId?: string) => Promise<void>;
}

export interface CommentItemProps {
  comment: CommentInterface;
  idx: number;
  containerWidth?: number;
  lines?: CalculatedLine[];
  handlePostLike: (commentId: string) => void;
  /** Mobile: fills the composer. TV: opens the long-press action menu. */
  handleReply: (comment: CommentInterface) => void;
  canPostComments: boolean;
}

/**
 * A comment too tall to fit the TV screen is rendered as several items, each with
 * its own synthetic `id`. Actions still have to target the comment the service
 * knows about, so the real one is carried alongside.
 */
export type SplitCommentInterface = CommentInterface & { originalId?: string };

export type CalculatedLine = {
  lines: string[];
  type: CommentTextType;
  totalHeight: number;
}

export type CalculatedText = {
  height: number;
  lineHeight: number;
  lines: CalculatedLine[] | null;
}
