export enum CommentTextType {
  REGULAR = 'REGULAR',
  SPOILER = 'SPOILER',
  BOLD = 'BOLD',
  INCLINED = 'INCLINED',
  UNDERLINE = 'UNDERLINE',
  CROSSED = 'CROSSED',
  BREAK = 'BREAK',
}

export interface CommentTextInterface {
  type: CommentTextType;
  text: string;
}

export interface CommentInterface {
  id: string;
  avatar: string;
  username: string;
  text: CommentTextInterface[];
  date: string;
  indent: number;
  likes: number;
  isDisabled: boolean;
  isControls: boolean;
}
