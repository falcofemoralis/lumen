import { FilmInterface } from 'Type/Film.interface';
import { LocalCommentInterface } from 'Type/LocalComment.interface';
import { uuid } from 'Util/Download';
import { storage } from 'Util/Storage';
import { mutateCloudSync } from 'Util/CloudSync';

import { parseCommentsList, prependComment, removeComment } from './logic';

export { parseCommentsList } from './logic';

export const LOCAL_COMMENTS_KEY = 'localComments';

const getCommentsStorage = () => storage.getCommentsStorage();

export const getLocalComments = (): LocalCommentInterface[] => (
  parseCommentsList(getCommentsStorage().loadString(LOCAL_COMMENTS_KEY))
);

const saveLocalComments = (items: LocalCommentInterface[]) => {
  getCommentsStorage().save(LOCAL_COMMENTS_KEY, items);
};

export const replaceLocalComments = (items: LocalCommentInterface[]): void => {
  saveLocalComments(items);
};

/**
 * Records a comment the user has just posted. Called after the service accepted
 * it, so the list only ever holds comments that actually went through.
 */
export const addLocalComment = (
  film: Pick<FilmInterface, 'id' | 'link' | 'poster' | 'title'>,
  text: string,
  replyToUsername?: string
) => {
  const createdAt = Date.now();

  const comment: LocalCommentInterface = {
    // `uuid` is short enough to repeat, the timestamp keeps the pair unique
    id: `${createdAt}-${uuid()}`,
    filmId: film.id,
    link: film.link,
    poster: film.poster,
    title: film.title,
    text,
    replyToUsername,
    createdAt,
  };

  saveLocalComments(prependComment(getLocalComments(), comment));

  mutateCloudSync({
    entity: 'comment',
    id: comment.id,
    value: comment,
    updatedAt: comment.createdAt,
  });
};

export const removeLocalComment = (commentId: string) => {
  saveLocalComments(removeComment(getLocalComments(), commentId));

  mutateCloudSync({
    entity: 'comment',
    id: commentId,
    deleted: true,
  });
};
