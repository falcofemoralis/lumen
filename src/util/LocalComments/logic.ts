import { LocalCommentInterface } from 'Type/LocalComment.interface';
import { safeJsonParse } from 'Util/Json';

export const parseCommentsList = (raw: string | null | undefined): LocalCommentInterface[] => {
  const items = safeJsonParse<LocalCommentInterface[]>(raw);

  return Array.isArray(items) ? items : [];
};

export const prependComment = (
  items: LocalCommentInterface[],
  comment: LocalCommentInterface
): LocalCommentInterface[] => [comment, ...items];

export const removeComment = (
  items: LocalCommentInterface[],
  commentId: string
): LocalCommentInterface[] => items.filter((item) => item.id !== commentId);
