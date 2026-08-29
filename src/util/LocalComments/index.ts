import { FilmInterface } from 'Type/Film.interface';
import { LocalCommentInterface } from 'Type/LocalComment.interface';
import { uuid } from 'Util/Download';
import { storage } from 'Util/Storage';

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

  saveLocalComments(prependComment(getLocalComments(), {
    // `uuid` is short enough to repeat, the timestamp keeps the pair unique
    id: `${createdAt}-${uuid()}`,
    filmId: film.id,
    link: film.link,
    poster: film.poster,
    title: film.title,
    text,
    replyToUsername,
    createdAt,
  }));
};

export const removeLocalComment = (commentId: string) => {
  saveLocalComments(removeComment(getLocalComments(), commentId));
};
