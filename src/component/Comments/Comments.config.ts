import Bold from 'lucide-react-native/icons/bold';
import EyeOff from 'lucide-react-native/icons/eye-off';
import Italic from 'lucide-react-native/icons/italic';
import Strikethrough from 'lucide-react-native/icons/strikethrough';
import Underline from 'lucide-react-native/icons/underline';

import { SplitCommentInterface } from './Comments.type';

export const MEASURE_TEXT_STRING = 'йцукенЙЦУКЕН,.;';

/** The BBCode the service reads back out of a comment's body */
export const COMMENT_TAGS = [
  { tag: 'b', IconComponent: Bold },
  { tag: 'i', IconComponent: Italic },
  { tag: 'u', IconComponent: Underline },
  { tag: 's', IconComponent: Strikethrough },
  { tag: 'spoiler', IconComponent: EyeOff },
] as const;

export type CommentTag = typeof COMMENT_TAGS[number]['tag'];

export const COMMENT_MAX_LENGTH = 5000;

/** Half-open first, so the film page stays partly visible behind the sheet */
export const COMMENTS_SHEET_DETENTS = [0.6, 1] as const;

/** The id the service knows, even when the item is one slice of a split comment */
export const getCommentId = (comment: SplitCommentInterface) => comment.originalId ?? comment.id;
