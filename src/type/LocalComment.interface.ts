/**
 * A comment the user posted, kept on the device: the service exposes no way to
 * read back what this account has written, so the only record of it is the one
 * made at posting time.
 */
export interface LocalCommentInterface {
  /** local id -- the service does not return one for a freshly posted comment */
  id: string;
  filmId: string;
  link: string;
  poster: string;
  title: string;
  /** the raw text that was sent, tags and all */
  text: string;
  /** username of the comment this one answered, when it was a reply */
  replyToUsername?: string;
  createdAt: number;
}
