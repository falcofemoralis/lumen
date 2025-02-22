import { CommentTextInterface, CommentTextType } from 'Type/Comment.interface';
import { decodeHtml } from 'Util/Htlm';
import { HTMLElementInterface } from 'Util/Parser';

import { CommentsApiInterface } from '..';
import configApi from './configApi';

export type CommentsResult = {
  comments: string
  last_update_id: string,
  navigation: string,
};

export const commentsApi: CommentsApiInterface = {
  getComments: async (filmId: string, page: number) => {
    const result = await configApi.fetchJson<CommentsResult>('/ajax/get_comments', {
      news_id: filmId,
      cstart: String(page),
      type: '0',
      comment_id: '0',
      skin: 'hdrezka',
    });

    if (!result) {
      throw new Error('Failed to fetch comments');
    }

    const {
      comments: commentsHtml,
      navigation: navigationHtml,
    } = result;

    const commentsRoot = configApi.parseContent(commentsHtml);
    const navigationRoot = configApi.parseContent(navigationHtml);

    const comments = commentsRoot.querySelectorAll('.comments-tree-item')
      .map((comment) => {
        const id = comment.attributes['data-id'];
        const avatar = comment.querySelector('.ava img')?.attributes.src ?? '';
        const username = comment.querySelector('.name')?.rawText ?? '';
        const date = comment.querySelector('.date')?.rawText ?? '';
        const indent = comment.attributes['data-indent'];
        const likes = comment.querySelector('.b-comment__like_it')?.attributes['data-likes_num'];
        const isDisabled = comment.querySelector('.show-likes-comment')?.classList.contains('disabled') ?? false;
        const textElements = comment.querySelector('.text div');

        const text = textElements?.childNodes.reduce<CommentTextInterface[]>((acc, el) => {
          // eslint-disable-next-line functional/no-let
          let type = CommentTextType.REGULAR;

          switch (el.rawTagName) {
            case 'b':
              type = CommentTextType.BOLD;
              break;
            case 'i':
              type = CommentTextType.INCLINED;
              break;
            case 'u':
              type = CommentTextType.UNDERLINE;
              break;
            case 's':
              type = CommentTextType.CROSSED;
              break;
            case 'br':
              type = CommentTextType.BREAK;
              break;
            default:
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              if ((el as any).classList?.contains('text_spoiler')) {
                type = CommentTextType.SPOILER;
              }
              break;
          }

          if (!(el as any).classList?.contains('title_spoiler')) {
            acc.push({
              type,
              text: decodeHtml(el.rawText),
            });
          }

          return acc;
        }, []) ?? [];

        return {
          id,
          avatar,
          username,
          date: date.replace('оставлен ', ''),
          indent: Number(indent),
          likes: Number(likes),
          isDisabled,
          isControls: false,
          text,
        };
      });

    // eslint-disable-next-line functional/no-let
    let totalPages = 1;

    const navs = navigationRoot.querySelectorAll('.b-navigation a');
    if (navs.length > 0) {
      totalPages = Number(navs[navs.length - 2].rawText);
    }

    return {
      items: comments,
      totalPages,
    };
  },
};
