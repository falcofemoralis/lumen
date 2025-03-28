import { StyleProp, ViewStyle } from 'react-native';
import { CommentInterface, CommentTextType } from 'Type/Comment.interface';
import { FilmInterface } from 'Type/Film.interface';

export interface CommentsContainerProps {
  film: FilmInterface;
  loaderFullScreen?: boolean;
  style?: StyleProp<ViewStyle> | undefined;
}

export interface CommentsComponentProps {
  comments: CommentInterface[] | null;
  onNextLoad: () => Promise<void>;
  style?: StyleProp<ViewStyle> | undefined;
  isLoading: boolean;
  loaderFullScreen?: boolean;
}

export interface CommentItemProps {
  comment: CommentInterface;
  idx: number;
  containerWidth?: number;
  lines?: CalculatedLine[];
}

export type CalculatedLine = {
  lines: string[];
  type: CommentTextType;
}

export type CalculatedText = {
  height: number;
  lines: CalculatedLine[] | null;
}
