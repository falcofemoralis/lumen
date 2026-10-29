import { CommentInterface, CommentTextType } from 'Type/Comment.interface';
import { CommentListInterface } from 'Type/CommentList.interface';
import { anixartReleaseId, requestAnixart } from './AnixartApi';

export interface AnixartComment {
  id: number;
  profile?: { login?: string; avatar?: string };
  message: string;
  timestamp: number;
  likes_count?: number;
  vote_count?: number;
  is_spoiler?: boolean;
  is_deleted?: boolean;
  parent_comment_id?: number | null;
}
interface CommentsResponse {
  code: number;
  content?: AnixartComment[];
  total_count?: number;
  total_page_count?: number;
}
export const normalizeAnixartComment = (comment: AnixartComment): CommentInterface => ({
  id: String(comment.id),
  username: comment.profile?.login ?? 'Anixart',
  avatar: comment.profile?.avatar ?? '',
  text: [{ type: comment.is_spoiler ? CommentTextType.SPOILER : CommentTextType.REGULAR, text: comment.message }],
  date: Number.isFinite(comment.timestamp) ? new Date(comment.timestamp * 1000).toLocaleString() : '',
  indent: comment.parent_comment_id ? 1 : 0,
  likes: Math.max(0, comment.likes_count ?? comment.vote_count ?? 0),
  isDisabled: true,
  isControls: false,
});
export const getAnixartComments = async (link: string, page: number, refresh = false): Promise<CommentListInterface> => {
  const releaseId = anixartReleaseId(link);
  const data = await requestAnixart<CommentsResponse>(`/release/comment/all/${releaseId}/${Math.max(0, page - 1)}?sort=1`, undefined, refresh);
  const content = data.content ?? [];
  // The API exposes the last zero-based page index, not the number of pages.
  const totalPages = data.total_count !== undefined
    ? Math.max(page, Math.ceil(data.total_count / 25))
    : content.length ? Math.max(page, (data.total_page_count ?? page - 1) + 1) : page;
  return { items: content.filter(comment => !comment.is_deleted).map(normalizeAnixartComment), totalPages };
};